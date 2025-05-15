<?php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Query per ottenere tutti i dipendenti ordinati per cognome e nome
    $stmt = $pdo->query("
        SELECT id, cognome, nome, qualifica, sede
        FROM dipendenti
        ORDER BY cognome, nome
    ");

    $dipendenti = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($dipendenti);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>