<?php
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$employee_id = $data['employee_id'];
$month = $data['month'];
$year = $data['year'];

$sql = "SELECT s.*, 
               e.cognome, e.nome, e.qualifica, 
               COALESCE(s.sede, e.sede) as sede
        FROM shifts s 
        JOIN employees e ON s.employee_id = e.id
        WHERE s.employee_id = ? 
          AND MONTH(s.entry_date) = ? 
          AND YEAR(s.entry_date) = ?
        ORDER BY s.entry_date";

$stmt = $pdo->prepare($sql);
$stmt->execute([$employee_id, $month, $year]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>