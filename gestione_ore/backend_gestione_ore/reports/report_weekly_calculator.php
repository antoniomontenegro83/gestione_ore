<?php
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$employee_id = $data['employee_id'];
$start_date = $data['start_date'];
$end_date = $data['end_date'];

$stmt = $pdo->prepare("SELECT s.*, e.nome, e.cognome
    FROM shifts s
    JOIN employees e ON s.employee_id = e.id
    WHERE s.employee_id = ? AND s.entry_date BETWEEN ? AND ?");
$stmt->execute([$employee_id, $start_date, $end_date]);
$shifts = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($shifts);
?>