<?php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Legge i dati inviati in formato JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica se i dati necessari sono presenti
    if (!isset($data['cognome']) || !isset($data['nome']) || 
        !isset($data['qualifica']) || !isset($data['sede'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Dati mancanti"]);
        exit;
    }
    
    // Inserisce il dipendente nella tabella dipendenti
    $stmt = $pdo->prepare("INSERT INTO dipendenti (cognome, nome, qualifica, sede) 
                           VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['cognome'],
        $data['nome'],
        $data['qualifica'],
        $data['sede']
    ]);

    // Ottieni l'ID del dipendente appena inserito
    $lastId = $pdo->lastInsertId();

    // Risposta di successo
    echo json_encode(["success" => true, "id" => $lastId]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>