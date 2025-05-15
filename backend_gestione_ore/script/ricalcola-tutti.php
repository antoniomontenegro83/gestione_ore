<?php
/**
 * Script per ricalcolare tutti i turni esistenti
 * Uso: php ricalcola-tutti.php
 */

// Configurazione per l'esecuzione da CLI
set_time_limit(0); // Nessun limite di tempo per l'esecuzione
ini_set('memory_limit', '256M'); // Aumenta il limite di memoria se necessario

// Include i file necessari
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

// Funzione per stampare con colori
function printColored($text, $color = 'reset') {
    global $colors;
    echo $colors[$color] . $text . $colors['reset'] . "\n";
}

// Inizio dello script
printColored("=== RICALCOLO DI TUTTI I TURNI ===", 'blue');
printColored("Inizio processo: " . date('Y-m-d H:i:s'), 'yellow');

try {
    // Recupera tutti i turni ordinati per data
    $stmt = $pdo->query("
        SELECT t.id, t.entry_date, d.cognome, d.nome 
        FROM turni t
        LEFT JOIN dipendenti d ON t.employee_id = d.id
        ORDER BY t.entry_date DESC
    ");
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $totale = count($turni);
    $successi = 0;
    $errori = 0;
    $erroriDettagli = [];
    
    printColored("Turni totali da processare: $totale", 'yellow');
    printColored("----------------------------------------", 'blue');
    
    // Progress bar setup
    $progressWidth = 50;
    
    foreach ($turni as $index => $turno) {
        $progressIndex = $index + 1;
        
        try {
            // Prima eliminiamo il calcolo esistente per forzare il ricalcolo
            $deleteStmt = $pdo->prepare("DELETE FROM calcolo_ore WHERE turno_id = ?");
            $deleteStmt->execute([$turno['id']]);
            
            // Poi ricalcoliamo
            $risultato = calcolaESalvaOreTurno($turno['id']);
            $successi++;
            
            // Informazioni sul turno processato
            $info = sprintf(
                "[%d/%d] ID: %d | %s | %s %s - OK (Tot: %.2f ore)",
                $progressIndex,
                $totale,
                $turno['id'],
                $turno['entry_date'],
                $turno['cognome'],
                $turno['nome'],
                $risultato['totale']
            );
            
            // Mostra progress bar ogni 10 turni o all'ultimo
            if ($progressIndex % 10 == 0 || $progressIndex == $totale) {
                $progress = round(($progressIndex / $totale) * $progressWidth);
                $bar = str_repeat('█', $progress) . str_repeat('░', $progressWidth - $progress);
                $percentage = round(($progressIndex / $totale) * 100);
                
                echo "\r[$bar] $percentage% - $info";
                
                // A fine riga, vai a capo
                if ($progressIndex == $totale) {
                    echo "\n";
                }
            }
            
        } catch (Exception $e) {
            $errori++;
            $errorInfo = sprintf(
                "Turno ID: %d | %s | %s %s - Errore: %s",
                $turno['id'],
                $turno['entry_date'],
                $turno['cognome'],
                $turno['nome'],
                $e->getMessage()
            );
            $erroriDettagli[] = $errorInfo;
            
            // Mostra errore immediatamente
            echo "\n";
            printColored($errorInfo, 'red');
        }
        
        // Piccola pausa ogni 100 turni per non sovraccaricare il server
        if ($progressIndex % 100 == 0) {
            sleep(1);
        }
    }
    
    // Risultati finali
    printColored("\n========================================", 'blue');
    printColored("RICALCOLO COMPLETATO", 'green');
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
    
    // Statistiche finali sui calcoli
    $statsStmt = $pdo->query("
        SELECT 
            COUNT(*) as totale_calcoli,
            SUM(feriali_diurne) as tot_feriali_diurne,
            SUM(feriali_notturne) as tot_feriali_notturne,
            SUM(festive_diurne) as tot_festive_diurne,
            SUM(festive_notturne) as tot_festive_notturne,
            SUM(totale_ore) as totale_ore_complessive
        FROM calcolo_ore
    ");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    printColored("\nSTATISTICHE CALCOLI:", 'blue');
    printColored("----------------------------------------", 'blue');
    printColored("Totale calcoli salvati: " . $stats['totale_calcoli'], 'yellow');
    printColored("Ore feriali diurne: " . number_format($stats['tot_feriali_diurne'], 2), 'yellow');
    printColored("Ore feriali notturne: " . number_format($stats['tot_feriali_notturne'], 2), 'yellow');
    printColored("Ore festive diurne: " . number_format($stats['tot_festive_diurne'], 2), 'yellow');
    printColored("Ore festive notturne: " . number_format($stats['tot_festive_notturne'], 2), 'yellow');
    printColored("TOTALE ORE: " . number_format($stats['totale_ore_complessive'], 2), 'green');
    
} catch (Exception $e) {
    printColored("\nERRORE CRITICO: " . $e->getMessage(), 'red');
    exit(1);
}

// Se eseguito da web browser, aggiungi un link per tornare indietro
if (php_sapi_name() !== 'cli') {
    echo "\n\n<br><br><a href='javascript:history.back()'>Torna indietro</a>";
}
?>