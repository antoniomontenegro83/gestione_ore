<?php
require_once '../db.php';
header("Content-Type: application/json");

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verifica che l'ID sia valido
    if (!isset($data['id']) || !is_numeric($data['id']) || $data['id'] <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "ID dipendente non valido"]);
        exit;
    }
    
    // Verifica che i campi obbligatori siano presenti
    if (!isset($data['cognome']) || !isset($data['nome']) || 
        !isset($data['qualifica']) || !isset($data['sede'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Dati mancanti"]);
        exit;
    }
    
    // Aggiorna un dipendente esistente
    $stmt = $pdo->prepare("UPDATE dipendenti SET cognome = ?, nome = ?, qualifica = ?, sede = ? WHERE id = ?");
    $stmt->execute([$data['cognome'], $data['nome'], $data['qualifica'], $data['sede'], $data['id']]);
    
    // Verifica che la riga sia stata effettivamente aggiornata
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Dipendente non trovato"]);
        exit;
    }
    
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>