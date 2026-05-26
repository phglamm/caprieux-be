const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/authorizedMiddleware");

// ─── User routes (authenticated) ────────────────────────────────────
router.get("/available", authenticateUser, voucherController.getAvailableVouchers);
router.post("/exchange/:id", authenticateUser, voucherController.exchangeVoucher);
router.get("/my", authenticateUser, voucherController.getMyVouchers);
router.get("/my-points", authenticateUser, voucherController.getMyPoints);

// ─── Admin routes ───────────────────────────────────────────────────
router.post("/", authenticateUser, authorizeAdmin, voucherController.createVoucher);
router.get("/", authenticateUser, authorizeAdmin, voucherController.listVouchers);
router.put("/:id", authenticateUser, authorizeAdmin, voucherController.updateVoucher);
router.delete("/:id", authenticateUser, authorizeAdmin, voucherController.deleteVoucher);

module.exports = router;
