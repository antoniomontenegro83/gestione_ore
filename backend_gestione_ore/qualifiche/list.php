<?php
require_once '../db.php';
header("Content-Type: application/json");

// Pulisci qualsiasi output precedente
ob_clean();

try {
    $stmt = $pdo->query("SELECT id, qualifica FROM qualifiche ORDER BY id");
    $qualifiche = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($qualifiche);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>