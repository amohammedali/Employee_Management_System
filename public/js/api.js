/* 
  =========================================
  AURAEMS API WRAPPER SERVICE
  Centralized Fetch wrappers with error handling
  =========================================
*/

(function () {
  const BASE_URL = '/api';

  // Core fetch wrapper
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // Set headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        // Session expired / Unauthorized
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          // Trigger redirect to login via event
          window.dispatchEvent(new CustomEvent('ems-session-expired'));
        }
        
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // API Methods
  const EMS_API = {
    // Auth endpoints
    auth: {
      async login(username, password) {
        return request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
      },
      async logout() {
        return request('/auth/logout', { method: 'POST' });
      },
      async me() {
        return request('/auth/me');
      },
    },

    // Dashboard endpoints
    dashboard: {
      async getStats() {
        return request('/dashboard/stats');
      },
    },

    // Employees CRUD
    employees: {
      async getAll(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.department) queryParams.append('department', filters.department);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        
        const queryString = queryParams.toString();
        const endpoint = `/employees${queryString ? `?${queryString}` : ''}`;
        return request(endpoint);
      },
      async getOne(id) {
        return request(`/employees/${id}`);
      },
      async create(employeeData) {
        return request('/employees', {
          method: 'POST',
          body: JSON.stringify(employeeData),
        });
      },
      async update(id, employeeData) {
        return request(`/employees/${id}`, {
          method: 'PUT',
          body: JSON.stringify(employeeData),
        });
      },
      async delete(id) {
        return request(`/employees/${id}`, {
          method: 'DELETE',
        });
      },
    },

    // Departments CRUD
    departments: {
      async getAll() {
        return request('/departments');
      },
      async getOne(id) {
        return request(`/departments/${id}`);
      },
      async create(deptData) {
        return request('/departments', {
          method: 'POST',
          body: JSON.stringify(deptData),
        });
      },
      async update(id, deptData) {
        return request(`/departments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(deptData),
        });
      },
      async delete(id) {
        return request(`/departments/${id}`, {
          method: 'DELETE',
        });
      },
    },

    // Attendance endpoints
    attendance: {
      async getHistory(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.date) queryParams.append('date', filters.date);
        if (filters.search) queryParams.append('search', filters.search);
        
        const queryString = queryParams.toString();
        const endpoint = `/attendance${queryString ? `?${queryString}` : ''}`;
        return request(endpoint);
      },
      async markSelf() {
        return request('/attendance/mark', {
          method: 'POST',
        });
      },
      async markAdmin(employeeId, date, status) {
        return request('/attendance/admin/mark', {
          method: 'POST',
          body: JSON.stringify({ employeeId, date, status }),
        });
      },
    },

    // Leaves endpoints
    leaves: {
      async getAll(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        
        const queryString = queryParams.toString();
        const endpoint = `/leaves${queryString ? `?${queryString}` : ''}`;
        return request(endpoint);
      },
      async apply(leaveData) {
        return request('/leaves', {
          method: 'POST',
          body: JSON.stringify(leaveData),
        });
      },
      async updateStatus(id, status) {
        return request(`/leaves/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
      },
    },

    // Reports endpoints
    reports: {
      async downloadCSV(endpoint, filename) {
        try {
          const res = await fetch(`/api${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to download report');
          }
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          
          return { success: true };
        } catch (error) {
          console.error('Download error:', error);
          throw error;
        }
      }
    },
  };

  // Expose to window global context
  window.EMS_API = EMS_API;
})();
