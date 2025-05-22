<?php
// ============================================
// PROTEZIONE PER FILE CHE RICHIEDONO ADMIN/SUPERADMIN
// Aggiungi all'inizio di: dipendenti/*, turni/*, sedi/*, qualifiche/*
// ============================================
session_start();

// Verifica autenticazione
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Accesso riservato - Login richiesto"]);
    exit;
}

// Verifica ruolo admin o superadmin
$userRole = $_SESSION['user']['ruolo'] ?? '';
if ($userRole !== 'admin' && $userRole !== 'superadmin') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Accesso riservato agli amministratori"]);
    exit;
}

require_once '../db.php';
header("Content-Type: application/json");

try {
    // Query per ottenere tutti i dipendenti ordinati per cognome e nome
    $stmt = $pdo->query("
        SELECT id, cognome, nome, qualifica, sede
        FROM dipendenti
        ORDER BY cognome, nome
    ");

    $dipendenti = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($dipendenti);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>