import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

// Setup reusable Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // You can change this to SendGrid, Outlook, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/**
 * Send Job Summary Email
 * @param {Object} options - { email, jobId, totalRecords, totalInserted, failedCount, attachmentPath? }
 */
export const sendJobSummaryEmail = async (options) => {
  const {
    email,
    jobId,
    totalRecords,
    totalInserted,
    failedCount,
    attachmentPath, // optional
  } = options

  const mailOptions = {
    from: `"Bulk Data Uploader" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Job ${jobId} Completed - Upload Summary`,
    html: `
      <h2>📄 Job Summary</h2>
      <p><strong>Job ID:</strong> ${jobId}</p>
      <p><strong>Total Records:</strong> ${totalRecords}</p>
      <p><strong>Inserted Successfully:</strong> ${totalInserted}</p>
      <p><strong>Failed:</strong> ${failedCount}</p>
      <br />
      <p>Thank you for using <strong>Bulk Data Uploader</strong>!</p>
    `,
  }

  // Optional attachment (e.g., failed-records CSV)
  if (attachmentPath) {
    mailOptions.attachments = [
      {
        filename: "failed-records.csv",
        path: attachmentPath,
      },
    ]
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${email}`)
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error)
    throw error // ensure calling function knows it failed
  }
}
