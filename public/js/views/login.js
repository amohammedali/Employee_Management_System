/* 
  =========================================
  AURAEMS LOGIN VIEW COMPONENT
  =========================================
*/

(function () {
  const LoginView = {
    render() {
      return `
        <div class="auth-card glass-card">
          <div class="auth-header">
            <div class="auth-logo">
              <i class="fa-solid fa-compass-drafting"></i>
            </div>
            <h1>Aura<span>EMS</span></h1>
            <p>Organization Resource Planner</p>
          </div>

          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="username">Username</label>
              <div class="input-container">
                <input type="text" id="username" class="form-input" placeholder="e.g. admin or alice" required autocomplete="username">
                <i class="fa-solid fa-user input-icon"></i>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="input-container">
                <input type="password" id="password" class="form-input" placeholder="••••••••" required autocomplete="current-password">
                <i class="fa-solid fa-lock input-icon"></i>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" id="login-submit-btn">
              <span>Sign In</span>
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
            </button>
          </form>

          <div style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: var(--border-radius-md); font-size: 0.85rem; color: var(--text-muted);">
            <div style="margin-bottom: 8px; font-weight: 600; color: var(--text-main);"><i class="fa-solid fa-circle-info" style="margin-right: 6px;"></i> Demo Credentials</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span><strong>Admin:</strong> admin</span>
              <span style="font-family: monospace;">admin123</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Employee:</strong> alice</span>
              <span style="font-family: monospace;">Welcome123</span>
            </div>
          </div>

        </div>
      `;
    },

    afterRender(onLoginSuccess, showNotification) {
      const form = document.getElementById('login-form');
      const submitBtn = document.getElementById('login-submit-btn');

      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameVal = document.getElementById('username').value.trim();
        const passwordVal = document.getElementById('password').value;

        if (!usernameVal || !passwordVal) {
          showNotification('Warning', 'Please provide username and password', 'warning');
          return;
        }

        // Set Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span>Verifying Credentials...</span>
          <i class="fa-solid fa-circle-notch fa-spin"></i>
        `;

        try {
          const response = await window.EMS_API.auth.login(usernameVal, passwordVal);
          showNotification('Success', `Welcome back, ${response.user.username}!`, 'success');
          
          // Trigger parent success callback
          if (onLoginSuccess) {
            onLoginSuccess(response.user);
          }
        } catch (error) {
          showNotification('Login Failed', error.message || 'Invalid username or password', 'error');
          // Reset Button
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Sign In</span>
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
          `;
        }
      });
    }
  };

  // Expose
  window.LoginView = LoginView;
})();
