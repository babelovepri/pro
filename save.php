<?php
// save_pam.php

// ปิดการแสดง error (เพื่อไม่ให้ปนกับ JSON)
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

require_once 'config/db.php';

// อ่าน JSON จาก JavaScript
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ไม่พบข้อมูล']);
    exit;
}

// ตรวจสอบข้อมูลพื้นฐาน
if (empty($input['fullname']) || empty($input['age']) || empty($input['birth_date'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกข้อมูลให้ครบ']);
    exit;
}

// รวมคะแนนจากคำถาม PAM (q1 ถึง q13)
$rawScore = 0;
for ($i = 1; $i <= 13; $i++) {
    $field = "q$i";
    if (isset($input[$field]) && in_array($input[$field], [1, 2, 3, 4])) {
        $rawScore += (int)$input[$field];
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "คำตอบข้อที่ $i ไม่สมบูรณ์"]);
        exit;
    }
}

// แปลงเป็นมาตราฐาน 0-100
$standardized_score = (($rawScore - 13) / 39) * 100;
$total_score = round($standardized_score, 2);

// จัดกลุ่มผู้ป่วย 3 ประเภท
if ($total_score <= 47.0) {
    $risk_group = "ด่วน";
} elseif ($total_score <= 67.3) {
    $risk_group = "เฝ้าระวัง";
} else {
    $risk_group = "ปกติ";
}

// เตรียม SQL — ต้องมี ? ทั้งหมด 19 ตัว (ตามฟิลด์ในตาราง)
$sql = "INSERT INTO patients 
        (fullname, birth_date, age, gender, phone,
         q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13,
         total_score, pam_level, risk_group)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

// $params ต้องมี 21 ตัว → ตรงกับ ? ทั้ง 21 ตัว
$params = [
    $input['fullname'],
    $input['birth_date'],   // DATE
    (int)$input['age'],     // INT
    $input['gender'] ?? null,
    $input['phone'] ?? null,
    
    // คำถาม PAM: q1 ถึง q13 → TINYINT
    (int)$input['q1'], (int)$input['q2'], (int)$input['q3'], (int)$input['q4'], (int)$input['q5'],
    (int)$input['q6'], (int)$input['q7'], (int)$input['q8'], (int)$input['q9'], (int)$input['q10'],
    (int)$input['q11'], (int)$input['q12'], (int)$input['q13'],

    $total_score,           // DECIMAL(5,2)
    "Level " . (
        $total_score <= 47.0 ? "1" : 
        ($total_score <= 55.1 ? "2" : 
        ($total_score <= 67.3 ? "3" : "4"))
    ),
    $risk_group            // VARCHAR(20)
];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'success' => true,
        'score' => $total_score,
        'group' => $risk_group
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Database Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'บันทึกข้อมูลไม่สำเร็จ: ' . $e->getMessage()
    ]);
}
?>
