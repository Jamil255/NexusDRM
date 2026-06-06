/**
 * Mock API Service simulating backend endpoints for DRMS.
 */

const mockUsers = [
  { id: '1', name: 'Super Admin', email: 'admin@drms.com', role: 'super_admin', status: 'ACTIVE', lastLogin: '2026-06-06T16:30:00Z' },
  { id: '2', name: 'John Doe', email: 'john@company.com', role: 'org_admin', status: 'ACTIVE', lastLogin: '2026-06-06T12:00:00Z' },
  { id: '3', name: 'Jane Smith', email: 'jane@company.com', role: 'editor', status: 'ACTIVE', lastLogin: '2026-06-05T09:15:00Z' },
  { id: '4', name: 'Alice Johnson', email: 'alice@partner.com', role: 'viewer', status: 'SUSPENDED', lastLogin: '2026-06-01T14:20:00Z' },
  { id: '5', name: 'Bob Wilson', email: 'bob@client.com', role: 'viewer', status: 'DEACTIVATED', lastLogin: '2026-05-28T11:40:00Z' },
];

const mockContent = [
  { id: 'c1', title: 'Q2 Product Launch Keynote', contentType: 'video', status: 'published', fileSize: 1845689000, mimeType: 'video/mp4', createdAt: '2026-06-05T10:00:00Z' },
  { id: 'c2', title: 'DRM Integration Guidelines', contentType: 'document', status: 'published', fileSize: 4567200, mimeType: 'application/pdf', createdAt: '2026-06-04T11:30:00Z' },
  { id: 'c3', title: 'Corporate Podcast Ep 24', contentType: 'audio', status: 'published', fileSize: 58900000, mimeType: 'audio/mpeg', createdAt: '2026-06-03T15:00:00Z' },
  { id: 'c4', title: 'System Architecture Document', contentType: 'document', status: 'published', fileSize: 12456000, mimeType: 'application/pdf', createdAt: '2026-06-02T16:20:00Z' },
  { id: 'c5', title: 'Confidential Core Values Text', contentType: 'text', status: 'published', fileSize: 15400, mimeType: 'text/plain', createdAt: '2026-06-01T08:00:00Z' },
];

const mockLicenses = [
  { id: 'l1', licenseKey: 'LIC-67B6DF59B184D140', userId: 'john@company.com', contentId: 'Q2 Product Launch Keynote', licenseType: 'subscription', status: 'active', maxDevices: 3, activeDevices: 2, expiresAt: '2027-06-06T12:00:00Z' },
  { id: 'l2', licenseKey: 'LIC-17C08CF6339C411E', userId: 'jane@company.com', contentId: 'DRM Integration Guidelines', licenseType: 'perpetual', status: 'active', maxDevices: 1, activeDevices: 1, expiresAt: null },
  { id: 'l3', licenseKey: 'LIC-ED7ED3DD4C2845CD', userId: 'alice@partner.com', contentId: 'Corporate Podcast Ep 24', licenseType: 'trial', status: 'expired', maxDevices: 3, activeDevices: 0, expiresAt: '2026-06-01T12:00:00Z' },
];

const mockAuditLogs = [
  { timestamp: '2026-06-06T16:40:00Z', user: 'admin@drms.com', action: 'LOGIN_SUCCESS', resource: 'Auth', ip: '192.168.1.1', status: 'success' },
  { timestamp: '2026-06-06T15:22:00Z', user: 'john@company.com', action: 'CONTENT_STREAM_START', resource: 'Q2 Product Launch Keynote', ip: '24.56.78.102', status: 'success' },
  { timestamp: '2026-06-06T14:15:00Z', user: 'jane@company.com', action: 'LICENSE_CREATE', resource: 'LIC-17C08CF6339C411E', ip: '192.168.1.5', status: 'success' },
  { timestamp: '2026-06-06T11:00:00Z', user: 'admin@drms.com', action: 'USER_SUSPEND', resource: 'alice@partner.com', ip: '192.168.1.1', status: 'success' },
];

const mockApi = {
  getDashboardStats() {
    return Promise.resolve({
      totalUsers: mockUsers.length,
      totalContent: mockContent.length,
      totalLicenses: mockLicenses.filter(l => l.status === 'active').length,
      revenueThisMonth: 12450.00,
    });
  },

  getUsers() {
    return Promise.resolve(mockUsers);
  },

  getContent() {
    return Promise.resolve(mockContent);
  },

  getLicenses() {
    return Promise.resolve(mockLicenses);
  },

  getAuditLogs() {
    return Promise.resolve(mockAuditLogs);
  },

  uploadContent(title, contentType, size) {
    const newAsset = {
      id: 'c' + (mockContent.length + 1),
      title,
      contentType,
      status: 'published',
      fileSize: size,
      mimeType: contentType === 'video' ? 'video/mp4' : 'application/pdf',
      createdAt: new Date().toISOString(),
    };
    mockContent.push(newAsset);
    return Promise.resolve(newAsset);
  },
};
