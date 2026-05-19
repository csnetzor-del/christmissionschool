/**
 * Server-side storage for admission applications, ₹150 fee payments, and uploaded documents.
 */
const fs = require("fs");
const path = require("path");

function createAdmissionsApiRouter(express, dataRoot) {
  const router = express.Router();
  const DATA_DIR = path.join(dataRoot, "data");
  const APPS_FILE = path.join(DATA_DIR, "admissions-applications.json");
  const PAY_FILE = path.join(DATA_DIR, "admissions-payments.json");
  const DOCS_DIR = path.join(DATA_DIR, "admissions-documents");

  function ensureDataDirs() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
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

  function extFromMime(mime, fileName) {
    const fromName = path.extname(fileName || "").toLowerCase();
    if (fromName) return fromName;
    if (!mime) return ".bin";
    if (mime.indexOf("pdf") >= 0) return ".pdf";
    if (mime.indexOf("png") >= 0) return ".png";
    if (mime.indexOf("jpeg") >= 0 || mime.indexOf("jpg") >= 0) return ".jpg";
    return ".bin";
  }

  function safeDocFileName(appId, field, ext) {
    const safeField = String(field || "doc").replace(/[^\w-]+/g, "_");
    return String(appId).replace(/[^\w-]+/g, "_") + "_" + safeField + ext;
  }

  function storeDocuments(appId, documents) {
    if (!Array.isArray(documents)) return [];
    return documents.map(function (doc) {
      if (!doc) return doc;
      const base = {
        field: doc.field,
        label: doc.label,
        fileName: doc.fileName || "",
        size: doc.size || 0,
        type: doc.type || "",
      };
      if (!doc.dataUrl || typeof doc.dataUrl !== "string") {
        if (doc.storedOnServer && doc.serverFileName) {
          return Object.assign({}, base, {
            storedOnServer: true,
            serverFileName: doc.serverFileName,
          });
        }
        return Object.assign({}, base, { storedOnServer: false });
      }
      const match = doc.dataUrl.match(/^data:([^;]*);base64,(.+)$/);
      if (!match) {
        return Object.assign({}, base, { storedOnServer: false });
      }
      const buf = Buffer.from(match[2], "base64");
      const ext = extFromMime(match[1], doc.fileName);
      const serverFileName = safeDocFileName(appId, doc.field, ext);
      const filePath = path.join(DOCS_DIR, serverFileName);
      fs.writeFileSync(filePath, buf);
      return Object.assign({}, base, {
        storedOnServer: true,
        serverFileName: serverFileName,
        size: doc.size || buf.length,
        type: doc.type || match[1] || "application/octet-stream",
      });
    });
  }

  function deleteApplicationDocuments(app) {
    (app.documents || []).forEach(function (doc) {
      if (!doc || !doc.serverFileName) return;
      const fp = path.join(DOCS_DIR, doc.serverFileName);
      try {
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      } catch (e) {}
    });
  }

  router.get("/applications", function (req, res) {
    res.json(readJson(APPS_FILE));
  });

  router.post("/applications", function (req, res) {
    const body = req.body;
    if (!body || !body.id) {
      return res.status(400).json({ success: false, message: "Missing application id" });
    }
    const list = readJson(APPS_FILE);
    const idx = list.findIndex(function (x) {
      return x.id === body.id;
    });
    const storedDocs = storeDocuments(body.id, body.documents);
    const record = Object.assign({}, body, { documents: storedDocs });
    if (idx >= 0) {
      deleteApplicationDocuments(list[idx]);
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    writeJson(APPS_FILE, list);
    res.json({ success: true, id: body.id });
  });

  router.get("/applications/:id/documents/:field", function (req, res) {
    const appId = req.params.id;
    const field = req.params.field;
    const list = readJson(APPS_FILE);
    const app = list.find(function (x) {
      return x.id === appId;
    });
    if (!app) {
      return res.status(404).send("Application not found");
    }
    const doc = (app.documents || []).find(function (d) {
      return d.field === field;
    });
    if (!doc || !doc.storedOnServer || !doc.serverFileName) {
      return res.status(404).send("Document not found");
    }
    const fp = path.join(DOCS_DIR, doc.serverFileName);
    if (!fs.existsSync(fp)) {
      return res.status(404).send("File missing on server");
    }
    const safeName = (doc.fileName || doc.serverFileName).replace(/[^\w.\-]+/g, "_");
    res.setHeader("Content-Type", doc.type || "application/octet-stream");
    res.setHeader("Content-Disposition", 'inline; filename="' + safeName + '"');
    fs.createReadStream(fp).pipe(res);
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
    const list = readJson(APPS_FILE);
    const app = list.find(function (x) {
      return x.id === id;
    });
    if (app) deleteApplicationDocuments(app);
    const next = list.filter(function (x) {
      return x.id !== id;
    });
    writeJson(APPS_FILE, next);
    res.json({ success: true });
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
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], body);
    else list.unshift(body);
    writeJson(PAY_FILE, list);
    res.json({ success: true, id: body.id });
  });

  router.delete("/payments/:id", function (req, res) {
    const id = req.params.id;
    const list = readJson(PAY_FILE).filter(function (x) {
      return x.id !== id;
    });
    writeJson(PAY_FILE, list);
    res.json({ success: true });
  });

  return router;
}

module.exports = { createAdmissionsApiRouter };
