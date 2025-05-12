<?php
require_once '../db.php';
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;
$username = $data["username"] ?? "";
$password = $data["password"] ?? "";
$ruolo = $data["ruolo"] ?? "user";

if ($id && $username) {
  if ($password) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET username = ?, password = ?, ruolo = ? WHERE id = ?");
    $stmt->execute([$username, $hash, $ruolo, $id]);
  } else {
    $stmt = $pdo->prepare("UPDATE users SET username = ?, ruolo = ? WHERE id = ?");
    $stmt->execute([$username, $ruolo, $id]);
  }
  echo json_encode(["success" => true]);
} else {
  http_response_code(400);
  echo json_encode(["error" => "Dati mancanti"]);
}
?>