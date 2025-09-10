/**
 * API communication module for Google Apps Script backend
 */

class APIClient {
  constructor() {
    this.baseURL = 'https://script.google.com/macros/s/AKfycbwx9_ZYBHzonCIgQ3GeOA6zoOfNnUYuAG_snyeQ1ifE09bGk6p0KX0pm62i_OvglFlSuA/exec';
    this.timeout = 30000; // 30 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Send data to Google Apps Script with retry mechanism
   * @param {Object} data - Data to send
   * @param {Object} options - Additional options
   * @returns {Promise} API response
   */
  async sendData(data, options = {}) {
    const { 
      showLoading = true, 
      retries = this.maxRetries,
      timeout = this.timeout 
    } = options;

    if (showLoading) {
      window.KDUtils.loadingManager.show();
    }

    try {
      // Check network connectivity
      if (!window.KDUtils.networkMonitor.isOnline) {
        throw new Error('ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อของคุณ');
      }

      // Validate and sanitize data
      const sanitizedData = this.sanitizeData(data);
      
      // Prepare form data
      const formData = new URLSearchParams();
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] !== null && sanitizedData[key] !== undefined) {
          formData.append(key, sanitizedData[key]);
        }
      });

      // Add timestamp and session info
      formData.append('timestamp', new Date().toISOString());
      formData.append('sessionId', window.KDUtils.sessionManager.getSessionId());

      const response = await this.fetchWithRetry(this.baseURL, {
        method: 'POST',
        body: formData
      }, retries, timeout);

      if (showLoading) {
        window.KDUtils.loadingManager.hide();
      }

      return {
        success: true,
        data: response,
        message: 'ส่งข้อมูลสำเร็จ'
      };

    } catch (error) {
      if (showLoading) {
        window.KDUtils.loadingManager.hide();
      }

      console.error('API Error:', error);
      window.KDUtils.errorLogger.logError({
        type: 'api',
        function: 'sendData',
        message: error.message,
        data: data
      });

      // Show user-friendly error message
      const userMessage = this.getUserFriendlyErrorMessage(error);
      window.KDUtils.toastManager.error(userMessage);

      return {
        success: false,
        error: error.message,
        userMessage: userMessage
      };
    }
  }

  /**
   * Fetch with retry mechanism
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @param {number} retries - Number of retries
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Response
   */
  async fetchWithRetry(url, options, retries, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      return text;

    } catch (error) {
      clearTimeout(timeoutId);

      if (retries > 0 && this.isRetryableError(error)) {
        console.log(`Retrying request... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
        await this.delay(this.retryDelay * (this.maxRetries - retries + 1));
        return this.fetchWithRetry(url, options, retries - 1, timeout);
      }

      throw error;
    }
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error object
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError(error) {
    // Network errors, timeouts, and 5xx server errors are retryable
    return (
      error.name === 'AbortError' ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('HTTP 5')
    );
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly message
   */
  getUserFriendlyErrorMessage(error) {
    if (error.name === 'AbortError') {
      return 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    }

    if (error.message.includes('HTTP 4')) {
      return 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
    }

    if (error.message.includes('HTTP 5')) {
      return 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ในภายหลัง';
    }

    return 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง';
  }

  /**
   * Sanitize data before sending
   * @param {Object} data - Data to sanitize
   * @returns {Object} Sanitized data
   */
  sanitizeData(data) {
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
      let value = data[key];
      
      if (typeof value === 'string') {
        value = window.KDUtils.sanitizeInput(value);
        // Remove any potential script tags or dangerous content
        value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
      
      sanitized[key] = value;
    });

    return sanitized;
  }

  /**
   * Delay function for retry mechanism
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Submit initial calculation data (G1-G3 stages)
   * @param {Object} calculationData - eGFR calculation results
   * @returns {Promise} API response
   */
  async submitCalculationData(calculationData) {
    const data = {
      ...calculationData,
      actionType: 'initial_calculation'
    };

    return this.sendData(data, {
      showLoading: true
    });
  }

  /**
   * Submit full patient journey data (G4-G5 stages)
   * @param {Object} fullData - Complete patient data including RRT choice, etc.
   * @returns {Promise} API response
   */
  async submitFullData(fullData) {
    const data = {
      ...fullData,
      actionType: 'full_submit'
    };

    return this.sendData(data, {
      showLoading: true
    });
  }

  /**
   * Submit feedback data
   * @param {Object} feedbackData - User feedback
   * @returns {Promise} API response
   */
  async submitFeedback(feedbackData) {
    const data = {
      ...feedbackData,
      actionType: 'feedback'
    };

    return this.sendData(data, {
      showLoading: true
    });
  }

  /**
   * Test connection to the API
   * @returns {Promise} Connection test result
   */
  async testConnection() {
    try {
      const testData = {
        actionType: 'test_connection',
        timestamp: new Date().toISOString()
      };

      const result = await this.sendData(testData, {
        showLoading: false,
        retries: 1
      });

      return {
        success: true,
        message: 'การเชื่อมต่อทำงานปกติ'
      };

    } catch (error) {
      return {
        success: false,
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      };
    }
  }
}

// Data management for the application
class DataManager {
  constructor() {
    this.apiClient = new APIClient();
  }

  /**
   * Save calculation data
   * @param {Object} data - Calculation data
   * @param {string} stage - CKD stage
   * @returns {Promise} Save result
   */
  async saveCalculationData(data, stage) {
    try {
      // Always save to localStorage first
      window.KDUtils.sessionManager.setData(data);

      // For G1-G3: send immediately to backend
      if (['G1', 'G2', 'G3a', 'G3b'].includes(stage)) {
        const result = await this.apiClient.submitCalculationData(data);
        if (result.success) {
          window.KDUtils.toastManager.success('บันทึกข้อมูลสำเร็จ');
        }
        return result;
      }

      // For G4-G5: keep in localStorage for now
      console.log('📦 เก็บข้อมูลไว้ใน localStorage สำหรับ', stage);
      return { success: true, deferred: true };

    } catch (error) {
      console.error('Error saving calculation data:', error);
      window.KDUtils.toastManager.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      return { success: false, error: error.message };
    }
  }

  /**
   * Update stored data with additional information
   * @param {Object} additionalData - Additional data to merge
   * @returns {Object} Updated data
   */
  updateStoredData(additionalData) {
    const currentData = window.KDUtils.sessionManager.getData() || {};
    const updatedData = { ...currentData, ...additionalData };
    window.KDUtils.sessionManager.setData(updatedData);
    return updatedData;
  }

  /**
   * Submit complete patient journey data
   * @param {Object} additionalData - Final data to add
   * @returns {Promise} Submit result
   */
  async submitCompleteData(additionalData = {}) {
    try {
      const storedData = window.KDUtils.sessionManager.getData();
      if (!storedData) {
        throw new Error('ไม่พบข้อมูลผู้ป่วย');
      }

      const completeData = { ...storedData, ...additionalData };
      const result = await this.apiClient.submitFullData(completeData);

      if (result.success) {
        // Clear stored data after successful submission
        window.KDUtils.sessionManager.setData({});
        window.KDUtils.toastManager.success('ขอบคุณสำหรับข้อมูลของคุณ');
      }

      return result;

    } catch (error) {
      console.error('Error submitting complete data:', error);
      window.KDUtils.toastManager.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
      return { success: false, error: error.message };
    }
  }

  /**
   * Get stored patient data
   * @returns {Object|null} Stored data
   */
  getStoredData() {
    return window.KDUtils.sessionManager.getData();
  }
}

// Export for global use
window.APIClient = APIClient;
window.DataManager = DataManager;