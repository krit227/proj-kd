# Project-Kidney Dialysis 🏥

## โปรเจคนี้เป็นโปรเจคแรกที่รับ (Freelance) เป็นโปรแกรมช่วยในการเตรียมตัวก่อนฟอกเลือด

**Target Users:** ผู้ป่วยโรคไตและบุคลากรทางการแพทย์ที่เกี่ยวข้องกับการเตรียมตัวก่อนฟอกเลือด

### 🛠 Technology Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **Deployment:** Netlify (Frontend) + Google Apps Script (Backend)
- **Web App:** https://hospital-pro-kd.netlify.app

### 📂 Project Structure (Updated)
```
proj-kd-main/
├── styles/
│   ├── main.css          # Main styling, responsive design, error handling
│   └── components.css    # Reusable component styles
├── js/
│   ├── utils.js          # Utilities, session management, error handling
│   ├── calculations.js   # Medical calculations with validation
│   ├── api.js           # API communication with retry mechanisms
│   └── main.js          # Main application logic
├── *.html               # HTML pages for different scenarios
└── README.md
```

## ✅ อัพเดทที่เสร็จแล้ว (Recent Updates)

### 🎯 **Phase 1: Code Organization & Enhancement (เสร็จแล้ว)**

#### 1. **แยกไฟล์และจัดระเบียบโค้ด (Code Separation)**
- ✅ แยก CSS ออกเป็นไฟล์ `styles/main.css` และ `styles/components.css`
- ✅ แยก JavaScript ออกเป็น 4 ไฟล์หลัก:
  - `js/utils.js` - ฟังก์ชันช่วยเหลือและการจัดการ session
  - `js/calculations.js` - การคำนวณทางการแพทย์
  - `js/api.js` - การเชื่อมต่อกับ Google Apps Script
  - `js/main.js` - ตรรกะหลักของแอปพลิเคชัน
- ✅ อัพเดท HTML files ให้ใช้ไฟล์ external CSS และ JS

#### 2. **Error Handling & User Experience**
- ✅ **Loading States:** แสดง loading spinner ระหว่างส่งข้อมูล
- ✅ **Toast Notifications:** ระบบแจ้งเตือนที่เป็นมิตรกับผู้ใช้
- ✅ **Network Monitoring:** ตรวจสอบสถานะการเชื่อมต่ออินเทอร์เน็ต
- ✅ **Form Validation:** ตรวจสอบข้อมูลแบบ real-time พร้อมข้อความแสดงข้อผิดพลาด
- ✅ **API Retry Mechanism:** ลองส่งข้อมูลใหม่อัตโนมัติเมื่อเครือข่ายมีปัญหา
- ✅ **Session Management:** จัดการ session และ timeout อัตโนมัติ
- ✅ **Global Error Logging:** บันทึกข้อผิดพลาด JavaScript

#### 3. **Responsive Design & Mobile Optimization**
- ✅ **Touch-Friendly Design:** ปุ่มขนาดใหญ่ขึ้น (min 44px) สำหรับ mobile
- ✅ **Responsive Grid System:** ปรับ layout ตามขนาดหน้าจอ
- ✅ **Mobile-Optimized Modals:** Modal ที่เหมาะสำหรับมือถือ
- ✅ **Improved Typography:** ขนาดตัวอักษรที่อ่านง่ายในทุกอุปกรณ์

#### 4. **Enhanced Security & Validation**
- ✅ **Input Sanitization:** ป้องกัน XSS attacks
- ✅ **Data Validation:** ตรวจสอบข้อมูลก่อนส่งไปยัง backend
- ✅ **Safe Error Messages:** ข้อความแสดงข้อผิดพลาดที่ปลอดภัย

#### 5. **Accessibility Improvements**
- ✅ **Keyboard Navigation:** รองรับการใช้งานด้วยคีย์บอร์ด
- ✅ **ARIA Labels:** ป้ายกำกับสำหรับ screen readers
- ✅ **Focus Management:** การจัดการ focus ที่ดีขึ้น

### 📱 **Updated Pages**
- ✅ `index.html` - หน้าคำนวณ eGFR (รองรับ error handling และ responsive)
- ✅ `g4.html` - คำแนะนำสำหรับ CKD Stage 4
- ✅ `rrt-choice.html` - หน้าเลือกวิธีการบำบัดทดแทนไต

### 🧪 **Testing & Quality Assurance**
- ✅ Local development server สำหรับทดสอบ
- ✅ Responsive design testing across different screen sizes
- ✅ Error handling validation
- ✅ Form validation testing

## 🚀 สิ่งที่จะทำในเวอร์ชั่นต่อไป (Next Phase) อาจจะทำ

### **Phase 2: Advanced Features**
- [ ] **Offline Capability:** Service Worker สำหรับใช้งานแบบ offline
- [ ] **Data Export:** ส่งออกข้อมูลเป็น PDF
- [ ] **Advanced Analytics:** วิเคราะห์การใช้งานผู้ใช้
- [ ] **Progressive Web App (PWA):** แปลงเป็น PWA

### **Phase 3: Content & UX Enhancement**
- [ ] **Enhanced AI Advisory:** ปรับปรุงระบบคำแนะนำ AI
- [ ] **Patient Journey Tracking:** ติดตามการดำเนินการของผู้ป่วย
- [ ] **Educational Content:** เพิ่มเนื้อหาการศึกษาเกี่ยวกับโรคไต
- [ ] **Video Tutorials:** วิดีโอสาธิตการใช้งาน

### **Phase 4: Technical Improvements**
- [ ] **Performance Optimization:** ปรับปรุงประสิทธิภาพ
- [ ] **Enhanced Security:** การรักษาความปลอดภัยเพิ่มเติม
- [ ] **API Rate Limiting:** จำกัดอัตราการเรียก API
- [ ] **Data Backup System:** ระบบสำรองข้อมูล

## 🔧 Development

### Local Development
```bash
# Start local server
python -m http.server 8000

# Open browser
http://localhost:8000
```

### File Structure Guidelines
- **HTML Files:** ใช้ semantic HTML และ ARIA attributes
- **CSS Files:** Modular approach, responsive-first design
- **JavaScript Files:** ES6+, error handling, input validation
- **Backend:** Google Apps Script (ไม่แก้ไข)

## 📊 Project Status
- **Current Version:** v2.0 (Enhanced & Modularized)
- **Last Updated:** January 2025
- **Status:** ✅ Phase 1 Complete - Ready for Phase 2
- **Performance:** ⚡ Improved loading times and error handling
- **Mobile Support:** 📱 Fully responsive and touch-optimized

---

**Note:** โปรเจคนี้ยังคงใช้ Google Apps Script เป็น backend และ Google Sheets เป็นฐานข้อมูลตามที่วางแผนไว้ เพื่อความง่ายในการจัดการและต้นทุนที่ต่ำ 
