/* 
  =========================================
  AURAEMS EMPLOYEE MANAGEMENT VIEW COMPONENT
  =========================================
*/

(function () {
  const EmployeesView = {
    render(user) {
      const isAdmin = user.role === 'admin';
      
      if (!isAdmin) {
        return `
          <div class="glass-card text-center" style="padding: 60px;">
            <i class="fa-solid fa-lock" style="font-size: 3rem; color: var(--danger); opacity: 0.6; margin-bottom: 20px;"></i>
            <h3>Access Restricted</h3>
            <p style="color:var(--text-muted); margin-top: 10px;">Only administrative profiles are authorized to view or edit organizational employee rosters.</p>
          </div>
        `;
      }

      return `
        <!-- Control actions bar -->
        <div class="control-bar">
          <div class="search-input-box">
            <input type="text" id="employee-search" placeholder="Search by name, email, role...">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>

          <div class="filters-wrapper">
            <select class="select-filter" id="filter-dept">
              <option value="all">All Departments</option>
            </select>
            <select class="select-filter" id="filter-status">
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
            <button class="btn btn-primary btn-sm" id="btn-add-employee" style="margin-left: 12px; width:auto;">
              <i class="fa-solid fa-user-plus"></i>
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        <!-- Employees List Table -->
        <div class="table-responsive">
          <table class="data-table" id="employees-table">
            <thead>
              <tr>
                <th>Profile Info</th>
                <th>Department</th>
                <th>Role</th>
                <th>Salary (Annual)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="employees-list-tbody">
              <tr>
                <td colspan="6" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Fetching roster database...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add / Edit Modal Drawer Overlay -->
        <div class="modal-overlay" id="employee-modal">
          <div class="modal-container">
            <div class="modal-header">
              <h3 id="modal-title">Register New Employee</h3>
              <button class="modal-close-btn" id="employee-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <form id="employee-form">
              <input type="hidden" id="emp-id">
              <div class="modal-body">
                <div class="modal-grid-2">
                  <div class="form-group">
                    <label class="form-label" for="emp-name">Full Name</label>
                    <input type="text" id="emp-name" class="form-input" placeholder="e.g. Alice Cooper" required style="padding-left: 16px;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="emp-email">Email Address</label>
                    <input type="email" id="emp-email" class="form-input" placeholder="alice@company.com" required style="padding-left: 16px;">
                  </div>
                </div>

                <div class="modal-grid-2">
                  <div class="form-group">
                    <label class="form-label" for="emp-phone">Phone Number</label>
                    <input type="text" id="emp-phone" class="form-input" placeholder="e.g. +1 (555) 012-3456" required style="padding-left: 16px;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="emp-dob">Date of Birth</label>
                    <input type="date" id="emp-dob" class="form-input" required style="padding-left: 16px; color-scheme: dark;">
                  </div>
                </div>

                <div class="modal-grid-2">
                  <div class="form-group">
                    <label class="form-label" for="emp-dept">Department</label>
                    <select id="emp-dept" class="select-filter" style="width: 100%; background: rgba(0,0,0,0.2);" required>
                      <!-- Dynamically filled -->
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="emp-role">Designation / Role</label>
                    <input type="text" id="emp-role" class="form-input" placeholder="e.g. Junior Developer" required style="padding-left: 16px;">
                  </div>
                </div>

                <div class="modal-grid-2">
                  <div class="form-group">
                    <label class="form-label" for="emp-salary">Annual Salary ($)</label>
                    <input type="number" id="emp-salary" class="form-input" placeholder="e.g. 75000" min="0" required style="padding-left: 16px;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="emp-status">Active Status</label>
                    <select id="emp-status" class="select-filter" style="width: 100%; background: rgba(0,0,0,0.2);">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="emp-joindate">Date Joined</label>
                  <input type="date" id="emp-joindate" class="form-input" style="padding-left: 16px; color-scheme: dark;">
                </div>
                
                <!-- Manual Login Credentials (Only for New Employees) -->
                <div id="login-creds-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                  <h4 style="margin-bottom: 10px; font-size: 0.9rem; color: var(--primary);">System Login Credentials</h4>
                  <div class="modal-grid-2">
                    <div class="form-group">
                      <label class="form-label" for="emp-login-user">Username</label>
                      <input type="text" id="emp-login-user" class="form-input" placeholder="e.g. alice.smith" style="padding-left: 16px;">
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="emp-login-pass">Password</label>
                      <input type="password" id="emp-login-pass" class="form-input" placeholder="••••••••" style="padding-left: 16px;">
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-employee-cancel" style="width: auto;">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm" id="btn-employee-submit" style="width: auto;">Save Employee</button>
              </div>
            </form>
          </div>
        </div>

        <!-- View Full Profile Modal Drawer Overlay -->
        <div class="modal-overlay" id="view-employee-modal">
          <div class="modal-container">
            <div class="modal-header">
              <h3>Employee Full Profile</h3>
              <button class="modal-close-btn" id="view-employee-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" id="view-employee-body">
              <div class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>
            </div>
          </div>
        </div>
      `;
    },

    afterRender(user, showNotification) {
      if (user.role !== 'admin') return;

      this.departmentsList = [];
      this.employeesList = [];
      this.activeFilters = { department: 'all', status: 'all', search: '' };

      this.initElements();
      this.initEvents(showNotification);
      this.fetchDropdowns(showNotification);
      this.fetchEmployees(showNotification);
    },

    initElements() {
      this.elements = {
        tbody: document.getElementById('employees-list-tbody'),
        search: document.getElementById('employee-search'),
        deptFilter: document.getElementById('filter-dept'),
        statusFilter: document.getElementById('filter-status'),
        addBtn: document.getElementById('btn-add-employee'),
        
        // Modal elements
        modal: document.getElementById('employee-modal'),
        modalClose: document.getElementById('employee-modal-close'),
        cancelBtn: document.getElementById('btn-employee-cancel'),
        form: document.getElementById('employee-form'),
        modalTitle: document.getElementById('modal-title'),
        submitBtn: document.getElementById('btn-employee-submit'),

        // Inputs
        idInput: document.getElementById('emp-id'),
        nameInput: document.getElementById('emp-name'),
        emailInput: document.getElementById('emp-email'),
        phoneInput: document.getElementById('emp-phone'),
        dobInput: document.getElementById('emp-dob'),
        deptInput: document.getElementById('emp-dept'),
        roleInput: document.getElementById('emp-role'),
        salaryInput: document.getElementById('emp-salary'),
        statusInput: document.getElementById('emp-status'),
        joinInput: document.getElementById('emp-joindate'),

        // Manual Login
        credsSection: document.getElementById('login-creds-section'),
        loginUserInput: document.getElementById('emp-login-user'),
        loginPassInput: document.getElementById('emp-login-pass'),

        // View Profile Modal
        viewModal: document.getElementById('view-employee-modal'),
        viewModalClose: document.getElementById('view-employee-modal-close'),
        viewModalBody: document.getElementById('view-employee-body'),
      };
    },

    initEvents(showNotification) {
      const { search, deptFilter, statusFilter, addBtn, modal, modalClose, cancelBtn, form } = this.elements;

      // Filter change listeners
      const triggerFilterChange = () => {
        this.activeFilters.search = search.value.trim();
        this.activeFilters.department = deptFilter.value;
        this.activeFilters.status = statusFilter.value;
        this.fetchEmployees(showNotification);
      };

      // Debounce search
      let searchTimeout;
      search.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(triggerFilterChange, 400);
      });

      deptFilter.addEventListener('change', triggerFilterChange);
      statusFilter.addEventListener('change', triggerFilterChange);

      // Modal Triggers
      addBtn.addEventListener('click', () => {
        this.openAddModal();
      });

      const closeModalFn = () => {
        modal.classList.remove('active');
      };

      modalClose.addEventListener('click', closeModalFn);
      cancelBtn.addEventListener('click', closeModalFn);

      if (this.elements.viewModalClose) {
        this.elements.viewModalClose.addEventListener('click', () => {
          this.elements.viewModal.classList.remove('active');
        });
      }

      // Submit Form (Create / Update)
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleFormSubmit(showNotification);
      });
    },

    async fetchDropdowns(showNotification) {
      try {
        const response = await window.EMS_API.departments.getAll();
        this.departmentsList = response.data;
        
        // Seed filters & inputs
        const { deptFilter, deptInput } = this.elements;
        
        const optionsHtml = this.departmentsList.map(d => `<option value="${d._id}">${d.name}</option>`).join('');
        deptFilter.innerHTML = '<option value="all">All Departments</option>' + optionsHtml;
        deptInput.innerHTML = '<option value="" disabled selected>Select Department</option>' + optionsHtml;
      } catch (error) {
        console.error('Error fetching departments dropdowns', error);
      }
    },

    async fetchEmployees(showNotification) {
      const { tbody } = this.elements;
      tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Updating list...</td></tr>';

      try {
        const response = await window.EMS_API.employees.getAll(this.activeFilters);
        this.employeesList = response.data;

        if (this.employeesList.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6">
                <div class="empty-state">
                  <div class="empty-state-icon"><i class="fa-solid fa-users-slash"></i></div>
                  <h4>No Employees Found</h4>
                  <p>Try refining your search terms or filter constraints.</p>
                </div>
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = this.employeesList.map(emp => {
          const statusClass = emp.status === 'Active' ? 'status-active' : (emp.status === 'On Leave' ? 'status-leave' : 'status-inactive');
          const initials = encodeURIComponent(emp.name);
          const salaryFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(emp.salary);

          return `
            <tr>
              <td>
                <div class="profile-cell">
                  <img src="https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=80" alt="Avatar" class="avatar-img" style="width:36px; height:36px; border: 1px solid rgba(255,255,255,0.05);">
                  <div class="profile-cell-details">
                    <h5>${emp.name}</h5>
                    <span>${emp.email}</span>
                  </div>
                </div>
              </td>
              <td>${emp.department ? emp.department.name : '<span style="color:var(--text-muted)">Unassigned</span>'}</td>
              <td>${emp.role}</td>
              <td style="font-family: var(--font-title); font-weight: 500;">${salaryFormatted}</td>
              <td><span class="status-pill ${statusClass}">${emp.status}</span></td>
              <td>
                <div class="table-actions">
                  <button class="action-icon-btn action-view" title="View Full Profile" data-id="${emp._id}"><i class="fa-solid fa-eye"></i></button>
                  <button class="action-icon-btn action-edit" title="Edit Profile" data-id="${emp._id}"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button class="action-icon-btn action-delete" title="Delete Profile" data-id="${emp._id}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        // Attach action handlers dynamically
        tbody.querySelectorAll('.action-view').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const empId = btn.getAttribute('data-id');
            this.openViewModal(empId, showNotification);
          });
        });

        tbody.querySelectorAll('.action-edit').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const empId = btn.getAttribute('data-id');
            this.openEditModal(empId, showNotification);
          });
        });

        tbody.querySelectorAll('.action-delete').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const empId = btn.getAttribute('data-id');
            this.handleDelete(empId, showNotification);
          });
        });

      } catch (error) {
        showNotification('Sync Error', 'Could not refresh staff roster list', 'error');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--danger);">Error loading details from API</td></tr>';
      }
    },

    openAddModal() {
      const { form, modalTitle, idInput, nameInput, emailInput, phoneInput, dobInput, deptInput, roleInput, salaryInput, statusInput, joinInput, modal } = this.elements;

      form.reset();
      idInput.value = '';
      modalTitle.textContent = 'Register New Employee';
      statusInput.value = 'Active';
      statusInput.disabled = true; // Forcing 'Active' on initial creation
      
      const today = new Date().toISOString().split('T')[0];
      joinInput.value = today;

      emailInput.readOnly = false;

      // Show manual login section and require them
      this.elements.credsSection.style.display = 'block';
      this.elements.loginUserInput.required = true;
      this.elements.loginPassInput.required = true;
      this.elements.loginUserInput.value = '';
      this.elements.loginPassInput.value = '';

      modal.classList.add('active');
    },

    async openViewModal(id, showNotification) {
      const { viewModal, viewModalBody } = this.elements;
      viewModal.classList.add('active');
      viewModalBody.innerHTML = '<div class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Fetching profile...</div>';
      
      try {
        const response = await window.EMS_API.employees.getOne(id);
        const emp = response.data;
        
        const initials = encodeURIComponent(emp.name);
        const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=120`;
        const joinDateFormatted = emp.joinDate ? new Date(emp.joinDate).toLocaleDateString([], { month: 'long', year: 'numeric' }) : 'Unknown';
        const dobFormatted = emp.dob ? new Date(emp.dob).toLocaleDateString() : 'N/A';
        const salaryFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(emp.salary);
        const deptName = emp.department ? emp.department.name : 'Unassigned';

        viewModalBody.innerHTML = `
          <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
            <img src="${avatarUrl}" alt="Avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--primary);">
            <div>
              <h2 style="margin: 0; color: #fff;">${emp.name}</h2>
              <p style="margin: 4px 0 0; color: var(--text-muted); font-size: 1rem;">${emp.role} &bull; ${deptName}</p>
              <span class="status-pill ${emp.status === 'Active' ? 'status-active' : (emp.status === 'On Leave' ? 'status-leave' : 'status-inactive')}" style="margin-top: 8px; display: inline-block;">${emp.status}</span>
            </div>
          </div>
          <div class="profile-details-grid" style="grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="info-field-group">
              <span style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Email Address</span>
              <p style="color: #fff; font-weight: 500; font-size: 1.05rem;">${emp.email}</p>
            </div>
            <div class="info-field-group">
              <span style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Phone Number</span>
              <p style="color: #fff; font-weight: 500; font-size: 1.05rem;">${emp.phone}</p>
            </div>
            <div class="info-field-group" style="background: rgba(99, 102, 241, 0.1); padding: 10px; border-radius: 8px; border: 1px dashed var(--primary);">
              <span style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">System Username</span>
              <p style="color: var(--primary); font-weight: 600; font-family: monospace; font-size: 1.15rem;">${emp.username || 'Not Setup'}</p>
            </div>
            <div class="info-field-group">
              <span style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Join Date</span>
              <p style="color: #fff; font-weight: 500; font-size: 1.05rem;">${joinDateFormatted}</p>
            </div>
            <div class="info-field-group">
              <span style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Date of Birth</span>
              <p style="color: #fff; font-weight: 500; font-size: 1.05rem;">${dobFormatted}</p>
            </div>
            <div class="info-field-group">
              <span style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Annual Salary</span>
              <p style="color: #fff; font-weight: 500; font-size: 1.05rem;">${salaryFormatted}</p>
            </div>
          </div>
        `;
      } catch (error) {
        viewModalBody.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--danger);">Failed to load profile details</div>';
      }
    },

    async openEditModal(id, showNotification) {
      const { form, modalTitle, idInput, nameInput, emailInput, phoneInput, dobInput, deptInput, roleInput, salaryInput, statusInput, joinInput, modal } = this.elements;

      form.reset();
      idInput.value = id;
      modalTitle.textContent = 'Edit Employee Profile';
      statusInput.disabled = false;

      try {
        const response = await window.EMS_API.employees.getOne(id);
        const emp = response.data;

        nameInput.value = emp.name;
        emailInput.value = emp.email;
        emailInput.readOnly = true; // Email acts as lock unique identity for logins
        phoneInput.value = emp.phone;
        
        if (emp.dob) dobInput.value = new Date(emp.dob).toISOString().split('T')[0];
        if (emp.department) deptInput.value = emp.department._id;
        
        roleInput.value = emp.role;
        salaryInput.value = emp.salary;
        statusInput.value = emp.status;

        if (emp.joinDate) joinInput.value = new Date(emp.joinDate).toISOString().split('T')[0];

        // Hide manual login section on edit
        this.elements.credsSection.style.display = 'none';
        this.elements.loginUserInput.required = false;
        this.elements.loginPassInput.required = false;

        modal.classList.add('active');
      } catch (error) {
        showNotification('Fetch Error', 'Could not fetch profile details', 'error');
      }
    },

    async handleFormSubmit(showNotification) {
      const { idInput, nameInput, emailInput, phoneInput, dobInput, deptInput, roleInput, salaryInput, statusInput, joinInput, modal, submitBtn } = this.elements;

      const empId = idInput.value;
      const isEdit = !!empId;

      const empData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        dob: dobInput.value,
        department: deptInput.value,
        role: roleInput.value.trim(),
        salary: Number(salaryInput.value),
        status: statusInput.value,
        joinDate: joinInput.value,
      };

      if (!isEdit) {
        empData.loginUsername = this.elements.loginUserInput.value.trim();
        empData.loginPassword = this.elements.loginPassInput.value;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving details...';

      try {
        if (isEdit) {
          await window.EMS_API.employees.update(empId, empData);
          showNotification('Profile Updated', 'Employee record updated successfully', 'success');
          modal.classList.remove('active');
          await this.fetchEmployees(showNotification);
        } else {
          const response = await window.EMS_API.employees.create(empData);
          showNotification('Employee Created', 'Successfully registered new profile', 'success');
          modal.classList.remove('active');
          await this.fetchEmployees(showNotification);
        }
      } catch (error) {
        showNotification('Operation Failed', error.message || 'Error processing request', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Employee';
      }
    },

    async handleDelete(id, showNotification) {
      const confirmed = confirm('CRITICAL WARNING:\n\nDeleting this employee will permanently wipe their system credentials, historical attendance sheets, and requested leaves.\n\nAre you absolutely sure you wish to proceed?');
      
      if (!confirmed) return;

      try {
        await window.EMS_API.employees.delete(id);
        showNotification('Deleted Successfully', 'Employee profile and companion accounts wiped', 'success');
        await this.fetchEmployees(showNotification);
      } catch (error) {
        showNotification('Deletion Failed', error.message || 'Error executing request', 'error');
      }
    }
  };

  // Expose
  window.EmployeesView = EmployeesView;
})();
