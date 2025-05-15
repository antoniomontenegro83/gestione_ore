<?php
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/calcolo/calcola-ore.php';

echo "Aggiornamento sedi per turni esistenti...\n";

try {
    // Trova tutti i turni
    $stmt = $pdo->query("SELECT id FROM turni ORDER BY id");
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $totale = count($turni);
    $aggiornati = 0;
    
    foreach ($turni as $turno) {
        try {
            // Ricalcola per aggiornare la sede
            calcolaESalvaOreTurno($turno['id']);
            $aggiornati++;
            echo "Turno {$turno['id']} aggiornato\n";
        } catch (Exception $e) {
            echo "Errore turno {$turno['id']}: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\nCompletato: $aggiornati su $totale turni aggiornati\n";
    
} catch (Exception $e) {
    echo "Errore: " . $e->getMessage() . "\n";
}
?>