<?php
// Questo script controlla e corregge tutti i file PHP nelle cartelle specificate
// Rimuove i commenti all'inizio del file che potrebbero interferire con la risposta JSON

// Cartelle da controllare
$directories = [
    'backend_gestione_ore/dipendenti',
    'backend_gestione_ore/turni',
    'backend_gestione_ore/sedi',
    'backend_gestione_ore/qualifiche'
];

// Funzione per correggere un singolo file PHP
function cleanPHPFile($filePath) {
    // Leggi il contenuto del file
    $content = file_get_contents($filePath);
    
    // Verifica se inizia con un commento
    if (preg_match('/^\/\* .+? \*\//', $content)) {
        // Rimuovi il commento
        $newContent = preg_replace('/^\/\* .+? \*\//', '', $content);
        
        // Scrivi il nuovo contenuto
        file_put_contents($filePath, $newContent);
        return true; // File modificato
    }
    return false; // Nessuna modifica necessaria
}

// Controlla tutti i file PHP nelle cartelle specificate
$changedFiles = [];
$checkedFiles = [];

foreach ($directories as $dir) {
    // Verifica se la directory esiste
    if (!is_dir($dir)) {
        echo "<p>La directory <code>$dir</code> non esiste.</p>";
        continue;
    }
    
    // Ottieni tutti i file PHP nella directory
    $phpFiles = glob("$dir/*.php");
    
    foreach ($phpFiles as $file) {
        $checkedFiles[] = $file;
        
        // Correggere il file
        if (cleanPHPFile($file)) {
            $changedFiles[] = $file;
        }
    }
}

// Mostra i risultati
echo "<h1>Pulizia dei file PHP</h1>";
echo "<p>File controllati: " . count($checkedFiles) . "</p>";
echo "<p>File modificati: " . count($changedFiles) . "</p>";

if (count($changedFiles) > 0) {
    echo "<h2>File modificati:</h2>";
    echo "<ul>";
    foreach ($changedFiles as $file) {
        echo "<li>$file</li>";
    }
    echo "</ul>";
}

echo "<h2>File controllati:</h2>";
echo "<ul>";
foreach ($checkedFiles as $file) {
    echo "<li>$file</li>";
}
echo "</ul>";
?>

<p><a href="javascript:history.back()">Torna indietro</a></p>