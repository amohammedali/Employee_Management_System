/* 
  =========================================
  AURAEMS SPA APPLICATION CONTROLLER
  Central router, State manager, and UI polish
  =========================================
*/

(function () {
  // Global Application State
  const AppState = {
    user: null,
    activeView: 'dashboard',
  };

  // Toast Alerts Notification system
  function showNotification(title, description, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${description}</div>
      </div>
      <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    // Close on button click
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    });

    // Auto dismiss
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // Swap Layout shells (Auth vs. Roster Suite)
  function toggleLayoutShells(isLoggedIn) {
    const authContainer = document.getElementById('auth-container');
    const shellContainer = document.getElementById('main-app-shell');
    const loadingScreen = document.getElementById('app-loading');

    // Remove loading overlay if present
    if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
      loadingScreen.classList.add('fade-out');
    }

    if (isLoggedIn) {
      authContainer.classList.add('hidden');
      shellContainer.classList.remove('hidden');
      
      // Seed User profiles details in Sidebar shell
      document.getElementById('shell-username').textContent = AppState.user.username;
      
      const initials = encodeURIComponent(AppState.user.employeeId ? AppState.user.employeeId.name : AppState.user.username);
      document.getElementById('shell-avatar').src = `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=80`;
      
      const roleBadge = document.getElementById('shell-user-role');
      roleBadge.textContent = AppState.user.role;
      if (AppState.user.role === 'admin') {
        roleBadge.style.color = 'var(--accent)';
        roleBadge.style.fontWeight = 'bold';
      } else {
        roleBadge.style.color = 'var(--text-muted)';
      }

      // Hide restricted sidebar links from Employees (RBAC UI check)
      const empNavLink = document.getElementById('nav-employees');
      const deptNavLink = document.getElementById('nav-departments');
      if (AppState.user.role === 'employee') {
        if (empNavLink) empNavLink.classList.add('hidden');
        if (deptNavLink) deptNavLink.classList.add('hidden');
      } else {
        if (empNavLink) empNavLink.classList.remove('hidden');
        if (deptNavLink) deptNavLink.classList.remove('hidden');
      }

    } else {
      shellContainer.classList.add('hidden');
      authContainer.classList.remove('hidden');
    }
  }

  // View Router mapping
  const ViewRouter = {
    dashboard: window.DashboardView,
    employees: window.EmployeesView,
    departments: window.DepartmentsView,
    attendance: window.AttendanceView,
    leaves: window.LeavesView,
    reports: window.ReportsView,
  };

  // Central Routing processor
  async function resolveRoute() {
    if (!AppState.user) {
      // Not logged in -> Render login form container
      const container = document.getElementById('auth-container');
      container.innerHTML = window.LoginView.render();
      window.LoginView.afterRender((userObj) => {
        AppState.user = userObj;
        toggleLayoutShells(true);
        window.location.hash = '#dashboard'; // redirect to core
      }, showNotification);

      toggleLayoutShells(false);
      return;
    }

    // Parse route from Hash URL
    let hash = window.location.hash.slice(1) || 'dashboard';
    
    // Safety check: Employees are restricted from access to Employees, Departments, and Reports pages
    if (AppState.user.role === 'employee' && (hash === 'employees' || hash === 'departments' || hash === 'reports')) {
      showNotification('Access Restrained', 'Role not authorized to review this panel', 'warning');
      window.location.hash = '#dashboard';
      return;
    }

    // Default fall-back if route not defined
    if (!ViewRouter[hash]) {
      hash = 'dashboard';
      window.location.hash = '#dashboard';
    }

    AppState.activeView = hash;
    const activeRouteComponent = ViewRouter[hash];

    // Render HTML viewport container
    const viewport = document.getElementById('app-viewport');
    viewport.innerHTML = activeRouteComponent.render(AppState.user);

    // Active Sidebar item styling
    document.querySelectorAll('.menu-item').forEach(item => {
      if (item.getAttribute('data-view') === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Header labels
    const titleEl = document.getElementById('navbar-view-title');
    const subtitleEl = document.getElementById('navbar-view-subtitle');

    if (hash === 'dashboard') {
      titleEl.textContent = 'Dashboard Overview';
      subtitleEl.textContent = 'Organizational statistics, charts and corporate feeds';
    } else if (hash === 'employees') {
      titleEl.textContent = 'Personnel Roster';
      subtitleEl.textContent = 'Manage active employee records, contracts and roles';
    } else if (hash === 'departments') {
      titleEl.textContent = 'Operational Departments';
      subtitleEl.textContent = 'Corporate segments and leadership directories';
    } else if (hash === 'attendance') {
      titleEl.textContent = 'Attendance Logs';
      subtitleEl.textContent = 'Supervisor records, timesheets and daily check-ins';
    } else if (hash === 'leaves') {
      titleEl.textContent = 'Leaves Planner';
      subtitleEl.textContent = 'File leave requests, calendar plans and approvals';
    } else if (hash === 'reports') {
      titleEl.textContent = 'Reports & Analytics';
      subtitleEl.textContent = 'Generate CSV datasets for Payroll and Attendance logs';
    }

    // Fire view's specific events hooks
    if (activeRouteComponent.afterRender) {
      activeRouteComponent.afterRender(AppState.user, showNotification);
    }
  }

  // App Startup Hook
  async function initializeApplication() {
    // 1. Setup Theme toggler
    const themeBtn = document.getElementById('ui-theme-toggle');
    const savedTheme = localStorage.getItem('aura-theme') || 'dark';
    
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      
      localStorage.setItem('aura-theme', isLight ? 'light' : 'dark');
      themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      showNotification('Theme Toggled', `Swapped to ${isLight ? 'Light' : 'Premium Dark'} mode`, 'info');
    });

    // 2. Setup Mobile navigation toggler
    const mobileBtn = document.getElementById('mobile-sidebar-toggle');
    const navMenu = document.querySelector('.top-menu-nav');

    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      });

      // Close navigation menu if user clicks elsewhere
      document.addEventListener('click', (e) => {
        if (!mobileBtn.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove('active');
          const icon = mobileBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        }
      });

      // Close menu when a menu item is clicked
      navMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
          navMenu.classList.remove('active');
          const icon = mobileBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        });
      });
    }

    // 3. Setup Logout Trigger
    const logoutBtn = document.getElementById('shell-logout-btn');
    logoutBtn.addEventListener('click', async () => {
      try {
        await window.EMS_API.auth.logout();
        AppState.user = null;
        showNotification('Signed Out', 'Logged out successfully', 'success');
        toggleLayoutShells(false);
        window.location.hash = ''; // reset hash
        resolveRoute();
      } catch (error) {
        showNotification('Logout Error', 'Error processing request', 'error');
      }
    });

    // 4. Session Expiry Handler
    window.addEventListener('ems-session-expired', () => {
      AppState.user = null;
      toggleLayoutShells(false);
      showNotification('Session Expired', 'Please login again to continue.', 'warning');
      window.location.hash = '';
      resolveRoute();
    });

    // 5. Check active cookies session
    try {
      const response = await window.EMS_API.auth.me();
      AppState.user = response.user;
      toggleLayoutShells(true);
    } catch (error) {
      // No active session cookie -> redirect to login
      AppState.user = null;
      toggleLayoutShells(false);
    }

    // 6. Hook Router events
    window.addEventListener('hashchange', resolveRoute);
    
    // Resolve initial route
    resolveRoute();
  }

  // Boot Application
  document.addEventListener('DOMContentLoaded', initializeApplication);
})();
