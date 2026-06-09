/* 
  =========================================
  AURAEMS LEAVES MANAGEMENT VIEW COMPONENT
  =========================================
*/

(function () {
  const LeavesView = {
    render(user) {
      const isAdmin = user.role === 'admin';

      return `
        <!-- Control actions strip -->
        <div class="control-bar">
          <div class="filters-wrapper">
            <select class="select-filter" id="filter-leave-status">
              <option value="all">All Leave Requests</option>
              <option value="Pending" selected>Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          ${!isAdmin ? `
            <button class="btn btn-primary btn-sm" id="btn-apply-leave" style="width: auto;">
              <i class="fa-solid fa-plane-departure"></i>
              <span>File Leave Request</span>
            </button>
          ` : '<span style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-solid fa-clipboard-check"></i> Pending inbox reviews</span>'}
        </div>

        <!-- Leaves Table -->
        <div class="table-responsive">
          <table class="data-table" id="leaves-table">
            <thead>
              <tr>
                <th>Employee Info</th>
                <th>Type</th>
                <th>Duration (From -> To)</th>
                <th>Reason / Description</th>
                <th>Status</th>
                ${isAdmin ? '<th>Review Actions</th>' : ''}
              </tr>
            </thead>
            <tbody id="leaves-list-tbody">
              <tr>
                <td colspan="${isAdmin ? 6 : 5}" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Retrieving inbox folders...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Employee Application Modal -->
        <div class="modal-overlay" id="apply-leave-modal">
          <div class="modal-container" style="max-width: 480px;">
            <div class="modal-header">
              <h3>File Leave Application</h3>
              <button class="modal-close-btn" id="apply-leave-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <form id="apply-leave-form">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label" for="leave-type">Leave Type</label>
                  <select id="leave-type" class="select-filter" style="width: 100%; background: rgba(0,0,0,0.2);" required>
                    <option value="" disabled selected>Select leave type</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div class="modal-grid-2">
                  <div class="form-group">
                    <label class="form-label" for="leave-from">From Date</label>
                    <input type="date" id="leave-from" class="form-input" style="padding-left: 16px; color-scheme: dark;" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="leave-to">To Date</label>
                    <input type="date" id="leave-to" class="form-input" style="padding-left: 16px; color-scheme: dark;" required>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="leave-reason">Reason for Leave</label>
                  <textarea id="leave-reason" class="form-input" placeholder="Explain details (e.g. medical appointment, annual holiday planning)..." style="padding-left: 16px; height: 100px; resize: none;" required></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-leave-cancel" style="width: auto;">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm" id="btn-leave-submit" style="width: auto;">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      `;
    },

    afterRender(user, showNotification) {
      this.isAdmin = user.role === 'admin';
      this.activeFilters = { status: 'Pending' };

      this.initElements();
      this.initEvents(showNotification);
      this.fetchLeaves(showNotification);
    },

    initElements() {
      this.elements = {
        tbody: document.getElementById('leaves-list-tbody'),
        statusFilter: document.getElementById('filter-leave-status'),
        applyBtn: document.getElementById('btn-apply-leave'),
        
        // Modal
        modal: document.getElementById('apply-leave-modal'),
        modalClose: document.getElementById('apply-leave-close'),
        cancelBtn: document.getElementById('btn-leave-cancel'),
        form: document.getElementById('apply-leave-form'),
        submitBtn: document.getElementById('btn-leave-submit'),

        // Inputs
        typeInput: document.getElementById('leave-type'),
        fromInput: document.getElementById('leave-from'),
        toInput: document.getElementById('leave-to'),
        reasonInput: document.getElementById('leave-reason'),
      };
    },

    initEvents(showNotification) {
      const { statusFilter, applyBtn, modal, modalClose, cancelBtn, form } = this.elements;

      statusFilter.addEventListener('change', () => {
        this.activeFilters.status = statusFilter.value;
        this.fetchLeaves(showNotification);
      });

      if (!this.isAdmin && applyBtn) {
        applyBtn.addEventListener('click', () => {
          form.reset();
          const today = new Date().toISOString().split('T')[0];
          document.getElementById('leave-from').value = today;
          document.getElementById('leave-to').value = today;
          modal.classList.add('active');
        });
      }

      const closeModalFn = () => { modal.classList.remove('active'); };
      if (modalClose) modalClose.addEventListener('click', closeModalFn);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModalFn);

      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleFormSubmit(showNotification);
        });
      }
    },

    async fetchLeaves(showNotification) {
      const { tbody } = this.elements;
      tbody.innerHTML = `<tr><td colspan="${this.isAdmin ? 6 : 5}" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading requests inbox...</td></tr>`;

      try {
        const response = await window.EMS_API.leaves.getAll(this.activeFilters);
        const leaves = response.data;

        if (leaves.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="${this.isAdmin ? 6 : 5}">
                <div class="empty-state">
                  <div class="empty-state-icon"><i class="fa-solid fa-folder-tree"></i></div>
                  <h4>No Leave Requests</h4>
                  <p>No records found matching status "${this.activeFilters.status}".</p>
                </div>
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = leaves.map(lv => {
          const statusClass = lv.status === 'Approved' ? 'status-approved' : (lv.status === 'Pending' ? 'status-pending' : 'status-rejected');
          
          let empName = 'My Profile';
          let emailSub = '';
          if (this.isAdmin) {
            const emp = lv.employeeId || { name: 'Deleted Employee', email: 'none' };
            empName = emp.name;
            emailSub = emp.email;
          }
          const initials = encodeURIComponent(empName);

          const fromStr = new Date(lv.fromDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
          const toStr = new Date(lv.toDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

          return `
            <tr>
              <td>
                <div class="profile-cell" style="gap: 8px;">
                  <img src="https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=60" alt="Avatar" class="avatar-img" style="width:28px; height:28px; border:1px solid rgba(255,255,255,0.05);">
                  <div style="font-size:0.9rem; font-weight:500;">
                    ${empName}
                    ${emailSub ? `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">${emailSub}</div>` : ''}
                  </div>
                </div>
              </td>
              <td style="font-family: var(--font-title); font-weight:600;">${lv.type}</td>
              <td style="font-family: var(--font-title); font-size:0.85rem; font-weight:500;">${fromStr} <i class="fa-solid fa-right-long" style="margin: 0 4px; font-size:0.75rem; color:var(--text-muted);"></i> ${toStr}</td>
              <td style="max-width: 260px; font-size: 0.82rem; color:var(--text-muted); line-height:1.4;" title="${lv.reason}">${lv.reason}</td>
              <td><span class="status-pill ${statusClass}">${lv.status}</span></td>
              ${this.isAdmin ? `
                <td>
                  <div class="table-actions">
                    ${lv.status === 'Pending' ? `
                      <button class="action-icon-btn action-approve" title="Approve Request" data-id="${lv._id}"><i class="fa-solid fa-circle-check"></i></button>
                      <button class="action-icon-btn action-reject" title="Reject Request" data-id="${lv._id}"><i class="fa-solid fa-circle-xmark"></i></button>
                    ` : '<span style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">Evaluated</span>'}
                  </div>
                </td>
              ` : ''}
            </tr>
          `;
        }).join('');

        if (this.isAdmin) {
          tbody.querySelectorAll('.action-approve').forEach(btn => {
            btn.addEventListener('click', async () => {
              const lvId = btn.getAttribute('data-id');
              await this.handleEvaluation(lvId, 'Approved', showNotification);
            });
          });

          tbody.querySelectorAll('.action-reject').forEach(btn => {
            btn.addEventListener('click', async () => {
              const lvId = btn.getAttribute('data-id');
              await this.handleEvaluation(lvId, 'Rejected', showNotification);
            });
          });
        }

      } catch (error) {
        showNotification('Sync Error', 'Could not refresh leave records', 'error');
        tbody.innerHTML = `<tr><td colspan="${this.isAdmin ? 6 : 5}" class="text-center" style="padding: 40px; color: var(--danger);">Error loading details from API</td></tr>`;
      }
    },

    async handleFormSubmit(showNotification) {
      const { typeInput, fromInput, toInput, reasonInput, modal, submitBtn } = this.elements;

      const from = new Date(fromInput.value);
      const to = new Date(toInput.value);

      if (from > to) {
        showNotification('Invalid Interval', 'From date cannot exceed To date', 'warning');
        return;
      }

      const leaveData = {
        type: typeInput.value,
        fromDate: fromInput.value,
        toDate: toInput.value,
        reason: reasonInput.value.trim(),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Filing request...';

      try {
        await window.EMS_API.leaves.apply(leaveData);
        showNotification('Application Filed', 'Leave request recorded for supervisor evaluation', 'success');
        modal.classList.remove('active');
        await this.fetchLeaves(showNotification);
      } catch (error) {
        showNotification('Filing Failed', error.message || 'Error processing request', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }
    },

    async handleEvaluation(id, status, showNotification) {
      const confirmed = confirm(`Are you sure you wish to mark this request as ${status}?`);
      if (!confirmed) return;

      try {
        await window.EMS_API.leaves.updateStatus(id, status);
        showNotification('Evaluation Completed', `Leave request marked as ${status.toLowerCase()}`, 'success');
        await this.fetchLeaves(showNotification);
      } catch (error) {
        showNotification('Evaluation Failed', error.message || 'Error executing request', 'error');
      }
    }
  };

  // Expose
  window.LeavesView = LeavesView;
})();
