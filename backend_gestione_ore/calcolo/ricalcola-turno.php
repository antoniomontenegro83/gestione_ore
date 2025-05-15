<?php
require_once '../db.php';
require_once 'calcola-ore.php';

header("Content-Type: application/json");

try {
    if (!isset($_POST['turno_id'])) {
        throw new Exception("ID turno mancante");
    }
    
    $turno_id = $_POST['turno_id'];
    
    // Prima elimina il calcolo esistente
    $deleteStmt = $pdo->prepare("DELETE FROM calcolo_ore WHERE turno_id = ?");
    $deleteStmt->execute([$turno_id]);
    
    // Poi ricalcola
    $risultato = calcolaESalvaOreTurno($turno_id);
    
    echo json_encode([
        'success' => true,
        'risultato' => $risultato,
        'message' => 'Turno ricalcolato con successo'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>