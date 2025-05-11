<?php
require_once '../db.php';
header("Content-Type: application/json");

$stmt = $pdo->query("SELECT id, qualifica FROM qualifiche ORDER BY id");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>