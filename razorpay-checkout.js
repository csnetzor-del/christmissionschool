/**
 * Shared Razorpay Checkout helper for admission, careers, and donations.
 */
(function (global) {
  "use strict";

  var SCHOOL_NAME = "Christ Mission School";

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (global.Razorpay) {
        resolve();
        return;
      }
      var s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("Could not load Razorpay checkout"));
      };
      document.head.appendChild(s);
    });
  }

  function parseApiJson(response) {
    return response.text().then(function (text) {
      var trimmed = (text || "").trim();
      if (trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[") {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          throw new Error("Invalid JSON from payment server.");
        }
      }
      if (trimmed.indexOf("<!DOCTYPE") !== -1 || trimmed.indexOf("<html") !== -1) {
        throw new Error(
          "Payment API returned a web page instead of data. " +
            "Redeploy Render with the latest code (razorpay-api.js), then redeploy Netlify zip. " +
            "Test: /api/razorpay/config should show JSON, not a 404 page."
        );
      }
      throw new Error(
        response.status === 404
          ? "Payment API not found (404). Update Render and Netlify deploy."
          : "Unexpected payment server response."
      );
    });
  }

  function createOrder(payload) {
    return fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return parseApiJson(r).then(function (data) {
        if (!r.ok) throw new Error((data && data.message) || "Order failed");
        return data;
      });
    });
  }

  function verifyPayment(response) {
    return fetch("/api/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    }).then(function (r) {
      return parseApiJson(r).then(function (data) {
        if (!r.ok || !data.success) {
          throw new Error((data && data.message) || "Verification failed");
        }
        return data;
      });
    });
  }

  function fetchConfig() {
    return fetch("/api/razorpay/config")
      .then(function (r) {
        return parseApiJson(r);
      })
      .catch(function () {
        return { enabled: false, keyId: "" };
      });
  }

  /**
   * @param {Object} opts
   * @param {number} opts.amount - INR (e.g. 150)
   * @param {string} opts.purpose
   * @param {string} [opts.receipt]
   * @param {Object} [opts.notes]
   * @param {string} [opts.name]
   * @param {string} [opts.email]
   * @param {string} [opts.contact]
   * @param {function} [opts.onDemo] - called when keys not set (demoMode)
   * @param {function} opts.onSuccess - { reference, paymentId, orderId, method }
   * @param {function} [opts.onFailure]
   */
  function openCheckout(opts) {
    opts = opts || {};
    return createOrder({
      amount: opts.amount,
      purpose: opts.purpose,
      receipt: opts.receipt,
      notes: opts.notes,
    }).then(function (orderRes) {
      if (!orderRes.success) {
        throw new Error(orderRes.message || "Could not start payment");
      }
      if (orderRes.demoMode) {
        if (typeof opts.onDemo === "function") {
          opts.onDemo(orderRes);
        }
        return orderRes;
      }
      return loadScript().then(function () {
        return new Promise(function (resolve, reject) {
          var rzp = new global.Razorpay({
            key: orderRes.keyId,
            amount: orderRes.amount,
            currency: orderRes.currency || "INR",
            name: SCHOOL_NAME,
            description: opts.purpose || "Payment",
            order_id: orderRes.orderId,
            prefill: {
              name: opts.name || "",
              email: opts.email || "",
              contact: opts.contact || "",
            },
            theme: { color: "#0B1B3E" },
            handler: function (response) {
              verifyPayment(response)
                .then(function (verified) {
                  var meta = {
                    reference: verified.reference || verified.paymentId,
                    paymentId: verified.paymentId,
                    orderId: verified.orderId,
                    method: "Razorpay",
                  };
                  if (typeof opts.onSuccess === "function") opts.onSuccess(meta);
                  resolve(meta);
                })
                .catch(function (err) {
                  if (typeof opts.onFailure === "function") opts.onFailure(err.message);
                  reject(err);
                });
            },
            modal: {
              ondismiss: function () {
                var err = new Error("Payment cancelled");
                if (typeof opts.onFailure === "function") opts.onFailure("cancelled");
                reject(err);
              },
            },
          });
          rzp.on("payment.failed", function (resp) {
            var msg =
              (resp.error && resp.error.description) || "Payment failed";
            if (typeof opts.onFailure === "function") opts.onFailure(msg);
            reject(new Error(msg));
          });
          rzp.open();
        });
      });
    });
  }

  global.CmsRazorpay = {
    loadScript: loadScript,
    createOrder: createOrder,
    verifyPayment: verifyPayment,
    fetchConfig: fetchConfig,
    openCheckout: openCheckout,
  };
})(typeof window !== "undefined" ? window : this);
