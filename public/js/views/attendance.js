/* 
  =========================================
  AURAEMS ATTENDANCE VIEW COMPONENT
  =========================================
*/

(function () {
  const AttendanceView = {
    render(user) {
      const isAdmin = user.role === 'admin';

      if (isAdmin) {
        return `
          <!-- Admin View: Supervisor Check-In Logs -->
          <div class="control-bar">
            <div class="search-input-box">
              <input type="text" id="att-search" placeholder="Search employee name...">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>

            <div class="filters-wrapper">
              <input type="date" id="att-date-filter" class="select-filter" style="color-scheme: dark;">
              <button class="btn btn-primary btn-sm" id="btn-admin-mark" style="width: auto;">
                <i class="fa-solid fa-pen-clip"></i>
                <span>Override Record</span>
              </button>
            </div>
          </div>

          <!-- Attendance Logs Table -->
          <div class="table-responsive">
            <table class="data-table" id="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time Marked</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="attendance-list-tbody">
                <tr>
                  <td colspan="5" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading attendance sheets...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Admin Manual Override Modal -->
          <div class="modal-overlay" id="override-modal">
            <div class="modal-container" style="max-width: 460px;">
              <div class="modal-header">
                <h3>Manual Attendance Log</h3>
                <button class="modal-close-btn" id="override-modal-close"><i class="fa-solid fa-xmark"></i></button>
              </div>
              
              <form id="override-form">
                <div class="modal-body">
                  <div class="form-group">
                    <label class="form-label" for="override-emp">Employee</label>
                    <select id="override-emp" class="select-filter" style="width: 100%; background: rgba(0,0,0,0.2);" required>
                      <option value="" disabled selected>Select Employee</option>
                      <!-- Dynamically seeded -->
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="override-date">Date</label>
                    <input type="date" id="override-date" class="form-input" style="padding-left: 16px; color-scheme: dark;" required>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="override-status">Attendance Status</label>
                    <select id="override-status" class="select-filter" style="width: 100%; background: rgba(0,0,0,0.2);">
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-override-cancel" style="width: auto;">Cancel</button>
                  <button type="submit" class="btn btn-primary btn-sm" id="btn-override-submit" style="width: auto;">Record Status</button>
                </div>
              </form>
            </div>
          </div>
        `;
      }

      // Employee View: Self punch history
      return `
        <div class="split-grid" style="grid-template-columns: 2fr 3fr;">
          <!-- Punch Card -->
          <div class="glass-card attendance-punch-card" style="height: fit-content;">
            <h3 style="font-family: var(--font-title); font-weight: 700; margin-bottom: 16px;">Biometric Portal</h3>
            <div class="punch-clock" id="att-clock">--:--:--</div>
            <div class="punch-date" id="att-date">---, --- --, ----</div>
            <button class="punch-circle-btn" id="att-punch-btn">
              <i class="fa-solid fa-fingerprint"></i>
              <span>Check In</span>
            </button>
            <div id="att-punch-indicator" style="font-size: 0.9rem; font-weight: 500;">--</div>
          </div>

          <!-- Personal history logs -->
          <div class="glass-card" style="display: flex; flex-direction: column;">
            <h3 style="font-family: var(--font-title); font-weight: 700; margin-bottom: 20px;">My Check-In History</h3>
            
            <div class="table-responsive" style="border: none; background: transparent; flex-grow: 1;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time Marked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="personal-attendance-tbody">
                  <tr>
                    <td colspan="3" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading punch history...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    afterRender(user, showNotification) {
      this.isAdmin = user.role === 'admin';
      this.activeFilters = { date: '', search: '' };
      
      this.initElements();
      
      if (this.isAdmin) {
        this.initAdminView(showNotification);
      } else {
        this.initEmployeeView(user, showNotification);
      }
    },

    initElements() {
      this.elements = {
        tbody: document.getElementById(this.isAdmin ? 'attendance-list-tbody' : 'personal-attendance-tbody'),
        search: document.getElementById('att-search'),
        dateFilter: document.getElementById('att-date-filter'),
        overrideBtn: document.getElementById('btn-admin-mark'),
        
        // Override Modal
        modal: document.getElementById('override-modal'),
        modalClose: document.getElementById('override-modal-close'),
        cancelBtn: document.getElementById('btn-override-cancel'),
        form: document.getElementById('override-form'),
        submitBtn: document.getElementById('btn-override-submit'),
        
        // Inputs
        empSelect: document.getElementById('override-emp'),
        dateInput: document.getElementById('override-date'),
        statusSelect: document.getElementById('override-status'),
        
        // Employee punching clock
        clock: document.getElementById('att-clock'),
        dateDisplay: document.getElementById('att-date'),
        punchBtn: document.getElementById('att-punch-btn'),
        punchIndicator: document.getElementById('att-punch-indicator'),
      };
    },

    // 1. ADMIN ATTENDANCE LOGS
    async initAdminView(showNotification) {
      const { search, dateFilter, overrideBtn, modal, modalClose, cancelBtn, form } = this.elements;

      // Default date filter to today
      const today = new Date().toISOString().split('T')[0];
      dateFilter.value = today;
      this.activeFilters.date = today;

      const triggerFilterChange = () => {
        this.activeFilters.search = search.value.trim();
        this.activeFilters.date = dateFilter.value;
        this.fetchLogs(showNotification);
      };

      // Debounce search
      let searchTimeout;
      search.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(triggerFilterChange, 400);
      });

      dateFilter.addEventListener('change', triggerFilterChange);

      // Override modal listeners
      overrideBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('override-date').value = new Date().toISOString().split('T')[0];
        modal.classList.add('active');
      });

      const closeModalFn = () => { modal.classList.remove('active'); };
      modalClose.addEventListener('click', closeModalFn);
      cancelBtn.addEventListener('click', closeModalFn);

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleOverrideSubmit(showNotification);
      });

      // Seed list of employees
      try {
        const response = await window.EMS_API.employees.getAll();
        const { empSelect } = this.elements;
        empSelect.innerHTML = '<option value="" disabled selected>Select Employee</option>' + 
          response.data.map(e => `<option value="${e._id}">${e.name} (${e.role})</option>`).join('');
      } catch (error) {
        console.error('Error seeding employee overrides dropdown', error);
      }

      await this.fetchLogs(showNotification);
    },

    async fetchLogs(showNotification) {
      const { tbody } = this.elements;
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Refreshing logs...</td></tr>';

      try {
        const response = await window.EMS_API.attendance.getHistory(this.activeFilters);
        const logs = response.data;

        if (logs.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5">
                <div class="empty-state">
                  <div class="empty-state-icon"><i class="fa-solid fa-clipboard-question"></i></div>
                  <h4>No Check-In Logs</h4>
                  <p>No records match the active criteria.</p>
                </div>
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = logs.map(l => {
          const statusClass = l.status === 'Present' ? 'status-approved' : (l.status === 'Late' ? 'status-pending' : 'status-rejected');
          const emp = l.employeeId || { name: 'Deleted Employee', role: 'none', department: { name: 'none' } };
          const deptName = emp.department ? emp.department.name : 'Unassigned';
          const initials = encodeURIComponent(emp.name);

          const checkinTime = new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formattedDate = new Date(l.date + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

          return `
            <tr>
              <td>
                <div class="profile-cell" style="gap: 8px;">
                  <img src="https://ui-avatars.com/api/?name=${initials}&background=06b6d4&color=fff&size=60" alt="Avatar" class="avatar-img" style="width:28px; height:28px; border:1px solid rgba(255,255,255,0.05);">
                  <div style="font-size:0.9rem; font-weight:500;">${emp.name}</div>
                </div>
              </td>
              <td>${deptName}</td>
              <td style="font-family: var(--font-title); font-weight: 500;">${formattedDate}</td>
              <td style="font-family: var(--font-title); font-weight: 500;">${checkinTime}</td>
              <td><span class="status-pill ${statusClass}">${l.status}</span></td>
            </tr>
          `;
        }).join('');
      } catch (error) {
        showNotification('Sync Error', 'Could not fetch check-in logs from API', 'error');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px; color: var(--danger);">Error executing request</td></tr>';
      }
    },

    async handleOverrideSubmit(showNotification) {
      const { empSelect, dateInput, statusSelect, modal, submitBtn } = this.elements;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving details...';

      try {
        await window.EMS_API.attendance.markAdmin(empSelect.value, dateInput.value, statusSelect.value);
        showNotification('Record Updated', 'Attendance logged successfully', 'success');
        modal.classList.remove('active');
        await this.fetchLogs(showNotification);
      } catch (error) {
        showNotification('Record Failed', error.message || 'Error executing request', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Record Status';
      }
    },

    // 2. EMPLOYEE SELF PORTAL
    async initEmployeeView(user, showNotification) {
      const { clock, dateDisplay, punchBtn, punchIndicator } = this.elements;

      // Clock Ticker
      const updateClock = () => {
        const now = new Date();
        if (clock) {
          clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        }
        if (dateDisplay) {
          dateDisplay.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        }
      };
      
      setInterval(updateClock, 1000);
      updateClock();

      // Punch listener
      punchBtn.addEventListener('click', async () => {
        punchBtn.disabled = true;
        punchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
          const res = await window.EMS_API.attendance.markSelf();
          showNotification('Checked In', res.message, 'success');
          
          punchIndicator.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> Present</span>`;
          
          setTimeout(() => { window.location.reload(); }, 1000);
        } catch (error) {
          showNotification('Error', error.message, 'error');
          punchBtn.disabled = false;
          punchBtn.innerHTML = '<i class="fa-solid fa-fingerprint"></i><span>Check In</span>';
        }
      });

      await this.fetchEmployeeSelfHistory(showNotification);
    },

    async fetchEmployeeSelfHistory(showNotification) {
      const { tbody, punchBtn, punchIndicator } = this.elements;
      tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Updating list...</td></tr>';

      try {
        const response = await window.EMS_API.attendance.getHistory();
        const logs = response.data;

        // Check if checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = logs.find(l => l.date === todayStr);

        if (todayRecord) {
          punchBtn.disabled = true;
          punchIndicator.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> Checked In Today as ${todayRecord.status}</span>`;
        } else {
          punchBtn.disabled = false;
          punchIndicator.innerHTML = `<span style="color: var(--text-muted);">Punch biometric fingerprint scanner</span>`;
        }

        if (logs.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="3">
                <div class="empty-state" style="padding:20px;">
                  <p>You have not registered any attendance checks yet.</p>
                </div>
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = logs.map(l => {
          const statusClass = l.status === 'Present' ? 'status-approved' : (l.status === 'Late' ? 'status-pending' : 'status-rejected');
          const checkinTime = new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formattedDate = new Date(l.date + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

          return `
            <tr>
              <td style="font-family: var(--font-title); font-weight: 600;">${formattedDate}</td>
              <td style="font-family: var(--font-title); font-weight: 500;">${checkinTime}</td>
              <td><span class="status-pill ${statusClass}">${l.status}</span></td>
            </tr>
          `;
        }).join('');

      } catch (error) {
        showNotification('Sync Error', 'Could not fetch check-in history', 'error');
        tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="padding: 40px; color: var(--danger);">Error loading details</td></tr>';
      }
    }
  };

  // Expose
  window.AttendanceView = AttendanceView;
})();
