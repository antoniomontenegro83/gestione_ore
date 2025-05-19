<?php
require_once '../db.php';
require_once '../utilities/calculator.php';

// Parametri di filtro
$startDate = $_GET['startDate'] ?? null;
$endDate = $_GET['endDate'] ?? null;
$employeeId = $_GET['employeeId'] ?? null;
$sede = $_GET['sede'] ?? null;
$qualifica = $_GET['qualifica'] ?? null;

// Validazione
if (!$startDate || !$endDate) {
    header("Content-Type: application/json");
    http_response_code(400);
    echo json_encode([
        "error" => "Date obbligatorie",
        "message" => "Specificare startDate e endDate come parametri GET"
    ]);
    exit;
}

try {
    // Query dalla tabella calcolo_ore invece di turni
    $sql = "
        SELECT 
            co.cognome, co.nome, co.qualifica, co.sede,
            co.entry_date, co.entry_time, co.exit_date, co.exit_time,
            co.feriali_diurne, co.feriali_notturne, 
            co.festive_diurne, co.festive_notturne, co.totale_ore
        FROM calcolo_ore co
        WHERE co.entry_date BETWEEN ? AND ?
    ";
    
    $params = [$startDate, $endDate];
    
    if ($employeeId) {
        $sql .= " AND co.employee_id = ?";
        $params[] = $employeeId;
    }
    
    if ($sede) {
        $sql .= " AND co.sede = ?";
        $params[] = $sede;
    }
    
    if ($qualifica) {
        $sql .= " AND co.qualifica = ?";
        $params[] = $qualifica;
    }
    
    $sql .= " ORDER BY co.cognome, co.nome, co.entry_date";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Se non ci sono risultati
    if (count($turni) === 0) {
        header("Content-Type: application/json");
        echo json_encode([
            "error" => "Nessun dato disponibile",
            "message" => "Nessun turno trovato per il periodo selezionato"
        ]);
        exit;
    }
    
    // Calcola i totali
    $sommario = [
        'feriali_diurne' => 0,
        'feriali_notturne' => 0,
        'festive_diurne' => 0,
        'festive_notturne' => 0,
        'totale_ore' => 0
    ];
    
    foreach ($turni as $turno) {
        $sommario['feriali_diurne'] += floatval($turno['feriali_diurne']);
        $sommario['feriali_notturne'] += floatval($turno['feriali_notturne']);
        $sommario['festive_diurne'] += floatval($turno['festive_diurne']);
        $sommario['festive_notturne'] += floatval($turno['festive_notturne']);
        $sommario['totale_ore'] += floatval($turno['totale_ore']);
    }
    
    // Arrotonda i totali
    foreach ($sommario as $key => $value) {
        $sommario[$key] = round($value, 2);
    }
    
    // Intestazione per download CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="report_ore_' . date('Y-m-d') . '.csv"');
    
    // Apri l'output per la scrittura
    $output = fopen('php://output', 'w');
    
    // Inserisci UTF-8 BOM per Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Intestazione
    fputcsv($output, [
        'Report Ore dal ' . date('d/m/Y', strtotime($startDate)) . ' al ' . date('d/m/Y', strtotime($endDate))
    ]);
    
    // Riga vuota
    fputcsv($output, []);
    
    // Sommario
    fputcsv($output, ['Sommario']);
    fputcsv($output, ['Ore Feriali Diurne', number_format($sommario['feriali_diurne'], 2, ',', '.')]);
    fputcsv($output, ['Ore Feriali Notturne', number_format($sommario['feriali_notturne'], 2, ',', '.')]);
    fputcsv($output, ['Ore Festive Diurne', number_format($sommario['festive_diurne'], 2, ',', '.')]);
    fputcsv($output, ['Ore Festive Notturne', number_format($sommario['festive_notturne'], 2, ',', '.')]);
    fputcsv($output, ['Totale Ore', number_format($sommario['totale_ore'], 2, ',', '.')]);
    
    // Riga vuota
    fputcsv($output, []);
    
    // Intestazione tabella
    fputcsv($output, [
        'Cognome', 'Nome', 'Qualifica', 'Sede', 'Data Ingresso', 'Ora Ingresso', 'Data Uscita', 'Ora Uscita',
        'Ore Feriali Diurne', 'Ore Feriali Notturne', 'Ore Festive Diurne', 'Ore Festive Notturne', 'Totale Ore'
    ]);
    
    // Dati
    foreach ($turni as $turno) {       
        fputcsv($output, [
            $turno['cognome'],
            $turno['nome'],
            $turno['qualifica'] ?? '-',
            $turno['sede'] ?? '-',
            date('d/m/Y', strtotime($turno['entry_date'])),
            substr($turno['entry_time'], 0, 5),
            date('d/m/Y', strtotime($turno['exit_date'])),
            substr($turno['exit_time'], 0, 5),
            number_format($turno['feriali_diurne'], 2, ',', '.'),
            number_format($turno['feriali_notturne'], 2, ',', '.'),
            number_format($turno['festive_diurne'], 2, ',', '.'),
            number_format($turno['festive_notturne'], 2, ',', '.'),
            number_format($turno['totale_ore'], 2, ',', '.')
        ]);
    }
    
    // Chiudi il file
    fclose($output);
    exit;
    
} catch (PDOException $e) {
    error_log("Errore database in excel.php: " . $e->getMessage());
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Errore database",
        "message" => $e->getMessage()
    ]);
    exit;
} catch (Exception $e) {
    error_log("Errore generale in excel.php: " . $e->getMessage());
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Errore generale",
        "message" => $e->getMessage()
    ]);
    exit;
}
?>