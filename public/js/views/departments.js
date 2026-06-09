/* 
  =========================================
  AURAEMS DEPARTMENT VIEW COMPONENT
  =========================================
*/

(function () {
  const DepartmentsView = {
    render(user) {
      const isAdmin = user.role === 'admin';

      return `
        <!-- Actions strip -->
        <div class="control-bar" style="justify-content: flex-end;">
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" id="btn-add-dept" style="width: auto;">
              <i class="fa-solid fa-folder-plus"></i>
              <span>Create Department</span>
            </button>
          ` : '<span style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-solid fa-info-circle"></i> Showing organizational departments overview</span>'}
        </div>

        <!-- Departments List Table -->
        <div class="table-responsive">
          <table class="data-table" id="departments-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Manager / Supervisor</th>
                <th>Description</th>
                <th style="text-align: center;">Headcount</th>
                ${isAdmin ? '<th>Actions</th>' : ''}
              </tr>
            </thead>
            <tbody id="departments-list-tbody">
              <tr>
                <td colspan="${isAdmin ? 5 : 4}" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Fetching corporate hierarchy...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add / Edit Modal Drawer Overlay -->
        <div class="modal-overlay" id="dept-modal">
          <div class="modal-container">
            <div class="modal-header">
              <h3 id="dept-modal-title">Create New Department</h3>
              <button class="modal-close-btn" id="dept-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <form id="dept-form">
              <input type="hidden" id="dept-id">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label" for="dept-name">Department Name</label>
                  <input type="text" id="dept-name" class="form-input" placeholder="e.g. Quality Assurance" required style="padding-left: 16px;">
                </div>

                <div class="form-group">
                  <label class="form-label" for="dept-manager">Manager / Head of Dept</label>
                  <select id="dept-manager" class="select-filter" style="width: 100%; background: rgba(0,0,0,0.2);">
                    <option value="">None / Open Position</option>
                    <!-- Dynamically seeded -->
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="dept-desc">Description</label>
                  <textarea id="dept-desc" class="form-input" placeholder="Write a brief overview of this unit's goals and responsibilities..." style="padding-left: 16px; height: 100px; resize: none;"></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-dept-cancel" style="width: auto;">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm" id="btn-dept-submit" style="width: auto;">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      `;
    },

    afterRender(user, showNotification) {
      this.isAdmin = user.role === 'admin';
      this.departmentsList = [];
      this.employeesList = [];

      this.initElements();
      this.initEvents(showNotification);
      this.fetchEmployees(showNotification);
      this.fetchDepartments(showNotification);
    },

    initElements() {
      this.elements = {
        tbody: document.getElementById('departments-list-tbody'),
        addBtn: document.getElementById('btn-add-dept'),
        
        // Modal elements
        modal: document.getElementById('dept-modal'),
        modalClose: document.getElementById('dept-modal-close'),
        cancelBtn: document.getElementById('btn-dept-cancel'),
        form: document.getElementById('dept-form'),
        modalTitle: document.getElementById('dept-modal-title'),
        submitBtn: document.getElementById('btn-dept-submit'),

        // Inputs
        idInput: document.getElementById('dept-id'),
        nameInput: document.getElementById('dept-name'),
        managerInput: document.getElementById('dept-manager'),
        descInput: document.getElementById('dept-desc'),
      };
    },

    initEvents(showNotification) {
      const { addBtn, modal, modalClose, cancelBtn, form } = this.elements;

      if (this.isAdmin && addBtn) {
        addBtn.addEventListener('click', () => {
          this.openAddModal();
        });
      }

      const closeModalFn = () => {
        modal.classList.remove('active');
      };

      if (modalClose) modalClose.addEventListener('click', closeModalFn);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModalFn);

      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleFormSubmit(showNotification);
        });
      }
    },

    async fetchEmployees(showNotification) {
      if (!this.isAdmin) return;
      try {
        const response = await window.EMS_API.employees.getAll();
        this.employeesList = response.data;
        
        // Populate manager selector
        const { managerInput } = this.elements;
        managerInput.innerHTML = '<option value="">None / Open Position</option>' + 
          this.employeesList.map(e => `<option value="${e._id}">${e.name} (${e.role})</option>`).join('');
      } catch (error) {
        console.error('Error fetching employees roster for managers', error);
      }
    },

    async fetchDepartments(showNotification) {
      const { tbody } = this.elements;
      tbody.innerHTML = `<tr><td colspan="${this.isAdmin ? 5 : 4}" class="text-center" style="padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Syncing department details...</td></tr>`;

      try {
        const response = await window.EMS_API.departments.getAll();
        this.departmentsList = response.data;

        if (this.departmentsList.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="${this.isAdmin ? 5 : 4}">
                <div class="empty-state">
                  <div class="empty-state-icon"><i class="fa-solid fa-folder-open"></i></div>
                  <h4>No Departments Registered</h4>
                  <p>Register a department to begin mapping employee roles.</p>
                </div>
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = this.departmentsList.map(dept => {
          const managerName = dept.manager ? dept.manager.name : '<span style="color:var(--text-muted); font-style:italic;">Vacant Position</span>';
          const description = dept.description || '<span style="color:var(--text-muted); font-style:italic;">No description added</span>';
          
          return `
            <tr>
              <td style="font-family: var(--font-title); font-weight: 600;">${dept.name}</td>
              <td>
                <div class="profile-cell" style="gap: 8px;">
                  ${dept.manager ? `
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(dept.manager.name)}&background=a855f7&color=fff&size=60" alt="Avatar" class="avatar-img" style="width:28px; height:28px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:0.9rem; font-weight:500;">${managerName}</div>
                  ` : `
                    <div class="log-icon-pill" style="width:28px; height:28px; background:rgba(255,255,255,0.05); font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-circle-question"></i></div>
                    <div style="font-size:0.9rem; font-weight:500; color:var(--text-muted);">${managerName}</div>
                  `}
                </div>
              </td>
              <td style="max-width: 320px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${description}</td>
              <td style="text-align: center; font-family: var(--font-title); font-weight: 700;">
                <span style="background:rgba(99,102,241,0.08); padding:6px 14px; border-radius:12px; border:1px solid rgba(99,102,241,0.15); color:var(--primary); font-size:0.85rem;">
                  ${dept.headcount}
                </span>
              </td>
              ${this.isAdmin ? `
                <td>
                  <div class="table-actions">
                    <button class="action-icon-btn action-edit" title="Edit Department" data-id="${dept._id}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-icon-btn action-delete" title="Delete Department" data-id="${dept._id}"><i class="fa-solid fa-trash-can"></i></button>
                  </div>
                </td>
              ` : ''}
            </tr>
          `;
        }).join('');

        if (this.isAdmin) {
          tbody.querySelectorAll('.action-edit').forEach(btn => {
            btn.addEventListener('click', () => {
              const deptId = btn.getAttribute('data-id');
              this.openEditModal(deptId, showNotification);
            });
          });

          tbody.querySelectorAll('.action-delete').forEach(btn => {
            btn.addEventListener('click', () => {
              const deptId = btn.getAttribute('data-id');
              this.handleDelete(deptId, showNotification);
            });
          });
        }

      } catch (error) {
        showNotification('Sync Error', 'Could not refresh departments rosters', 'error');
        tbody.innerHTML = `<tr><td colspan="${this.isAdmin ? 5 : 4}" class="text-center" style="padding: 40px; color: var(--danger);">Error loading details from API</td></tr>`;
      }
    },

    openAddModal() {
      const { form, modalTitle, idInput, modal } = this.elements;
      form.reset();
      idInput.value = '';
      modalTitle.textContent = 'Create New Department';
      modal.classList.add('active');
    },

    async openEditModal(id, showNotification) {
      const { form, modalTitle, idInput, nameInput, managerInput, descInput, modal } = this.elements;
      form.reset();
      idInput.value = id;
      modalTitle.textContent = 'Modify Department Details';

      try {
        const response = await window.EMS_API.departments.getOne(id);
        const dept = response.data;

        nameInput.value = dept.name;
        managerInput.value = dept.manager ? dept.manager._id : '';
        descInput.value = dept.description || '';

        modal.classList.add('active');
      } catch (error) {
        showNotification('Fetch Error', 'Could not fetch department details', 'error');
      }
    },

    async handleFormSubmit(showNotification) {
      const { idInput, nameInput, managerInput, descInput, modal, submitBtn } = this.elements;

      const deptId = idInput.value;
      const isEdit = !!deptId;

      const deptData = {
        name: nameInput.value.trim(),
        manager: managerInput.value || null,
        description: descInput.value.trim(),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving unit details...';

      try {
        if (isEdit) {
          await window.EMS_API.departments.update(deptId, deptData);
          showNotification('Department Saved', 'Department updated successfully', 'success');
        } else {
          await window.EMS_API.departments.create(deptData);
          showNotification('Department Created', 'Successfully registered new department', 'success');
        }
        modal.classList.remove('active');
        await this.fetchDepartments(showNotification);
      } catch (error) {
        showNotification('Operation Failed', error.message || 'Error processing request', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Department';
      }
    },

    async handleDelete(id, showNotification) {
      const confirmed = confirm('Are you sure you wish to delete this department?');
      if (!confirmed) return;

      try {
        await window.EMS_API.departments.delete(id);
        showNotification('Deleted Successfully', 'Department removed from records', 'success');
        await this.fetchDepartments(showNotification);
      } catch (error) {
        showNotification('Action Aborted', error.message || 'Error executing request', 'error');
      }
    }
  };

  // Expose
  window.DepartmentsView = DepartmentsView;
})();
