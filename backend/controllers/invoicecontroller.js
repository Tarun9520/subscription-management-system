const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");
const { sendEmail } = require("../config/email");

// Build a PDF buffer from an invoice
const buildInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header
      doc
        .fontSize(22)
        .fillColor("#6366f1")
        .text("Subscription Platform", 50, 50);
      doc
        .fontSize(10)
        .fillColor("#666")
        .text("Invoice", 50, 80);

      doc
        .fontSize(10)
        .fillColor("#000")
        .text(`Invoice #: ${invoice.invoiceNumber}`, 350, 50, {
          align: "right",
        })
        .text(
          `Date: ${new Date(invoice.issuedAt).toLocaleDateString()}`,
          350,
          65,
          { align: "right" }
        )
        .text(`Status: ${invoice.status.toUpperCase()}`, 350, 80, {
          align: "right",
        });

      // Bill to
      doc.moveDown(3);
      doc.fontSize(12).fillColor("#000").text("Bill To:", 50, 140);
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(invoice.billingDetails?.name || "", 50, 160)
        .text(invoice.billingDetails?.email || "", 50, 175);

      // Table header
      const tableTop = 230;
      doc
        .fontSize(10)
        .fillColor("#fff")
        .rect(50, tableTop, 500, 22)
        .fill("#6366f1");
      doc
        .fillColor("#fff")
        .text("Description", 60, tableTop + 6)
        .text("Amount", 460, tableTop + 6, { width: 80, align: "right" });

      // Rows
      let y = tableTop + 30;
      const planName = invoice.plan?.name || "Subscription Plan";
      doc
        .fillColor("#000")
        .text(planName, 60, y)
        .text(
          `${invoice.currency} ${invoice.amount.toFixed(2)}`,
          460,
          y,
          { width: 80, align: "right" }
        );

      y += 25;
      doc
        .fillColor("#333")
        .text("Discount", 60, y)
        .text(
          `- ${invoice.currency} ${invoice.discount.toFixed(2)}`,
          460,
          y,
          { width: 80, align: "right" }
        );

      y += 20;
      doc
        .text("Tax (incl.)", 60, y)
        .text(
          `${invoice.currency} ${invoice.tax.toFixed(2)}`,
          460,
          y,
          { width: 80, align: "right" }
        );

      // Total
      y += 30;
      doc.moveTo(50, y).lineTo(550, y).strokeColor("#ddd").stroke();
      y += 10;
      doc
        .fontSize(12)
        .fillColor("#000")
        .text("Total Paid", 60, y)
        .text(
          `${invoice.currency} ${invoice.total.toFixed(2)}`,
          440,
          y,
          { width: 100, align: "right" }
        );

      // Footer
      doc
        .fontSize(9)
        .fillColor("#999")
        .text(
          "Thank you for your business! This is a computer-generated invoice.",
          50,
          750,
          { align: "center", width: 500 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// @desc Get my invoices
// @route GET /api/invoices/me
exports.getMyInvoices = async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id })
    .populate("plan", "name billingCycle")
    .sort({ createdAt: -1 });
  res.json({ success: true, invoices });
};

// @desc Get single invoice
// @route GET /api/invoices/:id
exports.getInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("plan", "name billingCycle")
    .populate("user", "name email");
  if (!invoice) {
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });
  }
  // Owner or admin only
  if (
    invoice.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  res.json({ success: true, invoice });
};

// @desc Download invoice PDF
// @route GET /api/invoices/:id/download
exports.downloadInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate(
    "plan",
    "name billingCycle"
  );
  if (!invoice) {
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });
  }
  if (
    invoice.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const pdfBuffer = await buildInvoicePDF(invoice);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${invoice.invoiceNumber}.pdf`
  );
  res.send(pdfBuffer);
};

// @desc Email invoice PDF to user
// @route POST /api/invoices/:id/email
exports.emailInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate(
    "plan",
    "name billingCycle"
  );
  if (!invoice) {
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });
  }
  if (
    invoice.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const pdfBuffer = await buildInvoicePDF(invoice);

  await sendEmail({
    to: invoice.billingDetails.email,
    subject: `Your Invoice ${invoice.invoiceNumber}`,
    html: `<p>Hi ${invoice.billingDetails.name},</p><p>Please find your invoice attached.</p>`,
    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  res.json({ success: true, message: "Invoice emailed successfully" });
};

// ===== ADMIN =====

// @desc Get all invoices (admin)
// @route GET /api/invoices
exports.getAllInvoices = async (req, res) => {
  const invoices = await Invoice.find()
    .populate("plan", "name")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: invoices.length, invoices });
};
