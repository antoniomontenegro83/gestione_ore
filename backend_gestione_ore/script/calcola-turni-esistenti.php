<?php
/**
 * Script per calcolare tutti i turni esistenti che non hanno ancora il calcolo
 */

// Configurazione per l'esecuzione
set_time_limit(0);
ini_set('memory_limit', '256M');

require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/calcolo/calcola-ore.php';

// Colori per l'output CLI
$colors = [
    'reset' => "\033[0m",
    'red' => "\033[31m",
    'green' => "\033[32m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
];

function printColored($text, $color = 'reset') {
    global $colors;
    if (php_sapi_name() === 'cli') {
        echo $colors[$color] . $text . $colors['reset'] . "\n";
    } else {
        $htmlColor = [
            'red' => '#ff0000',
            'green' => '#00ff00',
            'yellow' => '#ffff00',
            'blue' => '#0000ff',
            'reset' => '#000000'
        ];
        echo "<span style='color: " . $htmlColor[$color] . "'>" . $text . "</span><br>\n";
    }
}

printColored("=== CALCOLO TURNI ESISTENTI ===", 'blue');
printColored("Inizio processo: " . date('Y-m-d H:i:s'), 'yellow');

try {
    // Prima, conta quanti turni non hanno calcoli
    $countStmt = $pdo->query("
        SELECT COUNT(*) as totale 
        FROM turni t
        LEFT JOIN calcolo_ore co ON t.id = co.turno_id
        WHERE co.id IS NULL
    ");
    $result = $countStmt->fetch(PDO::FETCH_ASSOC);
    $turniDaCalcolare = $result['totale'];
    
    printColored("Turni senza calcolo: $turniDaCalcolare", 'yellow');
    
    if ($turniDaCalcolare == 0) {
        printColored("Tutti i turni sono già stati calcolati!", 'green');
        exit;
    }
    
    // Recupera i turni che non hanno ancora il calcolo
    $stmt = $pdo->query("
        SELECT t.*, d.cognome, d.nome, d.qualifica
        FROM turni t
        LEFT JOIN dipendenti d ON t.employee_id = d.id
        LEFT JOIN calcolo_ore co ON t.id = co.turno_id
        WHERE co.id IS NULL
        ORDER BY t.entry_date DESC
    ");
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $totale = count($turni);
    $successi = 0;
    $errori = 0;
    $erroriDettagli = [];
    
    printColored("Inizio calcolo di $totale turni...", 'blue');
    printColored("----------------------------------------", 'blue');
    
    foreach ($turni as $index => $turno) {
        $progressIndex = $index + 1;
        
        try {
            // Calcola e salva le ore
            $risultato = calcolaESalvaOreTurno($turno['id']);
            $successi++;
            
            $info = sprintf(
                "[%d/%d] Turno ID: %d | %s | %s %s - OK (Ore: %.2f)",
                $progressIndex,
                $totale,
                $turno['id'],
                $turno['entry_date'],
                $turno['cognome'],
                $turno['nome'],
                $risultato['totale']
            );
            
            printColored($info, 'green');
            
        } catch (Exception $e) {
            $errori++;
            $errorInfo = sprintf(
                "[%d/%d] Turno ID: %d | %s | %s %s - ERRORE: %s",
                $progressIndex,
                $totale,
                $turno['id'],
                $turno['entry_date'],
                $turno['cognome'] ?? 'N/A',
                $turno['nome'] ?? 'N/A',
                $e->getMessage()
            );
            $erroriDettagli[] = $errorInfo;
            
            printColored($errorInfo, 'red');
        }
        
        // Piccola pausa ogni 50 turni
        if ($progressIndex % 50 == 0) {
            sleep(1);
        }
    }
    
    // Risultati finali
    printColored("\n========================================", 'blue');
    printColored("CALCOLO COMPLETATO", 'green');
    printColored("----------------------------------------", 'blue');
    printColored("Totale turni processati: $totale", 'yellow');
    printColored("Successi: $successi", 'green');
    printColored("Errori: $errori", 'red');
    printColored("Fine processo: " . date('Y-m-d H:i:s'), 'yellow');
    
    // Se ci sono stati errori, mostra i dettagli
    if (count($erroriDettagli) > 0) {
        printColored("\nDETTAGLI ERRORI:", 'red');
        printColored("----------------------------------------", 'red');
        foreach ($erroriDettagli as $errore) {
            printColored($errore, 'red');
        }
    }
    
    // Verifica finale
    $verifyStmt = $pdo->query("
        SELECT 
            COUNT(*) as turni_totali,
            (SELECT COUNT(*) FROM calcolo_ore) as calcoli_totali,
            (SELECT COUNT(*) FROM turni t LEFT JOIN calcolo_ore co ON t.id = co.turno_id WHERE co.id IS NULL) as turni_senza_calcolo
    ");
    $verify = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    
    printColored("\nVERIFICA FINALE:", 'blue');
    printColored("----------------------------------------", 'blue');
    printColored("Turni totali nel database: " . $verify['turni_totali'], 'yellow');
    printColored("Calcoli totali salvati: " . $verify['calcoli_totali'], 'yellow');
    printColored("Turni ancora senza calcolo: " . $verify['turni_senza_calcolo'], $verify['turni_senza_calcolo'] > 0 ? 'red' : 'green');
    
} catch (Exception $e) {
    printColored("\nERRORE CRITICO: " . $e->getMessage(), 'red');
    exit(1);
}

// Se eseguito da web browser, aggiungi un link per tornare indietro
if (php_sapi_name() !== 'cli') {
    echo "\n\n<br><br><a href='javascript:history.back()'>Torna indietro</a>";
}
?>