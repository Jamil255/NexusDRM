export function getLicenseExpiryEmail(email: string, licenseKey: string, expiryDate: Date) {
  return {
    subject: 'DRMS Notice - Your License is About to Expire',
    body: `
      <h2>License Expiration Alert</h2>
      <p>Hello ${email},</p>
      <p>This is a notice that your content access license with key: <strong>${licenseKey}</strong> is scheduled to expire on <strong>${expiryDate.toLocaleString()}</strong>.</p>
      <p>Please renew your subscription to maintain uninterrupted access.</p>
      <br/>
      <p>Thank you,</p>
      <p>The DRMS Team</p>
    `,
  };
}
