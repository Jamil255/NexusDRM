export function getSecurityAlertEmail(email: string, eventName: string, ip: string, details?: string) {
  return {
    subject: `DRMS Security Alert: ${eventName}`,
    body: `
      <h2>Security Alert</h2>
      <p>Hello ${email},</p>
      <p>We detected a security event on your account: <strong>${eventName}</strong>.</p>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      ${details ? `<p><strong>Details:</strong> ${details}</p>` : ''}
      <p>If this was not you, please secure your account immediately and change your password.</p>
      <br/>
      <p>Best regards,</p>
      <p>The DRMS Security Team</p>
    `,
  };
}
