<?php
// ============================================
// PROTEZIONE PER FILE CHE RICHIEDONO SOLO SUPERADMIN
// Aggiungi all'inizio di: users/*
// ============================================
session_start();

// Verifica autenticazione
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Accesso riservato - Login richiesto"]);
    exit;
}

// Verifica ruolo superadmin
$userRole = $_SESSION['user']['ruolo'] ?? '';
if ($userRole !== 'superadmin') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Accesso riservato ai Super Amministratori"]);
    exit;
}

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