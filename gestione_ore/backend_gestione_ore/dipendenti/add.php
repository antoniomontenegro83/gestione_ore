<?php
require_once '../db.php';
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
    
    // NUOVO: Verifica che la data/ora di uscita sia successiva alla data/ora di ingresso
    $entry_datetime = strtotime($data['entry_date'] . ' ' . $data['entry_time']);
    $exit_datetime = strtotime($data['exit_date'] . ' ' . $data['exit_time']);
    
    if ($exit_datetime <= $entry_datetime) {
        echo json_encode([
            "success" => false, 
            "error" => "La data/ora di uscita deve essere successiva alla data/ora di ingresso"
        ]);
        exit;
    }
    
    // NUOVO: Verifica che non esista già un turno identico
    $check_stmt = $pdo->prepare("SELECT COUNT(*) FROM turni 
                                 WHERE employee_id = ? 
                                 AND entry_date = ? 
                                 AND entry_time = ? 
                                 AND exit_date = ? 
                                 AND exit_time = ?");
    $check_stmt->execute([
        $data['employee_id'],
        $data['entry_date'], 
        $data['entry_time'],
        $data['exit_date'],
        $data['exit_time']
    ]);
    
    if ($check_stmt->fetchColumn() > 0) {
        echo json_encode([
            "success" => false, 
            "error" => "Esiste già un turno identico per questo dipendente"
        ]);
        exit;
    }
    
    // Inserisce il turno nella tabella turni
    $stmt = $pdo->prepare("INSERT INTO turni (employee_id, entry_date, entry_time, exit_date, exit_time) 
                           VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['employee_id'],
        $data['entry_date'], 
        $data['entry_time'],
        $data['exit_date'],
        $data['exit_time']
    ]);

    // Risposta di successo
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    // Gestione errori database
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>