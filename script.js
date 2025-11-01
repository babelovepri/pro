// -----------------------------
// ฟังก์ชันสลับหน้า
// -----------------------------
function showSection(num) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById('section' + num).classList.add('active');
}

// -----------------------------
// เมื่อกรอกข้อมูลผู้ป่วยเสร็จ
// -----------------------------
document.getElementById('patientForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  let infoHTML = `
    <strong>ชื่อ:</strong> ${formData.get('fullname')}<br>
    <strong>อายุ:</strong> ${formData.get('age')}<br>
    <strong>เพศ:</strong> ${formData.get('gender')}<br>
    <strong>วันเกิด:</strong> ${formData.get('birth_date')}<br>
    <strong>โทรศัพท์:</strong> ${formData.get('phone')}
  `;
  document.getElementById('patientInfo').innerHTML = infoHTML;

  // บันทึกข้อมูลผู้ป่วยไว้ใน sessionStorage
  sessionStorage.setItem('patientData', JSON.stringify(Object.fromEntries(formData)));

  showSection(2);
});

// -----------------------------
// คำนวณคะแนน PAM และส่งข้อมูลไป Google Apps Script
// -----------------------------
document.getElementById('pamForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  let total = 0;
  for (let i = 1; i <= 5; i++) {
    total += parseInt(formData.get('q' + i));
  }

  // แปลผลคะแนน
  let levelText = '';
  if (total >= 17) levelText = 'ระดับสูงมาก';
  else if (total >= 13) levelText = 'ระดับสูง';
  else if (total >= 9) levelText = 'ระดับปานกลาง';
  else levelText = 'ระดับต่ำ';

  // แสดงผลคะแนนบนหน้าเว็บ
  document.getElementById('resultText').innerHTML = `
    คะแนนรวมของคุณคือ <strong>${total}</strong> / 20<br>
    <span>ระดับความสามารถในการจัดการสุขภาพ: <strong>${levelText}</strong></span>
  `;

  // -----------------------------
  // ส่งข้อมูลไปยัง Google Apps Script
  // -----------------------------
  const patientData = JSON.parse(sessionStorage.getItem('patientData') || '{}');
  const dataToSend = {
    fullname: patientData.fullname || '',
    age: patientData.age || '',
    gender: patientData.gender || '',
    birth_date: patientData.birth_date || '',
    phone: patientData.phone || '',
    q1: formData.get('q1'),
    q2: formData.get('q2'),
    q3: formData.get('q3'),
    q4: formData.get('q4'),
    q5: formData.get('q5'),
    heart_meter: formData.get('heart-meter'),
    total: total,
    level: levelText,
    timestamp: new Date().toISOString()
  };

  // URL Web App Google Apps Script — ✅ ลบช่องว่างท้ายออกแล้ว!
  const scriptURL = "https://script.google.com/a/macros/ssru.ac.th/s/AKfycbzJ6vvR2aWniUTGtKFTK1crojhL9FM3V0t_i3uF7dM/dev";

  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(dataToSend),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(txt => {
    console.log("Response from server:", txt);
    alert("✅ ส่งข้อมูลเรียบร้อยแล้ว!");
  })
  .catch(err => {
    console.error("❌ Error sending data:", err);
    alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่");
  });

  // ไปหน้าแสดงผล
  showSection(3);
});

// -----------------------------
// รีเซ็ตกลับหน้าแรก
// -----------------------------
function restart() {
  document.getElementById('patientForm').reset();
  document.getElementById('pamForm').reset();
  sessionStorage.clear();
  showSection(1);
}