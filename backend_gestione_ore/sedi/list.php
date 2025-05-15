<?php
require_once '../db.php';
header("Content-Type: application/json");

// Pulisci qualsiasi output precedente
ob_clean();

try {
    $stmt = $pdo->query("SELECT id, nome FROM sedi ORDER BY nome");
    $sedi = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sedi);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>