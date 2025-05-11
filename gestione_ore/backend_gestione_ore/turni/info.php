<?php
// File di diagnosi per verificare la configurazione PHP e il database

// Informazioni sulla versione di PHP e sulle estensioni caricate
echo "============ INFORMAZIONI PHP ============<br>";
echo "Versione PHP: " . phpversion() . "<br>";
echo "Estensione PDO: " . (extension_loaded('pdo') ? 'Caricata' : 'Non caricata') . "<br>";
echo "Estensione PDO MySQL: " . (extension_loaded('pdo_mysql') ? 'Caricata' : 'Non caricata') . "<br>";
echo "<br>";

// Verifica la connessione al database
echo "============ TEST DATABASE ============<br>";
try {
    require_once '../db.php';
    echo "Connessione al database riuscita!<br>";
    
    // Verifica l'esistenza della tabella turni
    $stmt = $pdo->query("SHOW TABLES LIKE 'turni'");
    $tableExists = $stmt->rowCount() > 0;
    echo "Tabella 'turni': " . ($tableExists ? 'Esiste' : 'Non esiste') . "<br>";
    
    if ($tableExists) {
        // Mostra la struttura della tabella
        $stmt = $pdo->query("DESCRIBE turni");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<br>Struttura della tabella 'turni':<br>";
        echo "<pre>";
        print_r($columns);
        echo "</pre>";
    }
} catch (PDOException $e) {
    echo "Errore di connessione al database: " . $e->getMessage() . "<br>";
}

// Verifica i percorsi delle cartelle
echo "<br>============ PERCORSI ============<br>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script attuale: " . __FILE__ . "<br>";
?>