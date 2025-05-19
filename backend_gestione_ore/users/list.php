<?php
require_once '../db.php';
header("Content-Type: application/json");

$stmt = $pdo->query("SELECT id, username, ruolo FROM users ORDER BY id");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>