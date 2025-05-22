<?php
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

<?php
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

<?php
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