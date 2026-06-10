/**
 * Generates a branded HTML email for email verification.
 * Includes intro, verify button, token fallback, and disclaimer.
 */
export function getVerifyEmailTemplate(
  email: string,
  token: string,
  frontendUrl: string,
) {
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  return {
    subject: 'Verify Your Email — NexusDRM',
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 36px; height: 36px; background: rgba(22,163,74,0.15); border: 1px solid rgba(22,163,74,0.25); border-radius: 10px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 18px;">🛡️</span>
                  </td>
                  <td style="padding-left: 10px;">
                    <span style="font-size: 18px; font-weight: 800; color: #f5f5f5; letter-spacing: -0.5px;">Nexus</span><span style="font-size: 18px; font-weight: 800; color: #16a34a; letter-spacing: -0.5px;">DRM</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden;">

              <!-- Green accent bar -->
              <div style="height: 3px; background: linear-gradient(90deg, #16a34a, #22c55e, #16a34a);"></div>

              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 40px 36px;">

                    <!-- Icon -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.15); border-radius: 16px; text-align: center;">
                        <span style="font-size: 28px;">✉️</span>
                      </div>
                    </div>

                    <!-- Heading -->
                    <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #f5f5f5; text-align: center; letter-spacing: -0.5px;">
                      Verify Your Email Address
                    </h1>

                    <!-- Intro -->
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #a3a3a3; text-align: center; line-height: 1.6;">
                      Welcome to <strong style="color: #e5e5e5;">NexusDRM</strong> — a secure Digital Rights Management platform for protecting and distributing your premium content.
                    </p>
                    <p style="margin: 0 0 28px 0; font-size: 14px; color: #a3a3a3; text-align: center; line-height: 1.6;">
                      Please verify your email address to activate your account and get started.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 28px;">
                      <a href="${verifyUrl}" 
                         style="display: inline-block; padding: 14px 36px; background: #16a34a; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700; letter-spacing: 0.3px;">
                        ✓&nbsp; Verify My Email
                      </a>
                    </div>

                    <!-- Divider -->
                    <div style="border-top: 1px solid #1a1a1a; margin: 0 0 20px 0;"></div>

                    <!-- Fallback link -->
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #737373; text-align: center; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                      Or copy this link into your browser
                    </p>
                    <div style="background: #141414; border: 1px solid #1f1f1f; border-radius: 8px; padding: 12px 16px; text-align: center; margin-bottom: 24px; word-break: break-all;">
                      <a href="${verifyUrl}" style="font-size: 12px; color: #22c55e; text-decoration: none; font-family: monospace;">${verifyUrl}</a>
                    </div>

                    <!-- Info Box -->
                    <div style="background: #0f1411; border: 1px solid #14532d; border-radius: 10px; padding: 16px 20px; margin-bottom: 4px;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #4ade80;">
                        🔒 What happens next?
                      </p>
                      <ul style="margin: 0; padding: 0 0 0 16px; font-size: 12px; color: #a3a3a3; line-height: 1.8;">
                        <li>Your account will be activated immediately</li>
                        <li>You'll be able to sign in to the NexusDRM dashboard</li>
                        <li>Your admin will assign content & license access</li>
                      </ul>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Disclaimer Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px 36px; border-top: 1px solid #141414; background: #080808;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #525252; text-align: center; line-height: 1.6;">
                      <strong style="color: #737373;">⚠️ Security Notice:</strong> This link is valid for a single use. If you did not create an account on NexusDRM, please disregard this email — no action is required and your email will not be used.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #404040; text-align: center; line-height: 1.5;">
                      This email was sent to <span style="color: #525252;">${email}</span> by NexusDRM. 
                      Your data is protected under our Privacy Policy and Terms of Service.<br/>
                      © ${new Date().getFullYear()} NexusDRM. All rights reserved. Do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}
