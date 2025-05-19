<?php
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/utilities/calculator.php';

/**
 * Converte il formato HH:MM in ore decimali
 * @param string $time - Tempo in formato HH:MM
 * @return float - Ore decimali
 */
function convertiOreMinutiInDecimale($time) {
    if (strpos($time, ':') !== false) {
        list($ore, $minuti) = explode(':', $time);
        return (float)$ore + ((float)$minuti / 60);
    }
    return (float)$time;
}

/**
 * Calcola e salva le ore per un singolo turno
 * @param int $turno_id ID del turno
 * @return array Risultato del calcolo
 */
function calcolaESalvaOreTurno($turno_id) {
    global $pdo;
    
    // Recupera i dati del turno e del dipendente
    // Usa COALESCE per prendere la sede del turno se presente, altrimenti quella del dipendente
    $stmt = $pdo->prepare("
        SELECT t.id, t.employee_id, t.entry_date, t.entry_time, t.exit_date, t.exit_time,
               d.cognome, d.nome, d.qualifica,
               COALESCE(t.sede, d.sede) as sede
        FROM turni t
        LEFT JOIN dipendenti d ON t.employee_id = d.id
        WHERE t.id = ?
    ");
    $stmt->execute([$turno_id]);
    $turno = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$turno) {
        throw new Exception("Turno non trovato");
    }
    
    // Calcola le ore usando calculator.php (ora restituisce formato HH:MM)
    $ore = calcolaOreLavorate(
        $turno['entry_date'], 
        $turno['entry_time'], 
        $turno['exit_date'], 
        $turno['exit_time']
    );
    
    // Converti le ore dal formato HH:MM a decimale per il calcolo del totale
    $feriali_diurne = convertiOreMinutiInDecimale($ore['feriali_diurne']);
    $feriali_notturne = convertiOreMinutiInDecimale($ore['feriali_notturne']);
    $festive_diurne = convertiOreMinutiInDecimale($ore['festive_diurne']);
    $festive_notturne = convertiOreMinutiInDecimale($ore['festive_notturne']);
    
    // Calcola il totale in decimale
    $totale = $feriali_diurne + $feriali_notturne + $festive_diurne + $festive_notturne;
    
    // Verifica se esiste già un calcolo per questo turno
    $checkStmt = $pdo->prepare("SELECT id FROM calcolo_ore WHERE turno_id = ?");
    $checkStmt->execute([$turno_id]);
    $esistente = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($esistente) {
        // Aggiorna il calcolo esistente
        $updateStmt = $pdo->prepare("
            UPDATE calcolo_ore 
            SET employee_id = ?,
                cognome = ?,
                nome = ?,
                qualifica = ?,
                sede = ?,
                entry_date = ?,
                entry_time = ?,
                exit_date = ?,
                exit_time = ?,
                feriali_diurne = ?,
                feriali_notturne = ?,
                festive_diurne = ?,
                festive_notturne = ?,
                totale_ore = ?
            WHERE turno_id = ?
        ");
        
        $updateStmt->execute([
            $turno['employee_id'],
            $turno['cognome'],
            $turno['nome'],
            $turno['qualifica'],
            $turno['sede'],
            $turno['entry_date'],
            $turno['entry_time'],
            $turno['exit_date'],
            $turno['exit_time'],
            $feriali_diurne,
            $feriali_notturne,
            $festive_diurne,
            $festive_notturne,
            $totale,
            $turno_id
        ]);
    } else {
        // Inserisci un nuovo calcolo
        $insertStmt = $pdo->prepare("
            INSERT INTO calcolo_ore 
            (turno_id, employee_id, cognome, nome, qualifica, sede, entry_date, entry_time, exit_date, exit_time,
             feriali_diurne, feriali_notturne, festive_diurne, festive_notturne, totale_ore)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $insertStmt->execute([
            $turno_id,
            $turno['employee_id'],
            $turno['cognome'],
            $turno['nome'],
            $turno['qualifica'],
            $turno['sede'],
            $turno['entry_date'],
            $turno['entry_time'],
            $turno['exit_date'],
            $turno['exit_time'],
            $feriali_diurne,
            $feriali_notturne,
            $festive_diurne,
            $festive_notturne,
            $totale
        ]);
    }
    
    return [
        'turno_id' => $turno_id,
        'dipendente' => [
            'cognome' => $turno['cognome'],
            'nome' => $turno['nome'],
            'qualifica' => $turno['qualifica'],
            'sede' => $turno['sede']
        ],
        'ore' => $ore,  // Mantiene il formato HH:MM per la visualizzazione
        'totale' => round($totale, 2)  // Totale in formato decimale
    ];
}

// Se questo file viene chiamato direttamente
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    header("Content-Type: application/json");
    
    try {
        if (isset($_GET['turno_id'])) {
            $turno_id = $_GET['turno_id'];
            $risultato = calcolaESalvaOreTurno($turno_id);
            echo json_encode(['success' => true, 'risultato' => $risultato]);
        } else {
            throw new Exception("ID turno mancante");
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>