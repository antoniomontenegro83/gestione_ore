<?php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Legge i dati inviati in formato JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica che i campi obbligatori siano presenti
    if (!isset($data['cognome']) || !isset($data['nome']) || 
        empty(trim($data['cognome'])) || empty(trim($data['nome']))) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Nome e cognome sono obbligatori"]);
        exit;
    }
    
    if (!isset($data['qualifica']) || empty($data['qualifica'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Qualifica è obbligatoria"]);
        exit;
    }
    
    if (!isset($data['sede']) || empty($data['sede'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Sede è obbligatoria"]);
        exit;
    }
    
    // Normalizza i dati (maiuscolo per nome e cognome)
    $cognome = strtoupper(trim($data['cognome']));
    $nome = strtoupper(trim($data['nome']));
    $qualifica = trim($data['qualifica']);
    $sede = trim($data['sede']);
    
    // Verifica se il dipendente esiste già (stesso nome e cognome)
    $checkStmt = $pdo->prepare("SELECT id FROM dipendenti WHERE cognome = ? AND nome = ?");
    $checkStmt->execute([$cognome, $nome]);
    
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Dipendente già esistente con lo stesso nome e cognome"]);
        exit;
    }
    
    // Inserisce il nuovo dipendente
    $stmt = $pdo->prepare("INSERT INTO dipendenti (cognome, nome, qualifica, sede) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute([$cognome, $nome, $qualifica, $sede]);
    
    if ($result) {
        $newId = $pdo->lastInsertId();
        echo json_encode([
            "success" => true, 
            "id" => $newId,
            "message" => "Dipendente aggiunto con successo"
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