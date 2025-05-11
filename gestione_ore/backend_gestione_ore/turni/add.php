<?php
require_once '../db.php';
require_once '../calcolo/calcola-ore.php';  // Includiamo il file per i calcoli

header("Content-Type: application/json");

try {
    // Legge i dati inviati in formato JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica se i dati necessari sono presenti
    if (!isset($data['employee_id']) || !isset($data['entry_date']) || 
        !isset($data['entry_time']) || !isset($data['exit_date']) || 
        !isset($data['exit_time'])) {
        echo json_encode(["success" => false, "error" => "Dati mancanti"]);
        exit;
    }
    
    // Verifica che la data/ora di uscita sia successiva alla data/ora di ingresso
    $entry_datetime = strtotime($data['entry_date'] . ' ' . $data['entry_time']);
    $exit_datetime = strtotime($data['exit_date'] . ' ' . $data['exit_time']);
    
    if ($exit_datetime <= $entry_datetime) {
        echo json_encode([
            "success" => false, 
            "error" => "La data/ora di uscita deve essere successiva alla data/ora di ingresso"
        ]);
        exit;
    }
    
    // Controllo per evitare turni duplicati
    $check_stmt = $pdo->prepare("
        SELECT COUNT(*) FROM turni 
        WHERE employee_id = ? 
        AND (
            (entry_date = ? OR exit_date = ?) OR
            (entry_date BETWEEN ? AND ?) OR
            (exit_date BETWEEN ? AND ?) OR
            (? BETWEEN entry_date AND exit_date) OR
            (? BETWEEN entry_date AND exit_date)
        )
    ");
    
    $check_stmt->execute([
        $data['employee_id'],
        $data['entry_date'], $data['exit_date'],
        $data['entry_date'], $data['exit_date'],
        $data['entry_date'], $data['exit_date'],
        $data['entry_date'], $data['exit_date']
    ]);
    
    if ($check_stmt->fetchColumn() > 0) {
        echo json_encode([
            "success" => false, 
            "error" => "Esiste già un turno per questo dipendente in una delle date selezionate."
        ]);
        exit;
    }
    
    // Inizia una transazione per garantire che tutto venga salvato correttamente
    $pdo->beginTransaction();
    
    try {
        // Inserisce il turno nella tabella turni
        $stmt = $pdo->prepare("
            INSERT INTO turni (employee_id, entry_date, entry_time, exit_date, exit_time) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['employee_id'],
            $data['entry_date'], 
            $data['entry_time'],
            $data['exit_date'],
            $data['exit_time']
        ]);
        
        // Ottieni l'ID del turno appena inserito
        $turno_id = $pdo->lastInsertId();
        
        // Calcola automaticamente le ore per questo turno
        $risultatoCalcolo = calcolaESalvaOreTurno($turno_id);
        
        // Commit della transazione
        $pdo->commit();
        
        // Risposta di successo con i dati del calcolo
        echo json_encode([
            "success" => true,
            "turno_id" => $turno_id,
            "calcolo_ore" => $risultatoCalcolo
        ]);
        
    } catch (Exception $e) {
        // Se c'è un errore, annulla la transazione
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    // Gestione errori
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>