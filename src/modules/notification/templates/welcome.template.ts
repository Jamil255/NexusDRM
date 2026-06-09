export function getWelcomeEmail(
  email: string,
  firstName: string,
  password: string,
  roleName?: string,
) {
  const roleDisplay = roleName
    ? roleName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'User';

  return {
    subject: 'Welcome to NexusDRM – Your Account is Ready',
    body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a1a;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 40px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
            🛡️ NexusDRM
          </h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">
            Digital Rights Management Platform
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="color: #e5e5e5; margin: 0 0 8px 0; font-size: 20px;">
            Welcome aboard, ${firstName}! 🎉
          </h2>
          <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Your account has been created successfully. You can now access the NexusDRM dashboard with the credentials below.
          </p>

          <!-- Credentials Box -->
          <div style="background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 16px 0;">
              Your Login Credentials
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #737373; font-size: 13px; padding: 6px 0; width: 100px;">Email</td>
                <td style="color: #e5e5e5; font-size: 13px; font-weight: 600; padding: 6px 0;">${email}</td>
              </tr>
              <tr>
                <td style="color: #737373; font-size: 13px; padding: 6px 0;">Password</td>
                <td style="color: #22c55e; font-size: 13px; font-weight: 600; font-family: monospace; padding: 6px 0;">${password}</td>
              </tr>
              <tr>
                <td style="color: #737373; font-size: 13px; padding: 6px 0;">Role</td>
                <td style="color: #e5e5e5; font-size: 13px; font-weight: 600; padding: 6px 0;">${roleDisplay}</td>
              </tr>
            </table>
          </div>

          <!-- Security Warning -->
          <div style="background: #1c1917; border: 1px solid #422006; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #fbbf24; font-size: 12px; font-weight: 600; margin: 0 0 4px 0;">
              ⚠️ Security Notice
            </p>
            <p style="color: #a3a3a3; font-size: 12px; line-height: 1.5; margin: 0;">
              Please change your password after your first login. Do not share your credentials with anyone.
            </p>
          </div>

          <!-- CTA Button -->
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
             style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 700;">
            Sign In to Dashboard →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 40px; border-top: 1px solid #1a1a1a;">
          <p style="color: #525252; font-size: 11px; margin: 0; line-height: 1.5;">
            This email was sent automatically by NexusDRM. If you did not expect this, please contact your organization administrator.
          </p>
        </div>
      </div>
    `,
  };
}
