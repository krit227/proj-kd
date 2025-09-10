/**
 * Medical calculations for the Kidney Dialysis Project
 */

class MedicalCalculator {
  constructor() {
    this.validationRules = {
      age: ['required', 'positiveNumber', { rule: 'range', params: [0, 120], message: 'อายุต้องอยู่ระหว่าง 0-120 ปี' }],
      weight: ['required', 'positiveNumber', { rule: 'range', params: [1, 300], message: 'น้ำหนักต้องอยู่ระหว่าง 1-300 กก.' }],
      creatinine: ['required', 'positiveNumber', { rule: 'range', params: [0.1, 20], message: 'ค่า Creatinine ต้องอยู่ระหว่าง 0.1-20 mg/dL' }],
      gender: ['required']
    };
  }

  /**
   * Calculate eGFR using Cockcroft-Gault Equation
   * @param {number} age - Age in years
   * @param {number} weight - Weight in kg
   * @param {number} serumCreatinine - Serum creatinine in mg/dL
   * @param {string} gender - 'male' or 'female'
   * @returns {Object} Calculation result with eGFR value and category
   */
  calculateEGFR(age, weight, serumCreatinine, gender) {
    try {
      // Input validation
      const formData = { age, weight, creatinine: serumCreatinine, gender };
      const errors = window.KDUtils.formValidator.validate(formData, this.validationRules);
      
      if (Object.keys(errors).length > 0) {
        throw new Error('Invalid input data: ' + JSON.stringify(errors));
      }

      // Sanitize inputs
      age = parseInt(window.KDUtils.sanitizeInput(age));
      weight = parseFloat(window.KDUtils.sanitizeInput(weight));
      serumCreatinine = parseFloat(window.KDUtils.sanitizeInput(serumCreatinine));
      gender = window.KDUtils.sanitizeInput(gender).toLowerCase();

      // Calculate eGFR using Cockcroft-Gault equation
      let eGFR = 0;
      if (gender === 'male') {
        eGFR = ((140 - age) * weight) / (72 * serumCreatinine);
      } else if (gender === 'female') {
        eGFR = ((140 - age) * weight * 0.85) / (72 * serumCreatinine);
      } else {
        throw new Error('Invalid gender. Must be "male" or "female"');
      }

      // Validate result
      if (!isFinite(eGFR) || eGFR < 0) {
        throw new Error('Invalid calculation result');
      }

      const category = this.categorizeEGFR(eGFR);
      
      return {
        success: true,
        eGFR: parseFloat(eGFR.toFixed(2)),
        category: category,
        interpretation: this.getInterpretation(category),
        recommendations: this.getRecommendations(category)
      };

    } catch (error) {
      console.error('eGFR Calculation Error:', error);
      window.KDUtils.errorLogger.logError({
        type: 'calculation',
        function: 'calculateEGFR',
        message: error.message,
        inputs: { age, weight, serumCreatinine, gender }
      });

      return {
        success: false,
        error: error.message,
        eGFR: null,
        category: null
      };
    }
  }

  /**
   * Categorize eGFR value into CKD stages
   * @param {number} eGFR - eGFR value
   * @returns {string} CKD stage (G1-G5)
   */
  categorizeEGFR(eGFR) {
    if (eGFR >= 90) return 'G1';
    if (eGFR >= 60) return 'G2';
    if (eGFR >= 45) return 'G3a';
    if (eGFR >= 30) return 'G3b';
    if (eGFR >= 15) return 'G4';
    return 'G5';
  }

  /**
   * Get interpretation for eGFR category
   * @param {string} category - CKD stage
   * @returns {string} Thai interpretation
   */
  getInterpretation(category) {
    const interpretations = {
      'G1': 'การทำงานของไตปกติหรือสูง',
      'G2': 'การทำงานของไตลดลงเล็กน้อย',
      'G3a': 'การทำงานของไตลดลงระดับเล็กน้อยถึงปานกลาง',
      'G3b': 'การทำงานของไตลดลงระดับปานกลางถึงรุนแรง',
      'G4': 'การทำงานของไตลดลงรุนแรง',
      'G5': 'ไตวาย'
    };
    return interpretations[category] || 'ไม่สามารถระบุได้';
  }

  /**
   * Get recommendations for eGFR category
   * @param {string} category - CKD stage
   * @returns {Array} Array of recommendations
   */
  getRecommendations(category) {
    const recommendations = {
      'G1': [
        'ตรวจสุขภาพประจำปี',
        'ควบคุมความดันโลหิต',
        'ควบคุมน้ำตาลในเลือด (หากเป็นเบาหวาน)',
        'ออกกำลังกายสม่ำเสมอ'
      ],
      'G2': [
        'ตรวจติดตามการทำงานของไตทุก 6-12 เดือน',
        'ควบคุมความดันโลหิต < 130/80 mmHg',
        'ควบคุมน้ำตาลในเลือด (หากเป็นเบาหวาน)',
        'หลีกเลี่ยงยาที่เป็นอันตรายต่อไต'
      ],
      'G3a': [
        'ตรวจติดตามการทำงานของไตทุก 3-6 เดือน',
        'ควบคุมความดันโลหิตอย่างเข้มงวด',
        'ปรับปริมาณโปรตีนในอาหาร',
        'ตรวจแร่ธาตุในเลือด'
      ],
      'G3b': [
        'ตรวจติดตามการทำงานของไตทุก 3-6 เดือน',
        'ควบคุมความดันโลหิตและน้ำตาลในเลือด',
        'ปรับปริมาณโปรตีนและเกลือ',
        'ปรึกษาแพทย์เฉพาะทางโรคไต'
      ],
      'G4': [
        'ตรวจติดตามการทำงานของไตทุก 3 เดือน',
        'เตรียมความพร้อมสำหรับการบำบัดทดแทนไต',
        'ควบคุมอาหารอย่างเข้มงวด',
        'ปรึกษาแพทย์เฉพาะทางโรคไต'
      ],
      'G5': [
        'พิจารณาการบำบัดทดแทนไต (ฟอกเลือด, ล้างไตทางช่องท้อง, ปลูกถ่ายไต)',
        'ควบคุมอาหารอย่างเข้มงวด',
        'ติดตามอาการแทรกซ้อนอย่างใกล้ชิด',
        'ปรึกษาแพทย์เฉพาะทางโรคไต'
      ]
    };
    return recommendations[category] || ['ปรึกษาแพทย์เพื่อรับคำแนะนำเพิ่มเติม'];
  }

  /**
   * Validate calculation inputs
   * @param {Object} inputs - Input data object
   * @returns {Object} Validation result
   */
  validateInputs(inputs) {
    try {
      const errors = window.KDUtils.formValidator.validate(inputs, this.validationRules);
      return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
      };
    } catch (error) {
      console.error('Input validation error:', error);
      return {
        isValid: false,
        errors: { general: ['เกิดข้อผิดพลาดในการตรวจสอบข้อมูล'] }
      };
    }
  }

  /**
   * Get normal ranges for medical values
   * @returns {Object} Normal ranges
   */
  getNormalRanges() {
    return {
      age: { min: 0, max: 120, unit: 'ปี' },
      weight: { min: 1, max: 300, unit: 'กก.' },
      creatinine: { 
        male: { min: 0.7, max: 1.3, unit: 'mg/dL' },
        female: { min: 0.6, max: 1.1, unit: 'mg/dL' }
      },
      eGFR: { 
        normal: { min: 90, unit: 'mL/min/1.73m²' },
        mild: { min: 60, max: 89, unit: 'mL/min/1.73m²' },
        moderate: { min: 30, max: 59, unit: 'mL/min/1.73m²' },
        severe: { min: 15, max: 29, unit: 'mL/min/1.73m²' },
        failure: { max: 14, unit: 'mL/min/1.73m²' }
      }
    };
  }
}

// Export the calculator
window.MedicalCalculator = MedicalCalculator;