/**
 * DRMS Dashboard Main Application Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  await loadDashboardData();
  initCharts();
});

function setupNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Toggle active link
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');

      // Toggle active view
      const targetScreen = item.getAttribute('data-screen');
      const screens = document.querySelectorAll('.screen-view');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById(`screen-${targetScreen}`).classList.add('active');

      // Update breadcrumb
      document.getElementById('breadcrumb-current').innerText = item.querySelector('.label').innerText;
    });
  });
}

async function loadDashboardData() {
  const stats = await mockApi.getDashboardStats();
  
  // Set KPI stats
  document.getElementById('stat-total-users').innerText = stats.totalUsers;
  document.getElementById('stat-total-content').innerText = stats.totalContent;
  document.getElementById('stat-total-licenses').innerText = stats.totalLicenses;
  document.getElementById('stat-total-revenue').innerText = `$${stats.revenueThisMonth.toLocaleString()}`;

  // Load user records
  const users = await mockApi.getUsers();
  const userTableBody = document.getElementById('users-table-body');
  userTableBody.innerHTML = '';
  users.forEach((u) => {
    const row = `
      <tr>
        <td>
          <div class="user-profile">
            <div class="avatar" style="width: 32px; height: 32px; font-size: 12px;">${u.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <div style="font-weight:600">${u.name}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${u.email}</div>
            </div>
          </div>
        </td>
        <td><span class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-primary)">${u.role}</span></td>
        <td><span class="badge ${u.status === 'ACTIVE' ? 'success' : 'danger'}">${u.status}</span></td>
        <td>${formatDate(u.lastLogin)}</td>
        <td><button class="btn btn-secondary" style="padding:6px 12px;font-size:12px">Suspend</button></td>
      </tr>
    `;
    userTableBody.innerHTML += row;
  });

  // Load content
  const content = await mockApi.getContent();
  const contentGrid = document.getElementById('content-grid-view');
  contentGrid.innerHTML = '';
  content.forEach((c) => {
    const icon = c.contentType === 'video' ? '🎬' : c.contentType === 'audio' ? '🎵' : '📄';
    const card = `
      <div class="content-card">
        <div class="card-thumbnail">${icon}</div>
        <div class="card-body">
          <h4>${c.title}</h4>
          <span class="badge success">${c.status}</span>
          <div class="card-meta">
            <span>Size: ${formatBytes(c.fileSize)}</span>
            <span>Date: ${formatDate(c.createdAt)}</span>
          </div>
        </div>
      </div>
    `;
    contentGrid.innerHTML += card;
  });

  // Load licenses
  const licenses = await mockApi.getLicenses();
  const licTableBody = document.getElementById('licenses-table-body');
  licTableBody.innerHTML = '';
  licenses.forEach((l) => {
    const row = `
      <tr>
        <td style="font-family:monospace">${l.licenseKey}</td>
        <td>${l.userId}</td>
        <td>${l.contentId}</td>
        <td><span class="badge warning">${l.licenseType}</span></td>
        <td><span class="badge ${l.status === 'active' ? 'success' : 'danger'}">${l.status}</span></td>
        <td>${l.activeDevices} / ${l.maxDevices}</td>
        <td><button class="btn btn-secondary" style="padding:6px 12px;font-size:12px">Revoke</button></td>
      </tr>
    `;
    licTableBody.innerHTML += row;
  });

  // Load audit logs & dashboard activity feed
  const logs = await mockApi.getAuditLogs();
  const auditTableBody = document.getElementById('audit-table-body');
  auditTableBody.innerHTML = '';
  
  const dashFeed = document.getElementById('dashboard-recent-activity');
  dashFeed.innerHTML = '';

  logs.forEach((log, index) => {
    const row = `
      <tr>
        <td>${formatDate(log.timestamp)}</td>
        <td>${log.user}</td>
        <td><strong>${log.action}</strong></td>
        <td>${log.resource}</td>
        <td>${log.ip}</td>
        <td><span class="badge success">${log.status}</span></td>
      </tr>
    `;
    auditTableBody.innerHTML += row;

    if (index < 4) {
      const feedItem = `
        <div style="display:flex;gap:12px;margin-bottom:16px;font-size:14px">
          <div>🔵</div>
          <div>
            <strong>${log.user}</strong> performed <strong>${log.action}</strong> on ${log.resource}
            <div style="font-size:12px;color:var(--text-secondary)">${formatRelativeTime(log.timestamp)}</div>
          </div>
        </div>
      `;
      dashFeed.innerHTML += feedItem;
    }
  });
}

function openUploadModal() {
  document.getElementById('upload-modal').style.display = 'flex';
}

function closeUploadModal() {
  document.getElementById('upload-modal').style.display = 'none';
}

async function handleUploadSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('upload-title').value;
  const type = document.getElementById('upload-type').value;
  const file = document.getElementById('upload-file').files[0];

  if (file) {
    showToast(`Uploading and processing ${title}...`, 'success');
    closeUploadModal();
    await mockApi.uploadContent(title, type, file.size);
    await loadDashboardData();
    showToast(`${title} successfully published & encrypted!`, 'success');
  }
}
