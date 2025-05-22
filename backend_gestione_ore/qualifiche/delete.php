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

// File: backend_gestione_ore/qualifiche/delete.php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Legge i dati inviati in formato JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica che l'ID sia presente
    if (!isset($data['id']) || !is_numeric($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "ID qualifica non valido"]);
        exit;
    }
    
    $id = intval($data['id']);
    
    // Verifica se ci sono dipendenti associati a questa qualifica
    $checkDipendentiStmt = $pdo->prepare("SELECT COUNT(*) as count FROM dipendenti WHERE qualifica = (SELECT qualifica FROM qualifiche WHERE id = ?)");
    $checkDipendentiStmt->execute([$id]);
    $dipendentiCount = $checkDipendentiStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($dipendentiCount > 0) {
        http_response_code(409);
        echo json_encode([
            "success" => false, 
            "error" => "Impossibile eliminare la qualifica: è associata a $dipendentiCount dipendenti"
        ]);
        exit;
    }
    
    // Elimina la qualifica
    $stmt = $pdo->prepare("DELETE FROM qualifiche WHERE id = ?");
    $result = $stmt->execute([$id]);
    
    if ($result && $stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Qualifica eliminata con successo"
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