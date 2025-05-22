<?php
/**
 * pdf_helpers.php - Funzioni di supporto per la generazione dei report PDF
 */

/**
 * Converte un valore decimale in formato ore:minuti (HH:MM)
 * 
 * @param float $decimal Valore decimale delle ore
 * @return string Ore in formato HH:MM
 */
function decimal_to_time($decimal) {
    $hours = floor($decimal);
    $minutes = round(($decimal - $hours) * 60);
    
    if ($minutes == 60) {
        $hours++;
        $minutes = 0;
    }
    
    return $hours . ":" . str_pad($minutes, 2, "0", STR_PAD_LEFT);
}

/**
 * Ottiene i dati per il report PDF
 * 
 * @param PDO $pdo Connessione al database
 * @param string $startDate Data di inizio
 * @param string $endDate Data di fine
 * @param int|null $employeeId ID del dipendente (opzionale)
 * @param string|null $sede Nome della sede (opzionale)
 * @return array Dati per il report
 */
function getReportData($pdo, $startDate, $endDate, $employeeId = null, $sede = null) {
    // Query dalla tabella calcolo_ore
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
    
    $sql .= " ORDER BY co.cognome, co.nome, co.entry_date";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calcola i totali
    $sommario = calculateSummary($turni);
    
    // Costruisci il nome del file e le informazioni del report
    $fileInfo = generateFileInfo($pdo, $startDate, $endDate, $employeeId, $sede);
    
    return [
        'turni' => $turni,
        'sommario' => $sommario,
        'nomeFile' => $fileInfo['nomeFile'],
        'titoloReport' => $fileInfo['titoloReport'],
        'sottotitoloReport' => $fileInfo['sottotitoloReport']
    ];
}

/**
 * Calcola i totali dai dati dei turni
 *
 * @param array $turni Dati dei turni
 * @return array Array con i totali
 */
function calculateSummary($turni) {
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
    
    return $sommario;
}

/**
 * Genera le informazioni sul file (nome e titoli) per il report
 *
 * @param PDO $pdo Connessione al database
 * @param string $startDate Data di inizio
 * @param string $endDate Data di fine
 * @param int|null $employeeId ID del dipendente (opzionale)
 * @param string|null $sede Nome della sede (opzionale)
 * @return array Array con nome file e titoli
 */
function generateFileInfo($pdo, $startDate, $endDate, $employeeId = null, $sede = null) {
    // Nome file predefinito
    $nomeFile = 'report_ore';
    $nomeDipendente = '';
    $qualificaDipendente = '';
    
    // Se è specificato un dipendente, aggiungi il suo nome
    if ($employeeId) {
        $stmtDip = $pdo->prepare("SELECT cognome, nome, qualifica FROM dipendenti WHERE id = ?");
        $stmtDip->execute([$employeeId]);
        if ($dipendente = $stmtDip->fetch(PDO::FETCH_ASSOC)) {
            $nomeFile = $dipendente['cognome'] . '_' . $dipendente['nome'];
            $nomeDipendente = $dipendente['cognome'] . ' ' . $dipendente['nome'];
            $qualificaDipendente = $dipendente['qualifica'] ?? '';
        }
    }
    
    // Sanitizza il nome del file e aggiungi le date
    $nomeFile .= '_' . str_replace('-', '', $startDate) . '_' . str_replace('-', '', $endDate);
    $nomeFile = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nomeFile);
    
    // Titolo del report
    $titoloReport = "Report Ore dal " . date('d/m/Y', strtotime($startDate)) . " al " . date('d/m/Y', strtotime($endDate));
    
    // Sottotitolo con qualifica e nome
    $sottotitoloReport = "";
    if ($nomeDipendente) {
        $sottotitoloReport = $qualificaDipendente ? $qualificaDipendente . " " . $nomeDipendente : $nomeDipendente;
    }
    
    if ($sede) {
        $sottotitoloReport .= ($sottotitoloReport ? " - " : "") . "Sede: " . $sede;
    }
    
    return [
        'nomeFile' => $nomeFile,
        'titoloReport' => $titoloReport,
        'sottotitoloReport' => $sottotitoloReport
    ];
}
?>