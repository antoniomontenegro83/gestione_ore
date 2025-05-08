<?php
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$employee_id = $data['employee_id'];
$start_date = $data['start_date'];
$end_date = $data['end_date'];

$sql = "SELECT s.*, 
               e.cognome, e.nome, e.qualifica, 
               COALESCE(s.sede, e.sede) as sede
        FROM shifts s 
        JOIN employees e ON s.employee_id = e.id
        WHERE s.employee_id = ? AND s.entry_date BETWEEN ? AND ?
        ORDER BY s.entry_date";

$stmt = $pdo->prepare($sql);
$stmt->execute([$employee_id, $start_date, $end_date]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>