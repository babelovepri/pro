let currentStep = 0;
const steps = document.querySelectorAll(".step");
const progressBar = document.getElementById("progress-bar");
const form = document.getElementById("diabetes-form");
const successMsg = document.getElementById("success-message");

// แสดงขั้นตอนแรก
steps[currentStep].classList.add("active");

function showStep(n) {
  steps.forEach((step, index) => {
    step.classList.remove("active");
    if (index === n) {
      step.classList.add("active");
    }
  });
  progressBar.style.width = `${(n + 1) * 20}%`;
}

// ✅ ฟังก์ชันตรวจสอบ input ใน step ปัจจุบัน
function validateCurrentStep() {
  const inputs = steps[currentStep].querySelectorAll("input, select, textarea");
  for (const field of inputs) {
    if (!field.checkValidity()) {
      field.reportValidity(); // แสดงข้อความ error ของ browser
      return false;
    }
  }
  return true;
}

function nextStep() {
  // ✅ ตรวจสอบก่อนเปลี่ยน step
  if (!validateCurrentStep()) return;

  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
}

// เมื่อกดส่ง
form.addEventListener("submit", function (e) {
  // ✅ ตรวจสอบ step สุดท้ายด้วย
  if (!validateCurrentStep()) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  form.style.display = "none";
  successMsg.classList.remove("d-none");
});
