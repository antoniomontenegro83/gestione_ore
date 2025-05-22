<?php
// File: backend_gestione_ore/qualifiche/count-dipendenti.php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Verifica che il parametro qualifica sia presente
    if (!isset($_GET['qualifica']) || empty(trim($_GET['qualifica']))) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Parametro qualifica mancante"]);
        exit;
    }
    
    $qualifica = trim($_GET['qualifica']);
    
    // Conta i dipendenti associati a questa qualifica
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM dipendenti WHERE qualifica = ?");
    $stmt->execute([$qualifica]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "qualifica" => $qualifica,
        "count" => intval($result['count'])
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Errore database: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Errore generico: " . $e->getMessage()]);
}
?>