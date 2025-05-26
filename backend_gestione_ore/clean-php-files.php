<?php
// Script per la pulizia dei file PHP
// Posizionato in: backend_gestione_ore/clean-php-files.php

// Cartelle da controllare (percorsi relativi dalla posizione corrente)
$directories = [
    'dipendenti',        // ✅ backend_gestione_ore/dipendenti/
    'turni',            // ✅ backend_gestione_ore/turni/
    'sedi',             // ✅ backend_gestione_ore/sedi/
    'qualifiche',       // ✅ backend_gestione_ore/qualifiche/
    'users',            // ✅ backend_gestione_ore/users/
    'auth',             // ✅ backend_gestione_ore/auth/
    'admin-auth',       // ✅ backend_gestione_ore/admin-auth/
    'calcolo',          // ✅ backend_gestione_ore/calcolo/
    'reports',          // ✅ backend_gestione_ore/reports/
    'utilities',        // ✅ backend_gestione_ore/utilities/
    'script'            // ✅ backend_gestione_ore/script/
];

// Funzione per correggere un singolo file PHP
function cleanPHPFile($filePath) {
    // Leggi il contenuto del file
    $content = file_get_contents($filePath);
    
    // Rimuovi BOM se presente
    if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
        $content = substr($content, 3);
    }
    
    // Verifica se inizia con commenti multi-linea
    if (preg_match('/^\/\*.*?\*\//s', $content)) {
        // Rimuovi il commento
        $newContent = preg_replace('/^\/\*.*?\*\//s', '', $content);
        // Rimuovi spazi bianchi all'inizio
        $newContent = ltrim($newContent);
        // Assicurati che inizi con <?php
        if (!preg_match('/^<\?php/', $newContent)) {
            $newContent = "<?php\n" . $newContent;
        }
        
        // Scrivi il nuovo contenuto
        file_put_contents($filePath, $newContent);
        return true; // File modificato
    }
    
    // Verifica se ci sono spazi prima di <?php
    if (preg_match('/^\s+<\?php/', $content)) {
        $newContent = ltrim($content);
        file_put_contents($filePath, $newContent);
        return true;
    }
    
    return false; // Nessuna modifica necessaria
}

// Funzione ricorsiva per trovare tutti i file PHP
function findPHPFiles($directory) {
    $phpFiles = [];
    
    if (!is_dir($directory)) {
        return $phpFiles;
    }
    
    $files = glob($directory . '/*.php');
    foreach ($files as $file) {
        if (is_file($file)) {
            $phpFiles[] = $file;
        }
    }
    
    return $phpFiles;
}

// Controlla tutti i file PHP nelle cartelle specificate
$changedFiles = [];
$checkedFiles = [];

echo "<h1>Pulizia dei file PHP</h1>";
echo "<p>Posizione script: <code>" . __DIR__ . "</code></p>";
echo "<p>Inizio scansione cartelle...</p>";

foreach ($directories as $dir) {
    // Verifica se la directory esiste
    if (!is_dir($dir)) {
        echo "<p>⚠️ La directory <code>$dir</code> non esiste - saltata.</p>";
        continue;
    }
    
    echo "<p>📁 Scansione directory: <code>$dir</code></p>";
    
    // Trova tutti i file PHP nella directory
    $phpFiles = findPHPFiles($dir);
    
    if (empty($phpFiles)) {
        echo "<p>📄 Nessun file PHP trovato in <code>$dir</code></p>";
        continue;
    }
    
    foreach ($phpFiles as $file) {
        $checkedFiles[] = $file;
        
        // Correggere il file
        if (cleanPHPFile($file)) {
            $changedFiles[] = $file;
            echo "<p>✅ Pulito: <code>$file</code></p>";
        } else {
            echo "<p>👌 OK: <code>$file</code></p>";
        }
    }
}

// Controllo aggiuntivo per file PHP nella directory corrente
echo "<p>📁 Scansione directory corrente: <code>./</code></p>";
$rootFiles = glob('./*.php');

foreach ($rootFiles as $file) {
    // Salta se stesso
    if (basename($file) === 'clean-php-files.php') {
        continue;
    }
    
    $checkedFiles[] = $file;
    
    if (cleanPHPFile($file)) {
        $changedFiles[] = $file;
        echo "<p>✅ Pulito: <code>$file</code></p>";
    } else {
        echo "<p>👌 OK: <code>$file</code></p>";
    }
}

// Mostra i risultati finali
echo "<hr>";
echo "<h2>📊 Risultati</h2>";
echo "<p><strong>File controllati:</strong> " . count($checkedFiles) . "</p>";
echo "<p><strong>File modificati:</strong> " . count($changedFiles) . "</p>";

if (count($changedFiles) > 0) {
    echo "<h3>🔧 File modificati:</h3>";
    echo "<ul>";
    foreach ($changedFiles as $file) {
        echo "<li><code>$file</code></li>";
    }
    echo "</ul>";
} else {
    echo "<p>✅ Nessun file necessitava di pulizia.</p>";
}

if (count($checkedFiles) > 0) {
    echo "<details>";
    echo "<summary>📋 Tutti i file controllati (" . count($checkedFiles) . ")</summary>";
    echo "<ul>";
    foreach ($checkedFiles as $file) {
        echo "<li><code>$file</code></li>";
    }
    echo "</ul>";
    echo "</details>";
}

echo "<hr>";
echo "<p>🏁 <strong>Pulizia completata!</strong></p>";
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
details { margin: 10px 0; }
summary { cursor: pointer; font-weight: bold; }
ul { margin: 10px 0; }
</style>

<p><a href="javascript:history.back()">← Torna indietro</a></p>