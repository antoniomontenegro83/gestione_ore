<?php
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/calcolo/calcola-ore.php';

echo "<h2>Ricalcolo turni con sede</h2>";

try {
    // Prima aggiungi la colonna sede se non esiste
    echo "Controllo colonne nel database...<br>";
    
    // Verifica se la colonna sede esiste in turni
    $checkTurni = $pdo->query("SHOW COLUMNS FROM turni LIKE 'sede'");
    if ($checkTurni->rowCount() == 0) {
        echo "Aggiunta colonna sede alla tabella turni...<br>";
        $pdo->exec("ALTER TABLE turni ADD COLUMN sede VARCHAR(100) DEFAULT NULL");
    }
    
    // Verifica se la colonna sede esiste in calcolo_ore
    $checkCalcolo = $pdo->query("SHOW COLUMNS FROM calcolo_ore LIKE 'sede'");
    if ($checkCalcolo->rowCount() == 0) {
        echo "Aggiunta colonna sede alla tabella calcolo_ore...<br>";
        $pdo->exec("ALTER TABLE calcolo_ore ADD COLUMN sede VARCHAR(100) DEFAULT NULL");
    }
    
    // Conta i turni totali
    $countStmt = $pdo->query("SELECT COUNT(*) as total FROM turni");
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "Turni totali da ricalcolare: $total<br><br>";
    
    // Recupera tutti i turni
    $stmt = $pdo->query("SELECT id FROM turni ORDER BY id");
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $successi = 0;
    $errori = 0;
    
    foreach ($turni as $turno) {
        try {
            // Ricalcola il turno
            calcolaESalvaOreTurno($turno['id']);
            $successi++;
            echo "Turno {$turno['id']} ricalcolato con successo<br>";
        } catch (Exception $e) {
            $errori++;
            echo "<span style='color: red;'>Errore turno {$turno['id']}: " . $e->getMessage() . "</span><br>";
        }
    }
    
    echo "<br><strong>Completato: $successi successi, $errori errori</strong><br>";
    
    // Verifica i risultati
    $verificaStmt = $pdo->query("
        SELECT COUNT(*) as count, 
               COUNT(DISTINCT sede) as sedi_count 
        FROM calcolo_ore 
        WHERE sede IS NOT NULL
    ");
    $verifica = $verificaStmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<br>Turni con sede: " . $verifica['count'] . "<br>";
    echo "Sedi diverse trovate: " . $verifica['sedi_count'] . "<br>";
    
} catch (Exception $e) {
    echo "<span style='color: red;'>Errore: " . $e->getMessage() . "</span>";
}
?>