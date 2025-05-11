<?php
require_once '../db.php';
require_once '../turni/calculator.php';

// Verifica che l'estensione PHPSpreadsheet sia disponibile
if (!class_exists('ZipArchive')) {
    die("L'estensione ZipArchive è richiesta per generare file Excel.");
}

// Parametri di filtro
$startDate = $_GET['startDate'] ?? null;
$endDate = $_GET['endDate'] ?? null;
$employeeId = $_GET['employeeId'] ?? null;
$sede = $_GET['sede'] ?? null;
$qualifica = $_GET['qualifica'] ?? null;

// Validazione
if (!$startDate || !$endDate) {
    die("Date obbligatorie");
}

try {
    // Prepara la query base
    $sql = "
        SELECT t.id, t.employee_id, t.entry_date, t.entry_time, t.exit_date, t.exit_time,
               d.cognome, d.nome, d.qualifica, d.sede
        FROM turni t
        LEFT JOIN dipendenti d ON t.employee_id = d.id
        WHERE t.entry_date BETWEEN ? AND ?
    ";
    
    $params = [$startDate, $endDate];
    
    // Aggiungi il filtro per dipendente se specificato
    if ($employeeId) {
        $sql .= " AND t.employee_id = ?";
        $params[] = $employeeId;
    }
    
    // Aggiungi filtro per sede
    if ($sede) {
        $sql .= " AND d.sede = ?";
        $params[] = $sede;
    }
    
    // Aggiungi filtro per qualifica
    if ($qualifica) {
        $sql .= " AND d.qualifica = ?";
        $params[] = $qualifica;
    }
    
    // Ordina i risultati
    $sql .= " ORDER BY d.cognome, d.nome, t.entry_date";
    
    // Esegui la query
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Se non ci sono risultati
    if (count($turni) === 0) {
        die("Nessun dato disponibile per il periodo selezionato.");
    }
    
    // Calcola le ore per ogni turno
    $turniConOre = [];
    $sommario = [
        'feriali_diurne' => 0,
        'feriali_notturne' => 0,
        'festive_diurne' => 0,
        'festive_notturne' => 0,
        'totale_ore' => 0
    ];
    
    foreach ($turni as $turno) {
        // Calcola le ore lavorate
        $ore = calcolaOreLavorate(
            $turno['entry_date'],
            $turno['entry_time'],
            $turno['exit_date'],
            $turno['exit_time']
        );
        
        // Aggiungi le ore al turno
        $turno = array_merge($turno, $ore);
        $turniConOre[] = $turno;
        
        // Aggiorna il sommario
        $sommario['feriali_diurne'] += $ore['feriali_diurne'];
        $sommario['feriali_notturne'] += $ore['feriali_notturne'];
        $sommario['festive_diurne'] += $ore['festive_diurne'];
        $sommario['festive_notturne'] += $ore['festive_notturne'];
    }
    
    // Calcola il totale delle ore
    $sommario['totale_ore'] = $sommario['feriali_diurne'] + $sommario['feriali_notturne'] + 
                             $sommario['festive_diurne'] + $sommario['festive_notturne'];
    
    // Arrotonda i valori a 2 decimali
    foreach ($sommario as $key => $value) {
        $sommario[$key] = round($value, 2);
    }
    
    // In questo punto, aggiungeremo il codice per generare il file Excel
    // Se non è disponibile l'estensione PHPSpreadsheet, utilizziamo un CSV come fallback
    
    // Generazione CSV di base (verrà sostituito con PHPSpreadsheet in produzione)
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="report_ore_' . date('Y-m-d') . '.csv"');
    
    // Apri l'output per la scrittura
    $output = fopen('php://output', 'w');
    
    // Inserisci UTF-8 BOM per Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Intestazione
    fputcsv($output, [
        'Report Ore dal ' . $startDate . ' al ' . $endDate
    ]);
    
    // Riga vuota
    fputcsv($output, []);
    
    // Sommario
    fputcsv($output, ['Sommario']);
    fputcsv($output, ['Ore Feriali Diurne', $sommario['feriali_diurne']]);
    fputcsv($output, ['Ore Feriali Notturne', $sommario['feriali_notturne']]);
    fputcsv($output, ['Ore Festive Diurne', $sommario['festive_diurne']]);
    fputcsv($output, ['Ore Festive Notturne', $sommario['festive_notturne']]);
    fputcsv($output, ['Totale Ore', $sommario['totale_ore']]);
    
    // Riga vuota
    fputcsv($output, []);
    
    // Intestazione tabella
    fputcsv($output, [
        'Cognome', 'Nome', 'Qualifica', 'Sede', 'Data', 'Ingresso', 'Uscita',
        'Ore Feriali Diurne', 'Ore Feriali Notturne', 'Ore Festive Diurne', 'Ore Festive Notturne', 'Totale Ore'
    ]);
    
    // Dati
    foreach ($turniConOre as $turno) {
        // Calcola il totale ore per il turno
        $totaleOre = $turno['feriali_diurne'] + $turno['feriali_notturne'] + 
                    $turno['festive_diurne'] + $turno['festive_notturne'];
                    
        // Formatta le date
        $dataIngresso = date('d/m/Y', strtotime($turno['entry_date']));
        $oraIngresso = date('H:i', strtotime($turno['entry_time']));
        $oraUscita = date('H:i', strtotime($turno['exit_time']));
        
        fputcsv($output, [
            $turno['cognome'],
            $turno['nome'],
            $turno['qualifica'],
            $turno['sede'],
            $dataIngresso,
            $oraIngresso,
            $oraUscita,
            number_format($turno['feriali_diurne'], 2, ',', '.'),
            number_format($turno['feriali_notturne'], 2, ',', '.'),
            number_format($turno['festive_diurne'], 2, ',', '.'),
            number_format($turno['festive_notturne'], 2, ',', '.'),
            number_format($totaleOre, 2, ',', '.')
        ]);
    }
    
    // Chiudi il file
    fclose($output);
    exit;
    
} catch (PDOException $e) {
    die("Errore: " . $e->getMessage());
}
?>