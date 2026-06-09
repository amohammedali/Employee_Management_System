const ReportsView = {
  render() {
    return `
      <div class="reports-container fade-in">
        <h2 class="section-title">Reports & Analytics</h2>
        <p class="section-subtitle">Generate and download standard organizational reports in CSV format.</p>
        
        <div class="reports-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
          
          <!-- Payroll Report Card -->
          <div class="glass-card report-card" style="padding: 1.5rem;">
            <h3><i class="fas fa-file-invoice-dollar" style="color: var(--accent-blue); margin-right: 0.5rem;"></i> Payroll Register</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 1rem 0;">Download the current payroll and salary register for all active employees.</p>
            <div style="margin-top: 1.5rem;">
              <button id="btn-download-payroll" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-download"></i> Download Payroll CSV
              </button>
            </div>
          </div>

          <!-- Attendance Summary Card -->
          <div class="glass-card report-card" style="padding: 1.5rem;">
            <h3><i class="fas fa-calendar-check" style="color: var(--accent-green); margin-right: 0.5rem;"></i> Attendance Summary</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 1rem 0;">Download the historical attendance logs for a specific month.</p>
            <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div class="form-group" style="margin: 0;">
                <label for="report-month" style="font-size: 0.85rem;">Select Month</label>
                <input type="month" id="report-month" class="form-control" value="${new Date().toISOString().slice(0, 7)}" required>
              </div>
              <button id="btn-download-attendance" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-download"></i> Download Attendance CSV
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  async afterRender() {
    const btnPayroll = document.getElementById('btn-download-payroll');
    const btnAttendance = document.getElementById('btn-download-attendance');
    const monthInput = document.getElementById('report-month');

    // Payroll Download
    btnPayroll.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/api/reports/payroll';
      app.showNotification('Downloading Payroll report...', 'success');
    });

    // Attendance Download
    btnAttendance.addEventListener('click', (e) => {
      e.preventDefault();
      const month = monthInput.value;
      if (!month) {
        app.showNotification('Please select a month first.', 'error');
        return;
      }
      
      window.location.href = `/api/reports/attendance?month=${month}`;
      app.showNotification(`Downloading Attendance report for ${month}...`, 'success');
    });
  }
};

window.ReportsView = ReportsView;
