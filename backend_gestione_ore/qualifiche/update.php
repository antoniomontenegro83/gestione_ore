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

// File: backend_gestione_ore/qualifiche/update.php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Legge i dati inviati in formato JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica che l'ID e la qualifica siano presenti
    if (!isset($data['id']) || !is_numeric($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "ID qualifica non valido"]);
        exit;
    }
    
    if (!isset($data['qualifica']) || empty(trim($data['qualifica']))) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Nome qualifica è obbligatorio"]);
        exit;
    }
    
    $id = intval($data['id']);
    $qualifica = strtoupper(trim($data['qualifica']));
    
    // Verifica se la qualifica esiste già (escludendo quella corrente)
    $checkStmt = $pdo->prepare("SELECT id FROM qualifiche WHERE qualifica = ? AND id != ?");
    $checkStmt->execute([$qualifica, $id]);
    
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Qualifica già esistente"]);
        exit;
    }
    
    // Aggiorna la qualifica
    $stmt = $pdo->prepare("UPDATE qualifiche SET qualifica = ? WHERE id = ?");
    $result = $stmt->execute([$qualifica, $id]);
    
    if ($result && $stmt->rowCount() >= 0) {
        echo json_encode([
            "success" => true,
            "message" => "Qualifica modificata con successo"
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Qualifica non trovata"]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Errore database: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Errore generico: " . $e->getMessage()]);
}
?>