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

// File: backend_gestione_ore/qualifiche/add.php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Legge i dati inviati in formato JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica che il campo qualifica sia presente
    if (!isset($data['qualifica']) || empty(trim($data['qualifica']))) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Nome qualifica è obbligatorio"]);
        exit;
    }
    
    // Normalizza il dato (maiuscolo)
    $qualifica = strtoupper(trim($data['qualifica']));
    
    // Verifica se la qualifica esiste già
    $checkStmt = $pdo->prepare("SELECT id FROM qualifiche WHERE qualifica = ?");
    $checkStmt->execute([$qualifica]);
    
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Qualifica già esistente"]);
        exit;
    }
    
    // Inserisce la nuova qualifica
    $stmt = $pdo->prepare("INSERT INTO qualifiche (qualifica) VALUES (?)");
    $result = $stmt->execute([$qualifica]);
    
    if ($result) {
        $newId = $pdo->lastInsertId();
        echo json_encode([
            "success" => true, 
            "id" => $newId,
            "message" => "Qualifica aggiunta con successo"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Errore durante l'inserimento nel database"]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Errore database: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Errore generico: " . $e->getMessage()]);
}
?>