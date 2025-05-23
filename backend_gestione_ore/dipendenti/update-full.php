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
    // Legge i dati inviati in formato JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica che l'ID sia presente
    if (!isset($data['id']) || !is_numeric($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "ID dipendente non valido"]);
        exit;
    }
    
    // Verifica che i campi obbligatori siano presenti
    if (!isset($data['cognome']) || !isset($data['nome'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Nome e cognome sono obbligatori"]);
        exit;
    }
    
    // Prepara l'aggiornamento
    $stmt = $pdo->prepare("
        UPDATE dipendenti 
        SET cognome = ?, nome = ?, qualifica = ?, sede = ? 
        WHERE id = ?
    ");
    
    $result = $stmt->execute([
        $data['cognome'],
        $data['nome'],
        $data['qualifica'],
        $data['sede'],
        $data['id']
    ]);
    
    if ($result && $stmt->rowCount() >= 0) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Dipendente non trovato o nessuna modifica"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>