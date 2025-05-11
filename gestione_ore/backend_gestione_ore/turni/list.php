<?php
require_once '../db.php';
header("Content-Type: application/json");

try {
    // Query per ottenere i turni con le informazioni dei dipendenti
    // Modificata per usare 'dipendenti' con 'd' minuscola invece di 'Dipendenti'
    $stmt = $pdo->query("
        SELECT t.id, t.entry_date, t.entry_time, t.exit_date, t.exit_time,
               d.cognome, d.nome, d.qualifica, d.sede
        FROM turni t
        LEFT JOIN dipendenti d ON t.employee_id = d.id
        ORDER BY t.entry_date DESC, t.entry_time DESC
    ");

    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($turni);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>