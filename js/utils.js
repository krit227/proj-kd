/**
 * Utility functions for the Kidney Dialysis Project
 */

// Network status monitoring
class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.statusElement = null;
    this.init();
  }

  init() {
    // Create network status indicator
    this.statusElement = document.createElement('div');
    this.statusElement.className = 'network-status';
    this.statusElement.textContent = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อของคุณ';
    document.body.appendChild(this.statusElement);

    // Listen for network changes
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }

  updateStatus(isOnline) {
    this.isOnline = isOnline;
    if (isOnline) {
      this.statusElement.classList.remove('show');
    } else {
      this.statusElement.classList.add('show');
    }
  }
}

// Loading manager
class LoadingManager {
  constructor() {
    this.overlay = null;
    this.createOverlay();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.style.display = 'none';
    this.overlay.innerHTML = `
      <div class="loading-spinner"></div>
    `;
    document.body.appendChild(this.overlay);
  }

  show() {
    if (this.overlay) {
      this.overlay.style.display = 'flex';
    }
  }

  hide() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }
}

// Toast notification system
class ToastManager {
  constructor() {
    this.container = null;
    this.createContainer();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.pointerEvents = 'auto';

    this.container.appendChild(toast);

    // Trigger show animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);

    return toast;
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }
}

// Form validation utilities
class FormValidator {
  constructor() {
    this.rules = {
      required: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
      number: (value) => !isNaN(value) && isFinite(value),
      positiveNumber: (value) => !isNaN(value) && isFinite(value) && value > 0,
      range: (min, max) => (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
      },
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    };
  }

  validate(formData, validationRules) {
    const errors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData[fieldName];
      const fieldRules = validationRules[fieldName];

      fieldRules.forEach(rule => {
        if (typeof rule === 'string') {
          // Simple rule name
          if (!this.rules[rule](value)) {
            if (!errors[fieldName]) errors[fieldName] = [];
            errors[fieldName].push(this.getErrorMessage(rule, fieldName));
          }
        } else if (typeof rule === 'object') {
          // Rule with parameters
          const ruleName = rule.rule;
          const params = rule.params || [];
          if (!this.rules[ruleName](...params)(value)) {
            if (!errors[fieldName]) errors[fieldName] = [];
            errors[fieldName].push(rule.message || this.getErrorMessage(ruleName, fieldName));
          }
        }
      });
    });

    return errors;
  }

  getErrorMessage(rule, fieldName) {
    const messages = {
      required: `กรุณากรอก${fieldName}`,
      number: `${fieldName}ต้องเป็นตัวเลข`,
      positiveNumber: `${fieldName}ต้องเป็นตัวเลขที่มากกว่า 0`,
      range: `${fieldName}อยู่นอกช่วงที่กำหนด`,
      email: `รูปแบบอีเมลไม่ถูกต้อง`
    };
    return messages[rule] || `${fieldName}ไม่ถูกต้อง`;
  }

  showFieldErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.form-field').forEach(field => {
      field.classList.remove('error');
    });
    document.querySelectorAll('.field-error').forEach(error => {
      error.style.display = 'none';
    });

    // Show new errors
    Object.keys(errors).forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const formField = field.closest('.form-field') || field.parentElement;
        formField.classList.add('error');

        let errorElement = formField.querySelector('.field-error');
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'field-error';
          formField.appendChild(errorElement);
        }

        errorElement.textContent = errors[fieldName][0];
        errorElement.style.display = 'block';
      }
    });
  }
}

// UUID generation
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Session management
class SessionManager {
  constructor() {
    this.sessionKey = 'sessionId';
    this.dataKey = 'ckdData';
    this.timeout = 30 * 60 * 1000; // 30 minutes
    this.init();
  }

  init() {
    if (!this.getSessionId()) {
      this.createSession();
    }
    this.updateLastActivity();
    this.setupActivityTracking();
  }

  createSession() {
    const sessionId = generateUUID();
    localStorage.setItem(this.sessionKey, sessionId);
    localStorage.setItem('sessionCreated', Date.now().toString());
    return sessionId;
  }

  getSessionId() {
    return localStorage.getItem(this.sessionKey);
  }

  updateLastActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  setupActivityTracking() {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.updateLastActivity(), true);
    });
  }

  checkSessionValidity() {
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const now = Date.now();
    
    if (now - lastActivity > this.timeout) {
      this.clearSession();
      return false;
    }
    return true;
  }

  clearSession() {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.dataKey);
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('sessionCreated');
  }

  getData() {
    if (!this.checkSessionValidity()) {
      return null;
    }
    const data = localStorage.getItem(this.dataKey);
    return data ? JSON.parse(data) : null;
  }

  setData(data) {
    this.updateLastActivity();
    localStorage.setItem(this.dataKey, JSON.stringify(data));
  }
}

// Error logging
class ErrorLogger {
  constructor() {
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : 'No stack trace available'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'promise',
        message: event.reason.message || 'Unhandled promise rejection',
        stack: event.reason.stack || 'No stack trace available'
      });
    });
  }

  logError(errorInfo) {
    console.error('Application Error:', errorInfo);
    
    // Optional: Send to error tracking service
    // this.sendToErrorService(errorInfo);
  }

  sendToErrorService(errorInfo) {
    // Implementation for sending errors to external service
    // Could be Google Apps Script, Sentry, etc.
    const errorData = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: new SessionManager().getSessionId()
    };

    // Example implementation (uncomment if needed)
    /*
    fetch('YOUR_ERROR_LOGGING_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData)
    }).catch(err => {
      console.error('Failed to send error log:', err);
    });
    */
  }
}

// Sanitization utilities
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    input = String(input);
  }
  return input.replace(/[<>\"'&]/g, function(match) {
    const escapeMap = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return escapeMap[match];
  });
}

// Initialize global utilities
const networkMonitor = new NetworkMonitor();
const loadingManager = new LoadingManager();
const toastManager = new ToastManager();
const formValidator = new FormValidator();
const sessionManager = new SessionManager();
const errorLogger = new ErrorLogger();

// Export for use in other modules
window.KDUtils = {
  NetworkMonitor,
  LoadingManager,
  ToastManager,
  FormValidator,
  SessionManager,
  ErrorLogger,
  generateUUID,
  sanitizeInput,
  networkMonitor,
  loadingManager,
  toastManager,
  formValidator,
  sessionManager,
  errorLogger
};