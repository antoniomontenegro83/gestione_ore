<?php
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$stmt = $pdo->prepare("INSERT IGNORE INTO sedi (nome) VALUES (?)");
$stmt->execute([$data['nome']]);
echo json_encode(["success" => true]);
?>