<?php
// ข้อมูลการเชื่อมต่อ MySQL
$servername = "localhost";
$username = "root";   // ชื่อ user MySQL
$password = "";       // รหัสผ่าน (ถ้ามี)
$dbname = "diabetes_db"; // ชื่อฐานข้อมูล

// สร้างการเชื่อมต่อ
$conn = new mysqli($servername, $username, $password, $dbname);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// รับค่าจากฟอร์ม
$name = $_POST['name'];
$age = $_POST['age'];
$gender = $_POST['gender'];
$phone = $_POST['phone'];

// บันทึกลง MySQL
$sql = "INSERT INTO patients (name, age, gender, phone) 
        VALUES ('$name', '$age', '$gender', '$phone')";

if ($conn->query($sql) === TRUE) {
  echo "บันทึกข้อมูลสำเร็จ!";
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
