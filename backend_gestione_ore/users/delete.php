<?php
require_once '../db.php';
header("Content-Type: application/json");

$id = $_GET["id"] ?? null;

if ($id) {
  $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(["success" => true]);
} else {
  http_response_code(400);
  echo json_encode(["error" => "ID mancante"]);
}
?>