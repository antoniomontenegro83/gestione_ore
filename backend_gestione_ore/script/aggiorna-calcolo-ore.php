<?php
// script/aggiorna-calcolo-ore.php
require_once '../db.php';

try {
    // Aggiorna i record esistenti con i dati dei dipendenti
    $sql = "
        UPDATE calcolo_ore co
        JOIN dipendenti d ON co.employee_id = d.id
        SET co.cognome = d.cognome,
            co.nome = d.nome,
            co.qualifica = d.qualifica
        WHERE co.cognome IS NULL OR co.nome IS NULL
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $rowsUpdated = $stmt->rowCount();
    
    echo "Aggiornati $rowsUpdated record con i dati dei dipendenti.\n";
    
} catch (PDOException $e) {
    echo "Errore: " . $e->getMessage() . "\n";
}
?>