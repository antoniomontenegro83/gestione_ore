<?php
/**
 * create.php - API per creare backup del database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Configurazione database (MODIFICA QUESTI VALORI)
    $host = 'localhost';
    $username = 'root';
    $password = '';  // Inserisci la tua password MySQL qui
    $database = 'gestione_ore';
    
    // Nome file backup
    $timestamp = date('Y-m-d_H-i-s');
    $filename = "backup_gestione_ore_{$timestamp}.sql";
    
    // Directory per i backup
    $backupDir = __DIR__ . "/downloads";
    $filepath = $backupDir . "/" . $filename;
    
    // Crea directory se non esiste
    if (!is_dir($backupDir)) {
        if (!mkdir($backupDir, 0755, true)) {
            throw new Exception('Impossibile creare la directory di backup');
        }
    }
    
    // Percorsi possibili per mysqldump su Windows
    $possiblePaths = [
        'C:\\xampp\\mysql\\bin\\mysqldump.exe',
        'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe', 
        'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe',
        'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
        'mysqldump' // Se è nel PATH di sistema
    ];
    
    $mysqldumpPath = null;
    foreach ($possiblePaths as $path) {
        if (file_exists($path) || $path === 'mysqldump') {
            $mysqldumpPath = $path;
            break;
        }
    }
    
    if (!$mysqldumpPath) {
        throw new Exception('mysqldump non trovato. Verifica che MySQL sia installato correttamente.');
    }
    
    // Costruisci il comando mysqldump
    $command = "\"{$mysqldumpPath}\" --host={$host} --user={$username}";
    
    if (!empty($password)) {
        $command .= " --password=\"{$password}\"";
    }
    
    // Opzioni aggiuntive per un backup completo
    $command .= " --single-transaction --routines --triggers --lock-tables=false";
    $command .= " {$database}";
    
    // Esegui il comando e salva l'output
    $output = shell_exec($command);
    
    if ($output === null) {
        throw new Exception('Errore durante l\'esecuzione di mysqldump');
    }
    
    // Salva il backup su file
    if (file_put_contents($filepath, $output) === false) {
        throw new Exception('Errore durante il salvataggio del file backup');
    }
    
    // Verifica che il file sia stato creato correttamente
    if (!file_exists($filepath) || filesize($filepath) == 0) {
        throw new Exception('Il file di backup è vuoto o non è stato creato');
    }
    
    // Calcola dimensione file in formato leggibile
    $filesize = filesize($filepath);
    $filesizeFormatted = formatBytes($filesize);
    
    // URL relativo per il download
    $downloadUrl = "backend_gestione_ore/backup/downloads/{$filename}";
    
    // Pulisci backup vecchi (mantieni solo gli ultimi 10)
    cleanOldBackups($backupDir);
    
    // Log del backup
    logBackup($filename, $filesize);
    
    // Risposta di successo
    echo json_encode([
        'success' => true,
        'message' => 'Backup creato con successo',
        'filename' => $filename,
        'download_url' => $downloadUrl,
        'size' => $filesize,
        'size_formatted' => $filesizeFormatted,
        'timestamp' => $timestamp,
        'database' => $database
    ]);
    
} catch (Exception $e) {
    // Log dell'errore
    error_log("Backup Error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Formatta la dimensione del file in formato leggibile
 */
function formatBytes($size, $precision = 2) {
    $base = log($size, 1024);
    $suffixes = array('B', 'KB', 'MB', 'GB', 'TB');
    return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
}

/**
 * Pulisce i backup vecchi mantenendo solo i più recenti
 */
function cleanOldBackups($backupDir, $keepCount = 10) {
    try {
        $files = glob($backupDir . "/backup_gestione_ore_*.sql");
        
        if (count($files) > $keepCount) {
            // Ordina per data di modifica (più vecchi prima)
            usort($files, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            
            // Elimina i file più vecchi
            $filesToDelete = array_slice($files, 0, count($files) - $keepCount);
            foreach ($filesToDelete as $file) {
                if (file_exists($file)) {
                    unlink($file);
                }
            }
        }
    } catch (Exception $e) {
        // Non bloccare il backup se la pulizia fallisce
        error_log("Cleanup Error: " . $e->getMessage());
    }
}

/**
 * Registra il backup nel log
 */
function logBackup($filename, $filesize) {
    try {
        $logFile = __DIR__ . "/backup.log";
        $logEntry = date('Y-m-d H:i:s') . " - Backup creato: {$filename} (" . formatBytes($filesize) . ")\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    } catch (Exception $e) {
        // Non bloccare il backup se il log fallisce
        error_log("Log Error: " . $e->getMessage());
    }
}
?>