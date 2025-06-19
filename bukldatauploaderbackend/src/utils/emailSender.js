import nodemailer from "nodemailer"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Setup reusable transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/**
 * Send job summary email with professional styling and embedded logo
 * @param {Object} options - { email, jobId, totalRecords, totalInserted, failedCount }
 */
export const sendJobSummaryEmail = async (options) => {
  const { email, jobId, totalRecords, totalInserted, failedCount } = options

  const successRate = totalRecords > 0 ? ((totalInserted / totalRecords) * 100).toFixed(1) : "0"
  const statusColor = failedCount === 0 ? "#10b981" : failedCount > totalInserted ? "#ef4444" : "#f59e0b"
  const statusText = failedCount === 0 ? "Completed Successfully" : failedCount > totalInserted ? "Completed with Errors" : "Completed with Warnings"

  const mailOptions = {
    from: `"AT.dev - Bulk Data Uploader" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Data Processing Complete - Job ${jobId} | ${statusText}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Summary Report</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        
        <!-- Main Container -->
        <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <img src="cid:logo" alt="AT.dev Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); margin-bottom: 20px;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Data Processing Report</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Bulk Data Uploader Service</p>
          </div>

          <!-- Status Banner -->
          <div style="background-color: ${statusColor}; padding: 15px 30px; text-align: center;">
            <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">${statusText}</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            
            <!-- Job Information -->
            <div style="margin-bottom: 35px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Job Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500; width: 40%;">Job ID:</td>
                  <td style="padding: 12px 0; color: #1f2937; font-weight: 600; font-family: 'Courier New', monospace; background-color: #f9fafb; padding-left: 12px; border-radius: 4px;">${jobId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Processing Date:</td>
                  <td style="padding: 12px 0; color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
              </table>
            </div>

            <!-- Processing Statistics -->
            <div style="margin-bottom: 35px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Processing Statistics</h2>
              
              <!-- Stats Grid -->
              <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 10px;">
                
                <!-- Total Records -->
                <div style="display: table-cell; background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; width: 25%;">
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 5px;">${totalRecords.toLocaleString()}</div>
                  <div style="color: #6b7280; font-size: 14px; font-weight: 500;">Total Records</div>
                </div>

                <!-- Successfully Processed -->
                <div style="display: table-cell; background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #10b981; width: 25%;">
                  <div style="font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 5px;">${totalInserted.toLocaleString()}</div>
                  <div style="color: #065f46; font-size: 14px; font-weight: 500;">Successfully Processed</div>
                </div>

                <!-- Failed Records -->
                <div style="display: table-cell; background-color: #fef2f2; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #ef4444; width: 25%;">
                  <div style="font-size: 28px; font-weight: 700; color: #dc2626; margin-bottom: 5px;">${failedCount.toLocaleString()}</div>
                  <div style="color: #991b1b; font-size: 14px; font-weight: 500;">Failed Records</div>
                </div>

                <!-- Success Rate -->
                <div style="display: table-cell; background-color: #fefce8; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #eab308; width: 25%;">
                  <div style="font-size: 28px; font-weight: 700; color: #a16207; margin-bottom: 5px;">${successRate}%</div>
                  <div style="color: #713f12; font-size: 14px; font-weight: 500;">Success Rate</div>
                </div>

              </div>
            </div>

            <!-- Summary Message -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; border-left: 4px solid #6366f1; margin-bottom: 30px;">
              ${failedCount === 0 
                ? `<p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;"><strong>Excellent!</strong> All ${totalRecords.toLocaleString()} records were processed successfully without any errors.</p>`
                : `<p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;"><strong>Processing Summary:</strong> ${totalInserted.toLocaleString()} out of ${totalRecords.toLocaleString()} records were processed successfully. ${failedCount.toLocaleString()} records encountered issues and may require attention.</p>`
              }
            </div>

            <!-- Next Steps (if there are failures) -->
            ${failedCount > 0 ? `
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 25px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">Recommended Next Steps:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
                <li>Review the failed records for data format issues</li>
                <li>Check for duplicate entries or constraint violations</li>
                <li>Verify data types match the expected schema</li>
                <li>Contact support if you need assistance with error resolution</li>
              </ul>
            </div>
            ` : ''}

            <!-- Support Information -->
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Need assistance with your data processing?</p>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">Contact our support team or visit our documentation portal.</p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <div style="margin-bottom: 15px;">
              <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">AT.dev</p>
              <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 14px;">Professional Data Solutions</p>
            </div>
            <div style="border-top: 1px solid #374151; padding-top: 15px;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} AT.dev • Powered by Ankit Tripathi</p>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">This is an automated message from our bulk data processing service.</p>
            </div>
          </div>

        </div>

      </body>
      </html>
    `,
    attachments: [
      {
        filename: "logo.jpg",
        path: path.join(__dirname, "../assets/logo.jpg"),
        cid: "logo",
      },
    ],
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`📧 Professional job summary email sent to ${email}`)
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error)
    throw error
  }
}