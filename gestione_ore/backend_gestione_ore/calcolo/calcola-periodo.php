<?php
require_once '../db.php';
require_once 'calcola-ore.php';

header("Content-Type: application/json");

try {
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    $employee_id = $_GET['employee_id'] ?? null;
    
    if (!$start_date || !$end_date) {
        throw new Exception("Periodo non specificato");
    }
    
    // Costruisci la query per recuperare i turni nel periodo
    $sql = "SELECT id FROM turni WHERE entry_date BETWEEN ? AND ?";
    $params = [$start_date, $end_date];
    
    if ($employee_id) {
        $sql .= " AND employee_id = ?";
        $params[] = $employee_id;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $risultati = [];
    $successi = 0;
    $errori = 0;
    
    foreach ($turni as $turno) {
        try {
            $risultato = calcolaESalvaOreTurno($turno['id']);
            $risultati[] = [
                'turno_id' => $turno['id'],
                'success' => true,
                'ore' => $risultato['ore'],
                'totale' => $risultato['totale']
            ];
            $successi++;
        } catch (Exception $e) {
            $risultati[] = [
                'turno_id' => $turno['id'],
                'success' => false,
                'error' => $e->getMessage()
            ];
            $errori++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'totale_turni' => count($turni),
        'successi' => $successi,
        'errori' => $errori,
        'risultati' => $risultati
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>