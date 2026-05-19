/**
 * Server-side storage for careers applications, payments, and résumé files.
 */
const fs = require("fs");
const path = require("path");

function createCareersApiRouter(express, dataRoot) {
  const router = express.Router();
  const DATA_DIR = path.join(dataRoot, "data");
  const APPS_FILE = path.join(DATA_DIR, "careers-applications.json");
  const PAY_FILE = path.join(DATA_DIR, "careers-payments.json");
  const RESUMES_DIR = path.join(DATA_DIR, "resumes");

  function ensureDataDirs() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(RESUMES_DIR)) fs.mkdirSync(RESUMES_DIR, { recursive: true });
    if (!fs.existsSync(APPS_FILE)) fs.writeFileSync(APPS_FILE, "[]", "utf8");
    if (!fs.existsSync(PAY_FILE)) fs.writeFileSync(PAY_FILE, "[]", "utf8");
  }

  function readJson(file) {
    ensureDataDirs();
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      return [];
    }
  }

  function writeJson(file, data) {
    ensureDataDirs();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  }

  function paymentLinkedToApplication(pay, apps) {
    if (!pay || !pay.id) return false;
    if (pay.usageStatus === "used") return true;
    return apps.some(function (a) {
      return a.feePayment && a.feePayment.paymentRecordId === pay.id;
    });
  }

  function findPayment(list, id) {
    return list.find(function (x) {
      return x.id === id;
    });
  }

  function markPaymentUsed(payments, payId, applicationId, channel) {
    const idx = payments.findIndex(function (x) {
      return x.id === payId;
    });
    if (idx < 0) return null;
    payments[idx].usageStatus = "used";
    payments[idx].usedForApplicationId = applicationId;
    payments[idx].usedAt = new Date().toISOString();
    payments[idx].applicationChannel = channel || "online";
    return payments[idx];
  }

  function safeResumeFileName(appId, originalName) {
    const base = path.basename(originalName || "resume.pdf").replace(/[^\w.\-]+/g, "_");
    return appId + "_" + base;
  }

  function storeResume(appId, resume) {
    if (!resume || !resume.dataUrl || typeof resume.dataUrl !== "string") {
      return {
        name: (resume && resume.name) || "",
        size: (resume && resume.size) || 0,
        type: (resume && resume.type) || "",
        storedOnServer: false,
      };
    }
    const match = resume.dataUrl.match(/^data:([^;]*);base64,(.+)$/);
    if (!match) {
      return {
        name: resume.name || "",
        size: resume.size || 0,
        type: resume.type || "",
        storedOnServer: false,
      };
    }
    const buf = Buffer.from(match[2], "base64");
    const fileName = safeResumeFileName(appId, resume.name);
    const filePath = path.join(RESUMES_DIR, fileName);
    fs.writeFileSync(filePath, buf);
    return {
      name: resume.name || fileName,
      size: resume.size || buf.length,
      type: resume.type || match[1] || "application/octet-stream",
      storedOnServer: true,
      fileName: fileName,
    };
  }

  router.get("/applications", function (req, res) {
    res.json(readJson(APPS_FILE));
  });

  router.post("/applications", function (req, res) {
    const body = req.body;
    if (!body || !body.id) {
      return res.status(400).json({ success: false, message: "Missing application id" });
    }
    const payId = body.feePayment && body.feePayment.paymentRecordId;
    if (!payId) {
      return res.status(400).json({
        success: false,
        message: "Application fee payment is required (one ₹100 payment per application).",
      });
    }
    const payments = readJson(PAY_FILE);
    const apps = readJson(APPS_FILE);
    const pay = findPayment(payments, payId);
    if (!pay) {
      return res.status(400).json({ success: false, message: "Payment record not found. Please pay the ₹100 fee again." });
    }
    if (paymentLinkedToApplication(pay, apps)) {
      return res.status(409).json({
        success: false,
        message: "This payment was already used for an application. Please pay ₹100 again for a new application.",
        usedForApplicationId: pay.usedForApplicationId || null,
      });
    }
    const channel = body.applicationChannel || (body.resume ? "online" : "offline");
    const storedResume = storeResume(body.id, body.resume);
    const record = Object.assign({}, body, {
      resume: storedResume,
      applicationChannel: channel,
    });
    const idx = apps.findIndex(function (x) {
      return x.id === record.id;
    });
    if (idx >= 0) apps[idx] = record;
    else apps.unshift(record);
    markPaymentUsed(payments, payId, record.id, channel);
    writeJson(APPS_FILE, apps);
    writeJson(PAY_FILE, payments);
    res.json({ success: true, id: record.id, paymentConsumed: true });
  });

  router.patch("/applications/:id", function (req, res) {
    const id = req.params.id;
    const list = readJson(APPS_FILE);
    const idx = list.findIndex(function (x) {
      return x.id === id;
    });
    if (idx < 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (req.body && req.body.status) list[idx].status = req.body.status;
    writeJson(APPS_FILE, list);
    res.json({ success: true, application: list[idx] });
  });

  router.delete("/applications/:id", function (req, res) {
    const id = req.params.id;
    let list = readJson(APPS_FILE);
    const app = list.find(function (x) {
      return x.id === id;
    });
    if (app && app.resume && app.resume.fileName) {
      const fp = path.join(RESUMES_DIR, app.resume.fileName);
      try {
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      } catch (e) {}
    }
    list = list.filter(function (x) {
      return x.id !== id;
    });
    writeJson(APPS_FILE, list);
    res.json({ success: true });
  });

  router.get("/applications/:id/resume", function (req, res) {
    const id = req.params.id;
    const list = readJson(APPS_FILE);
    const app = list.find(function (x) {
      return x.id === id;
    });
    if (!app || !app.resume || !app.resume.storedOnServer || !app.resume.fileName) {
      return res.status(404).send("Resume not found");
    }
    const filePath = path.join(RESUMES_DIR, app.resume.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Resume file missing");
    }
    const type = app.resume.type || "application/octet-stream";
    res.setHeader("Content-Type", type);
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + (app.resume.name || "resume") + '"'
    );
    res.sendFile(filePath);
  });

  router.get("/payments", function (req, res) {
    res.json(readJson(PAY_FILE));
  });

  router.post("/payments", function (req, res) {
    const body = req.body;
    if (!body || !body.id) {
      return res.status(400).json({ success: false, message: "Missing payment id" });
    }
    const list = readJson(PAY_FILE);
    const idx = list.findIndex(function (x) {
      return x.id === body.id;
    });
    const record = Object.assign({}, body, {
      usageStatus: body.usageStatus || "available",
    });
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], record);
    else list.unshift(record);
    writeJson(PAY_FILE, list);
    res.json({ success: true, id: body.id });
  });

  router.get("/payments/:id", function (req, res) {
    const id = req.params.id;
    const payments = readJson(PAY_FILE);
    const apps = readJson(APPS_FILE);
    const pay = findPayment(payments, id);
    if (!pay) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    const used = paymentLinkedToApplication(pay, apps);
    res.json({
      success: true,
      payment: pay,
      available: !used,
      usedForApplicationId: pay.usedForApplicationId || null,
    });
  });

  router.post("/payments/:id/consume", function (req, res) {
    const payId = req.params.id;
    const body = req.body || {};
    const applicationId = body.applicationId;
    const channel = body.applicationChannel || body.channel || "offline";
    if (!applicationId) {
      return res.status(400).json({ success: false, message: "Missing applicationId" });
    }
    const payments = readJson(PAY_FILE);
    const apps = readJson(APPS_FILE);
    const pay = findPayment(payments, payId);
    if (!pay) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    if (paymentLinkedToApplication(pay, apps)) {
      return res.status(409).json({
        success: false,
        message: "This payment was already used for an application.",
        usedForApplicationId: pay.usedForApplicationId || null,
      });
    }
    if (body.application && typeof body.application === "object") {
      const appBody = Object.assign({}, body.application, {
        id: applicationId,
        applicationChannel: channel,
        feePayment: Object.assign({}, body.application.feePayment || {}, {
          paymentRecordId: payId,
          transactionReference: pay.reference || "",
          paymentMethod: pay.method || "",
          amount: pay.amount != null ? pay.amount : 100,
          currency: pay.currency || "INR",
          paidAt: pay.paidAt || "",
        }),
      });
      const storedResume = storeResume(applicationId, appBody.resume);
      const record = Object.assign({}, appBody, { resume: storedResume });
      const aidx = apps.findIndex(function (x) {
        return x.id === applicationId;
      });
      if (aidx >= 0) apps[aidx] = record;
      else apps.unshift(record);
      writeJson(APPS_FILE, apps);
    }
    markPaymentUsed(payments, payId, applicationId, channel);
    writeJson(PAY_FILE, payments);
    res.json({ success: true, paymentRecordId: payId, applicationId: applicationId, channel: channel });
  });

  return router;
}

module.exports = { createCareersApiRouter };
