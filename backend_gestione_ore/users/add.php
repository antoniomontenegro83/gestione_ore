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
$username = $data["username"] ?? "";
$password = $data["password"] ?? "";
$ruolo = $data["ruolo"] ?? "user";

if ($username && $password) {
  $hash = password_hash($password, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare("INSERT INTO users (username, password, ruolo) VALUES (?, ?, ?)");
  try {
    $stmt->execute([$username, $hash, $ruolo]);
    echo json_encode(["success" => true]);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Username esistente"]);
  }
} else {
  http_response_code(400);
  echo json_encode(["error" => "Dati mancanti"]);
}
?>