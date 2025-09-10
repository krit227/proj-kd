/**
 * Main application logic for the Kidney Dialysis Project
 */

class KidneyDialysisApp {
  constructor() {
    this.calculator = new MedicalCalculator();
    this.dataManager = new DataManager();
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.initializePage();
    this.checkSessionValidity();
    console.log('🏥 Kidney Dialysis App initialized');
  }

  /**
   * Get current page name from URL
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop() || 'index.html';
    return fileName.replace('.html', '');
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Form submissions
    document.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Modal close events
    document.addEventListener('click', this.handleModalClose.bind(this));
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyNavigation.bind(this));
    
    // Page visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Initialize page-specific functionality
   */
  initializePage() {
    switch (this.currentPage) {
      case 'index':
        this.initIndexPage();
        break;
      case 'g4':
        this.initG4Page();
        break;
      case 'rrt-choice':
      case 'rrt-choiceG5':
        this.initRRTChoicePage();
        break;
      case 'feedback':
        this.initFeedbackPage();
        break;
      default:
        console.log('No specific initialization for page:', this.currentPage);
    }
  }

  /**
   * Initialize index page (eGFR calculation)
   */
  initIndexPage() {
    const form = document.getElementById('egfrForm');
    if (!form) return;

    // Add form field containers for better error handling
    this.wrapFormFields(form);

    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  /**
   * Initialize G4 page
   */
  initG4Page() {
    // Add any G4-specific initialization here
    console.log('G4 page initialized');
  }

  /**
   * Initialize RRT choice page
   */
  initRRTChoicePage() {
    // Add any RRT choice specific initialization here
    console.log('RRT Choice page initialized');
  }

  /**
   * Initialize feedback page
   */
  initFeedbackPage() {
    // Check if we have stored data
    const storedData = this.dataManager.getStoredData();
    if (!storedData) {
      window.KDUtils.toastManager.warning('ไม่พบข้อมูลการใช้งาน กรุณาเริ่มต้นใหม่');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    }
  }

  /**
   * Handle form submissions
   */
  async handleFormSubmit(event) {
    const form = event.target;
    
    if (form.id === 'egfrForm') {
      event.preventDefault();
      await this.handleEGFRCalculation(form);
    } else if (form.id === 'feedbackForm') {
      event.preventDefault();
      await this.handleFeedbackSubmission(form);
    }
  }

  /**
   * Handle eGFR calculation form submission
   */
  async handleEGFRCalculation(form) {
    try {
      // Get form data
      const formData = new FormData(form);
      const data = {
        age: parseInt(formData.get('age')),
        weight: parseFloat(formData.get('weight')),
        creatinine: parseFloat(formData.get('creatinine')),
        gender: formData.get('gender')
      };

      // Validate inputs
      const validation = this.calculator.validateInputs(data);
      if (!validation.isValid) {
        window.KDUtils.formValidator.showFieldErrors(validation.errors);
        window.KDUtils.toastManager.error('กรุณาตรวจสอบข้อมูลที่กรอก');
        return;
      }

      // Calculate eGFR
      const result = this.calculator.calculateEGFR(
        data.age, 
        data.weight, 
        data.creatinine, 
        data.gender
      );

      if (!result.success) {
        window.KDUtils.toastManager.error('เกิดข้อผิดพลาดในการคำนวณ: ' + result.error);
        return;
      }

      // Prepare data for saving
      const calculationData = {
        sessionId: window.KDUtils.sessionManager.getSessionId(),
        ...data,
        egfr: result.eGFR,
        stage: result.category,
        interpretation: result.interpretation
      };

      // Save data
      await this.dataManager.saveCalculationData(calculationData, result.category);

      // Show results
      this.displayEGFRResults(result);

    } catch (error) {
      console.error('eGFR calculation error:', error);
      window.KDUtils.toastManager.error('เกิดข้อผิดพลาดในการคำนวณ');
    }
  }

  /**
   * Display eGFR calculation results
   */
  displayEGFRResults(result) {
    // Update modal content
    const egfrValue = document.getElementById('egfrValue');
    const egfrCategory = document.getElementById('egfrCategory');
    
    if (egfrValue) egfrValue.textContent = result.eGFR + ' mL/min';
    if (egfrCategory) egfrCategory.textContent = result.category;

    // Show/hide advice and buttons based on category
    const advice = document.getElementById('advice');
    const g4ButtonContainer = document.getElementById('g4ButtonContainer');
    const g5ButtonContainer = document.getElementById('g5ButtonContainer');

    if (advice) {
      advice.classList.toggle('hidden', result.eGFR >= 30);
    }

    if (g4ButtonContainer) {
      g4ButtonContainer.classList.toggle('hidden', result.category !== 'G4');
    }

    if (g5ButtonContainer) {
      g5ButtonContainer.classList.toggle('hidden', result.category !== 'G5');
    }

    // Show modal
    const modal = document.getElementById('modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  /**
   * Handle feedback form submission
   */
  async handleFeedbackSubmission(form) {
    try {
      const formData = new FormData(form);
      const feedbackData = {
        rating: formData.get('rating'),
        comment: formData.get('comment') || ''
      };

      if (!feedbackData.rating) {
        window.KDUtils.toastManager.error('กรุณาให้คะแนนความพึงพอใจ');
        return;
      }

      // Submit complete data with feedback
      const result = await this.dataManager.submitCompleteData(feedbackData);

      if (result.success) {
        window.KDUtils.toastManager.success('ขอบคุณสำหรับความคิดเห็นของคุณ 🙏');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      }

    } catch (error) {
      console.error('Feedback submission error:', error);
      window.KDUtils.toastManager.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  }

  /**
   * Handle modal close events
   */
  handleModalClose(event) {
    if (event.target.classList.contains('modal-backdrop') || 
        event.target.classList.contains('modal-close') ||
        event.target.textContent === '×' ||
        event.target.textContent === 'ปิด') {
      
      const modal = event.target.closest('.modal, [id$="modal"], [id$="Modal"]');
      if (modal) {
        modal.classList.add('hidden');
      }
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyNavigation(event) {
    // Close modal on Escape key
    if (event.key === 'Escape') {
      const visibleModal = document.querySelector('.modal:not(.hidden), [id$="modal"]:not(.hidden)');
      if (visibleModal) {
        visibleModal.classList.add('hidden');
      }
    }

    // Submit form on Enter key (for specific forms)
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
      const form = event.target.closest('form');
      if (form && (form.id === 'egfrForm' || form.id === 'feedbackForm')) {
        event.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    }
  }

  /**
   * Handle page visibility change
   */
  handleVisibilityChange() {
    if (!document.hidden) {
      // Page became visible, check session validity
      this.checkSessionValidity();
    }
  }

  /**
   * Check session validity
   */
  checkSessionValidity() {
    if (!window.KDUtils.sessionManager.checkSessionValidity()) {
      window.KDUtils.toastManager.warning('เซสชันของคุณหมดอายุแล้ว กำลังเริ่มต้นใหม่...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    }
  }

  /**
   * Wrap form fields for better error handling
   */
  wrapFormFields(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!input.closest('.form-field')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-field';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input.previousElementSibling); // Move label
        wrapper.appendChild(input);
      }
    });
  }

  /**
   * Validate individual form field
   */
  validateField(input) {
    const fieldName = input.name;
    const value = input.value;
    const rules = this.getValidationRulesForField(fieldName);

    if (rules) {
      const errors = window.KDUtils.formValidator.validate({[fieldName]: value}, {[fieldName]: rules});
      if (errors[fieldName]) {
        this.showFieldError(input, errors[fieldName][0]);
      } else {
        this.clearFieldError(input);
      }
    }
  }

  /**
   * Get validation rules for specific field
   */
  getValidationRulesForField(fieldName) {
    const allRules = {
      age: ['required', 'positiveNumber', { rule: 'range', params: [0, 120], message: 'อายุต้องอยู่ระหว่าง 0-120 ปี' }],
      weight: ['required', 'positiveNumber', { rule: 'range', params: [1, 300], message: 'น้ำหนักต้องอยู่ระหว่าง 1-300 กก.' }],
      creatinine: ['required', 'positiveNumber', { rule: 'range', params: [0.01, 100], message: 'ค่า Creatinine ต้องอยู่ระหว่าง 0.01-100 mg/dL' }],
      gender: ['required'],
      rating: ['required']
    };
    return allRules[fieldName];
  }

  /**
   * Show field error
   */
  showFieldError(input, message) {
    const formField = input.closest('.form-field') || input.parentElement;
    formField.classList.add('error');

    let errorElement = formField.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      formField.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  /**
   * Clear field error
   */
  clearFieldError(input) {
    const formField = input.closest('.form-field') || input.parentElement;
    formField.classList.remove('error');

    const errorElement = formField.querySelector('.field-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.kdApp = new KidneyDialysisApp();
});

// Export for global access
window.KidneyDialysisApp = KidneyDialysisApp;