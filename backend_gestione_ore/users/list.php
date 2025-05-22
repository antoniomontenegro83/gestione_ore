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

$stmt = $pdo->query("SELECT id, username, ruolo FROM users ORDER BY id");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>