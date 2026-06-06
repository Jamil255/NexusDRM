export function getContentUpdateEmail(email: string, title: string, changeNote?: string) {
  return {
    subject: 'DRMS Notice - Content Asset Updated',
    body: `
      <h2>Content Update</h2>
      <p>Hello ${email},</p>
      <p>The content item: <strong>${title}</strong> has been updated with a new version.</p>
      ${changeNote ? `<p><strong>Change Note:</strong> ${changeNote}</p>` : ''}
      <p>You can view the latest version using your active license.</p>
      <br/>
      <p>Best regards,</p>
      <p>The DRMS Team</p>
    `,
  };
}
