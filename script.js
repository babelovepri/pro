// script.js

// ตัวแปรเก็บข้อมูลผู้ป่วยชั่วคราว
let patientData = {};

// เมื่อกรอกข้อมูลผู้ป่วยเสร็จ
document.getElementById("patientForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // เก็บข้อมูลจากฟอร์ม
  patientData = {
    fullname: this.fullname.value.trim(),
    age: parseInt(this.age.value),
    gender: this.gender.value,
    birth_date: this.birth_date.value,
    phone: this.phone.value.replace(/[^0-9]/g, '') // ลบอักขระที่ไม่ใช่ตัวเลข
  };

  // ซ่อนหน้า 1, แสดงหน้า 2
  document.getElementById("section1").classList.remove("active");
  document.getElementById("section2").classList.add("active");

  // แสดงข้อมูลผู้ป่วยในกล่อง
  document.getElementById("patientInfo").innerHTML = `
    <p><strong>ชื่อ:</strong> ${patientData.fullname}</p>
    <p><strong>อายุ:</strong> ${patientData.age} ปี</p>
    <p><strong>เพศ:</strong> ${patientData.gender}</p>
    <p><strong>วันเกิด:</strong> ${formatDate(patientData.birth_date)}</p>
    <p><strong>เบอร์โทร:</strong> ${formatPhone(patientData.phone)}</p>
  `;

  // แสดง step แรกของ PAM
  document.querySelectorAll("#section2 .step").forEach(s => s.classList.remove("active"));
  document.getElementById("step1").classList.add("active");
});

// แปลงวันที่เป็นภาษาไทย (เช่น 15 พฤษภาคม 2567)
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('th-TH', options).replace(/ พ.ศ./, ' ' + (date.getFullYear() + 543));
}

// จัดรูปแบบเบอร์โทร (เช่น 081-234-5678)
function formatPhone(phone) {
  if (!phone || phone.length !== 10) return phone;
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

// ถัดไปยัง step ถัดไป
function nextStep(current) {
  document.getElementById(`step${current}`).classList.remove("active");
  document.getElementById(`step${current + 1}`).classList.add("active");
}

// ย้อนกลับไป step ก่อนหน้า
function prevStep(current) {
  document.getElementById(`step${current}`).classList.remove("active");
  document.getElementById(`step${current - 1}`).classList.add("active");
}

// เมื่อกด "ส่งแบบประเมิน"
document.getElementById("pamForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // ป้องกันการส่งซ้ำ
  const submitBtn = this.querySelector("button[type='submit']");
  if (submitBtn.disabled) return; // ถ้ากดแล้ว ห้ามกดซ้ำ
  submitBtn.disabled = true;
  submitBtn.textContent = "กำลังส่ง...";

  // รวบรวมคำตอบจากฟอร์ม
  const formData = new FormData(this);
  const data = {};
  for (let [key, value] of formData) {
    data[key] = value;
  }

  // เพิ่มข้อมูลผู้ป่วย
  data.fullname = patientData.fullname;
  data.age = patientData.age;
  data.gender = patientData.gender;
  data.birth_date = patientData.birth_date;
  data.phone = patientData.phone;

  // ส่งข้อมูลไป PHP
  fetch('save_pam.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    // ตรวจสอบว่า response เป็น JSON จริงไหม
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Server did not return JSON');
    }
    return response.json();
  })
  .then(result => {
    if (result.success) {
      alert(`✅ บันทึกข้อมูลสำเร็จ!\nคะแนน PAM: ${result.score.toFixed(2)}\nกลุ่ม: ${result.group}`);
      window.location.href = "thankyou.html"; // ไปหน้าขอบคุณ
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + result.message);
    }
  })
  .catch(err => {
    console.error('Error:', err);
    alert('❌ การส่งข้อมูลล้มเหลว\nกรุณาตรวจสอบการเชื่อมต่อหรือลองใหม่อีกครั้ง');
  })
  .finally(() => {
    // ปลดปุ่มเมื่อเสร็จ
    submitBtn.disabled = false;
    submitBtn.textContent = "ส่งแบบประเมิน";
  });
});
