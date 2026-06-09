/* 
  =========================================
  AURAEMS DASHBOARD VIEW COMPONENT
  =========================================
*/

(function () {
  const DashboardView = {
    render(user) {
      const isAdmin = user.role === 'admin';

      if (isAdmin) {
        return `
          <!-- Admin Dashboard View -->
          <div class="metrics-grid">
            <div class="glass-card metric-card">
              <div class="metric-details">
                <span>Total Headcount</span>
                <h2 id="metric-headcount">-</h2>
                <p><i class="fa-solid fa-arrow-trend-up"></i> Active Personnel</p>
              </div>
              <div class="metric-icon-box icon-purple">
                <i class="fa-solid fa-users"></i>
              </div>
            </div>

            <div class="glass-card metric-card">
              <div class="metric-details">
                <span>Active Departments</span>
                <h2 id="metric-departments">-</h2>
                <p>Functional Units</p>
              </div>
              <div class="metric-icon-box icon-teal">
                <i class="fa-solid fa-sitemap"></i>
              </div>
            </div>

            <div class="glass-card metric-card">
              <div class="metric-details">
                <span>Attendance Rate</span>
                <h2 id="metric-attendance-rate">-</h2>
                <p id="metric-attendance-sub">Today's logs</p>
              </div>
              <div class="metric-icon-box icon-green">
                <i class="fa-solid fa-calendar-check"></i>
              </div>
            </div>

            <div class="glass-card metric-card">
              <div class="metric-details">
                <span>Pending Leaves</span>
                <h2 id="metric-pending-leaves">-</h2>
                <p><i class="fa-solid fa-clock"></i> Awaiting Review</p>
              </div>
              <div class="metric-icon-box icon-orange">
                <i class="fa-solid fa-envelope-open-text"></i>
              </div>
            </div>
          </div>

          <div class="charts-grid">
            <div class="glass-card">
              <div class="chart-header">
                <h3>Department Breakdown</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Distribution of staff</span>
              </div>
              <div class="chart-canvas-container">
                <canvas id="deptChart"></canvas>
              </div>
            </div>

            <div class="glass-card">
              <div class="chart-header">
                <h3>Today's Attendance Status</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Present vs. Late vs. Absent</span>
              </div>
              <div class="chart-canvas-container">
                <canvas id="attendanceChart"></canvas>
              </div>
            </div>
          </div>

          <div class="split-grid">
            <div class="glass-card">
              <div class="chart-header">
                <h3>Recent System Activity</h3>
                <i class="fa-solid fa-bolt" style="color: var(--accent);"></i>
              </div>
              <div class="log-list" id="activity-log-container">
                <div class="text-center" style="padding: 20px 0;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>
              </div>
            </div>

            <div class="glass-card">
              <div class="chart-header">
                <h3>AuraEMS Organization</h3>
                <i class="fa-solid fa-building" style="color: var(--primary);"></i>
              </div>
              <div style="font-size: 0.9rem; line-height: 1.6;">
                <p style="margin-bottom: 12px; color: var(--text-muted);">Welcome to AuraEMS admin suite. As an administrator, you have complete administrative power to supervise employee files, manage structural departments, review check-in statistics, and approve/reject leave requests.</p>
                <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: var(--border-radius-md); border: 1px solid var(--card-border); margin-bottom: 16px;">
                  <h5 style="font-family: var(--font-title); font-weight: 600; margin-bottom: 4px; color: var(--primary);">Quick Seeder Information</h5>
                  <p style="font-size: 0.82rem; color: var(--text-muted);">We have automatically loaded 3 dummy employees (Alice, Bob, Charlie) and 3 departments (Engineering, HR, Sales). To experience the self-service employee portal, log out and sign in using one of their profiles!</p>
                </div>
                <div class="flex gap-2">
                  <a href="#employees" class="btn btn-primary btn-sm" style="width: auto;">Manage Employees</a>
                  <a href="#leaves" class="btn btn-secondary btn-sm" style="width: auto;">Review Leaves</a>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Employee Dashboard View
        return `
          <div class="split-grid" style="grid-template-columns: 3fr 5fr; margin-bottom: 24px;">
            <!-- Self Check-in Widget -->
            <div class="glass-card attendance-punch-card" id="punch-widget-card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <h3 style="font-family: var(--font-title); font-weight: 700; margin-bottom: 16px;">Daily Check-In</h3>
                <div class="punch-clock" id="live-clock">--:--:--</div>
                <div class="punch-date" id="live-date">---, --- --, ----</div>
              </div>
              <button class="punch-circle-btn" id="mark-attendance-btn" style="align-self: center; margin: 20px 0;">
                <i class="fa-solid fa-fingerprint"></i>
                <span>Check In</span>
              </button>
              <div id="punch-status-indicator" style="font-size: 0.9rem; font-weight: 500; text-align: center;"></div>
            </div>

            <!-- Profile Summary Card -->
            <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="employee-profile-hero">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80" alt="Avatar" class="profile-hero-avatar" id="emp-profile-avatar">
                  <div class="profile-hero-info">
                    <h2 id="emp-profile-name">-</h2>
                    <span id="emp-profile-role" style="color: var(--primary); font-weight: 500;">-</span>
                  </div>
                </div>
                
                <div class="profile-details-grid" style="margin-top: 16px;">
                  <div class="info-field-group">
                    <span>Department</span>
                    <p id="emp-profile-dept">-</p>
                  </div>
                  <div class="info-field-group">
                    <span>Email</span>
                    <p id="emp-profile-email">-</p>
                  </div>
                  <div class="info-field-group">
                    <span>Join Date</span>
                    <p id="emp-profile-joined">-</p>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div style="margin-top: 24px; border-top: 1px solid var(--card-border); padding-top: 16px;">
                <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; display: block;">Interactive Quick Actions</span>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                  <button class="btn btn-secondary btn-sm" id="btn-quick-leave" style="display: flex; flex-direction: column; align-items: center; padding: 12px; height: auto;">
                    <i class="fa-solid fa-bed" style="font-size: 1.2rem; margin-bottom: 6px; color: var(--accent);"></i>
                    <span>Sick Leave</span>
                  </button>
                  <button class="btn btn-secondary btn-sm" id="btn-quick-paystub" style="display: flex; flex-direction: column; align-items: center; padding: 12px; height: auto;">
                    <i class="fa-solid fa-file-invoice-dollar" style="font-size: 1.2rem; margin-bottom: 6px; color: var(--success);"></i>
                    <span>Latest Paystub</span>
                  </button>
                  <button class="btn btn-secondary btn-sm" id="btn-quick-support" style="display: flex; flex-direction: column; align-items: center; padding: 12px; height: auto;">
                    <i class="fa-solid fa-headset" style="font-size: 1.2rem; margin-bottom: 6px; color: var(--warning);"></i>
                    <span>HR Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="split-grid" style="margin-bottom: 32px;">
            <!-- Personal Attendance Chart -->
            <div class="glass-card" style="display: flex; flex-direction: column;">
              <div class="chart-header">
                <div>
                  <h3>My Attendance Health</h3>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Historical check-in summary</span>
                </div>
                <div style="text-align: right;">
                  <h2 id="emp-attendance-score" style="color: var(--primary); margin: 0;">--%</h2>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Score</span>
                </div>
              </div>
              <div class="chart-canvas-container" style="flex-grow: 1; min-height: 200px;">
                <canvas id="empPersonalChart"></canvas>
              </div>
            </div>

            <!-- Leave Stats & Coworkers -->
            <div style="display: flex; flex-direction: column; gap: 24px;">
              <div class="glass-card">
                <div class="chart-header">
                  <h3>Leave Allocations</h3>
                  <i class="fa-solid fa-plane" style="color: var(--accent);"></i>
                </div>
                <div class="flex gap-2" style="justify-content: space-around; margin-bottom: 16px; padding: 10px 0;">
                  <div class="text-center">
                    <h2 id="emp-leaves-pending" style="color: var(--warning); margin: 0;">0</h2>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Pending Review</span>
                  </div>
                  <div class="text-center">
                    <h2 id="emp-leaves-approved" style="color: var(--success); margin: 0;">0</h2>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Approved Days</span>
                  </div>
                </div>
                <a href="#leaves" class="btn btn-primary btn-sm" style="width: 100%;">Manage All Leaves</a>
              </div>

              <div class="glass-card" style="flex-grow: 1;">
                <div class="chart-header">
                  <h3>Department Colleagues</h3>
                  <i class="fa-solid fa-users" style="color: var(--primary);"></i>
                </div>
                <div class="log-list" id="coworkers-list-container">
                  <div class="text-center" style="padding: 20px 0;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    },

    afterRender(user, showNotification) {
      const isAdmin = user.role === 'admin';

      if (isAdmin) {
        this.initAdminDashboard(showNotification);
      } else {
        this.initEmployeeDashboard(user, showNotification);
      }
    },

    // 1. ADMIN DASHBOARD INITIALIZER
    async initAdminDashboard(showNotification) {
      try {
        const response = await window.EMS_API.dashboard.getStats();
        const { stats } = response;

        // Set metrics
        document.getElementById('metric-headcount').textContent = stats.totalEmployees;
        document.getElementById('metric-departments').textContent = stats.totalDepartments;
        document.getElementById('metric-attendance-rate').textContent = `${stats.attendance.rate}%`;
        document.getElementById('metric-pending-leaves').textContent = stats.leaves.pending;

        const rateSub = document.getElementById('metric-attendance-sub');
        rateSub.innerHTML = `<span style="color: var(--success);">${stats.attendance.present} Present</span> / <span style="color: var(--warning);">${stats.attendance.late} Late</span>`;

        // Render department breakdown doughnut chart
        let existingDeptChart = Chart.getChart('deptChart');
        if (existingDeptChart) existingDeptChart.destroy();

        const deptCtx = document.getElementById('deptChart').getContext('2d');
        const deptLabels = stats.departmentBreakdown.map(d => d.name);
        const deptValues = stats.departmentBreakdown.map(d => d.count);
        
        new Chart(deptCtx, {
          type: 'doughnut',
          data: {
            labels: deptLabels,
            datasets: [{
              data: deptValues,
              backgroundColor: [
                '#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
              ],
              borderColor: 'rgba(255, 255, 255, 0.05)',
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#9ca3af', font: { family: 'Inter', size: 12 } }
              }
            }
          }
        });

        // Render today's attendance breakdown chart
        let existingAttChart = Chart.getChart('attendanceChart');
        if (existingAttChart) existingAttChart.destroy();

        const attCtx = document.getElementById('attendanceChart').getContext('2d');
        new Chart(attCtx, {
          type: 'pie',
          data: {
            labels: ['Present', 'Late', 'Absent'],
            datasets: [{
              data: [stats.attendance.present, stats.attendance.late, stats.attendance.absent],
              backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
              borderColor: 'rgba(255, 255, 255, 0.05)',
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#9ca3af', font: { family: 'Inter', size: 12 } }
              }
            }
          }
        });

        // Render Activities list
        const activityContainer = document.getElementById('activity-log-container');
        if (stats.activities.length === 0) {
          activityContainer.innerHTML = '<div class="empty-state" style="padding:20px;"><p>No recent activity logged.</p></div>';
        } else {
          activityContainer.innerHTML = stats.activities.map(act => {
            let iconClass = 'fa-user-plus';
            let iconBoxType = 'log-icon-employee';
            
            if (act.type === 'leave') {
              iconClass = 'fa-plane-departure';
              iconBoxType = 'log-icon-leave';
            } else if (act.type === 'attendance') {
              iconClass = 'fa-fingerprint';
              iconBoxType = 'log-icon-attendance';
            }

            const localTimeStr = new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
              <div class="log-item">
                <div class="log-icon-pill ${iconBoxType}">
                  <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="log-body">
                  <div class="log-message">${act.message}</div>
                  <div class="log-time">${localTimeStr}</div>
                </div>
              </div>
            `;
          }).join('');
        }
      } catch (error) {
        showNotification('Error loading dashboard stats', error.message, 'error');
      }
    },

    // 2. EMPLOYEE DASHBOARD INITIALIZER
    async initEmployeeDashboard(user, showNotification) {
      // Live Clock Logic
      const clockEl = document.getElementById('live-clock');
      const dateEl = document.getElementById('live-date');
      
      const updateClock = () => {
        const now = new Date();
        if (clockEl) {
          clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        }
        if (dateEl) {
          dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        }
      };
      
      setInterval(updateClock, 1000);
      updateClock();

      const punchBtn = document.getElementById('mark-attendance-btn');
      const punchStatus = document.getElementById('punch-status-indicator');

      // Setup Quick Actions
      document.getElementById('btn-quick-leave').addEventListener('click', () => {
        showNotification('Sick Leave Requested', 'A quick sick leave request has been drafted. Please confirm in the Leaves portal.', 'info');
        setTimeout(() => window.location.hash = '#leaves', 1500);
      });
      document.getElementById('btn-quick-paystub').addEventListener('click', () => {
        showNotification('Retrieving Paystub', 'Your latest pay stub (PDF) is being generated...', 'success');
      });
      document.getElementById('btn-quick-support').addEventListener('click', () => {
        showNotification('HR Support', 'Connecting you to the HR ticketing system...', 'warning');
      });

      // Fetch Stats
      try {
        const response = await window.EMS_API.dashboard.getStats();
        const { stats } = response;
        const profile = stats.profile;

        // Set Employee profile details
        document.getElementById('emp-profile-name').textContent = profile.name;
        document.getElementById('emp-profile-role').textContent = profile.role;
        document.getElementById('emp-profile-dept').textContent = profile.department ? profile.department.name : 'Unassigned';
        document.getElementById('emp-profile-email').textContent = profile.email;
        
        // Random profile photo for visual variety
        const avatarEl = document.getElementById('emp-profile-avatar');
        if (avatarEl && profile.name) {
          const initials = encodeURIComponent(profile.name);
          avatarEl.src = `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=120`;
        }

        document.getElementById('emp-profile-joined').textContent = new Date(profile.joinDate).toLocaleDateString([], { month: 'long', year: 'numeric' });

        document.getElementById('emp-leaves-pending').textContent = stats.leaves.pending;
        document.getElementById('emp-leaves-approved').textContent = stats.leaves.approved;

        // Handle Check-in button states
        const todayAttendance = stats.attendance.today;
        if (todayAttendance !== 'Not Checked In') {
          punchBtn.disabled = true;
          punchStatus.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> Checked In Today as ${todayAttendance}</span>`;
          
          if (stats.attendance.time) {
            const timeStr = new Date(stats.attendance.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            punchStatus.innerHTML += `<div style="font-size:0.75rem; color:var(--text-muted); margin-top: 4px;">Time: ${timeStr}</div>`;
          }
        } else {
          punchBtn.disabled = false;
          punchStatus.innerHTML = `<span style="color: var(--text-muted);">Punch fingerprint to mark presence</span>`;
        }

        // Punch click listener
        punchBtn.addEventListener('click', async () => {
          punchBtn.disabled = true;
          punchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

          try {
            const punchRes = await window.EMS_API.attendance.markSelf();
            showNotification('Attendance Marked', punchRes.message, 'success');
            
            // Set success style
            punchStatus.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> Checked In successfully!</span>`;
            
            // Refresh dashboard after a short delay
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            showNotification('Error checkin', error.message, 'error');
            punchBtn.disabled = false;
            punchBtn.innerHTML = '<i class="fa-solid fa-fingerprint"></i><span>Check In</span>';
          }
        });

        // Initialize Attendance Pie Chart
        const totalPresent = stats.attendance.totalPresent || 0;
        const totalLate = stats.attendance.totalLate || 0;
        const totalCheckIns = stats.attendance.totalCheckIns || 1; // avoid divide by zero
        
        let score = Math.round((totalPresent / totalCheckIns) * 100);
        if (totalPresent === 0 && totalLate === 0) score = 0;
        
        document.getElementById('emp-attendance-score').textContent = `${score}%`;

        let existingEmpChart = Chart.getChart('empPersonalChart');
        if (existingEmpChart) existingEmpChart.destroy();

        const empCtx = document.getElementById('empPersonalChart').getContext('2d');
        if (totalPresent === 0 && totalLate === 0) {
          // Empty State Chart
          new Chart(empCtx, {
            type: 'doughnut',
            data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#333'] }] },
            options: { responsive: true, maintainAspectRatio: false }
          });
        } else {
          new Chart(empCtx, {
            type: 'doughnut',
            data: {
              labels: ['Present (On Time)', 'Late'],
              datasets: [{
                data: [totalPresent, totalLate],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderColor: 'rgba(255,255,255,0.05)',
                borderWidth: 2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 20 } }
              }
            }
          });
        }

        // Coworkers listing
        const coworkersContainer = document.getElementById('coworkers-list-container');
        if (stats.coworkers.length === 0) {
          coworkersContainer.innerHTML = '<div class="empty-state" style="padding: 20px;"><p>No coworkers found.</p></div>';
        } else {
          coworkersContainer.innerHTML = stats.coworkers.map(cow => {
            return `
              <div class="log-item">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(cow.name)}&background=06b6d4&color=fff&size=80" alt="Avatar" class="avatar-img" style="width:36px; height:36px; border:1px solid rgba(255,255,255,0.1);">
                <div class="log-body">
                  <div class="log-message" style="font-weight:600;">${cow.name}</div>
                  <div class="log-time" style="font-size:0.78rem;">${cow.role}</div>
                </div>
                <a href="mailto:${cow.email}" style="color:var(--primary); font-size:1.1rem;" title="Send Mail"><i class="fa-solid fa-envelope"></i></a>
              </div>
            `;
          }).join('');
        }

      } catch (error) {
        showNotification('Error', 'Unable to fetch personalized details', 'error');
      }
    }
  };

  // Expose
  window.DashboardView = DashboardView;
})();
