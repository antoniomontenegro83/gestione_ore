<?php
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$stmt = $pdo->prepare("DELETE FROM sedi WHERE id = ?");
$stmt->execute([$data['id']]);
echo json_encode(["success" => true]);
?>