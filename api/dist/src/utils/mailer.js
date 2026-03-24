"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail", // or "smtp.mailgun.org", "SendGrid" etc.
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
    },
});
const sendInvoiceEmail = async (to, subject, html) => {
    await exports.transporter.sendMail({
        from: `"E-Learning Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};
exports.sendInvoiceEmail = sendInvoiceEmail;
