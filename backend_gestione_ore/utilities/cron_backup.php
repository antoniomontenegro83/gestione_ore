<?php
/**
 * File per il backup automatico tramite cron
 * File: backend_gestione_ore/utils/cron_backup.php
 * 
 * Esegue backup programmato del database
 */

require_once 'auto_backup.php';

echo "[" . date('Y-m-d H:i:s') . "] Avvio backup programmato\n";

$backup = new DatabaseAutoBackup();
$result = $backup->scheduledBackup();

if ($result['success']) {
    echo "[" . date('Y-m-d H:i:s') . "] Backup completato: " . $result['filename'] . "\n";
} else {
    echo "[" . date('Y-m-d H:i:s') . "] ERRORE: " . $result['error'] . "\n";
}

echo "[" . date('Y-m-d H:i:s') . "] Fine processo backup\n";
?>