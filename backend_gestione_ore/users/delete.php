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