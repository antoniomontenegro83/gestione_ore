<?php
/**
 * Sistema di Backup Automatico Database MySQL
 * File: backend_gestione_ore/utils/auto_backup.php
 * 
 * Implementa:
 * 1. Backup automatico programmato
 * 2. Backup su richiesta
 * 3. Pulizia backup vecchi
 * 4. Notifiche e log
 */

class DatabaseAutoBackup {
    private $config;
    private $backupDir;
    private $maxBackups;
    private $logFile;
    
    public function __construct() {
        // Configurazione database
        $this->config = [
            'host' => 'localhost',
            'database' => 'gestione_ore',
            'username' => 'root',
            'password' => '',
            'charset' => 'utf8mb4'
        ];
        
        // Configurazione backup
        $this->backupDir = __DIR__ . '/backups/';
        $this->maxBackups = 30; // Mantieni 30 backup
        $this->logFile = __DIR__ . '/backup_log.txt';
        
        // Crea directory se non esiste
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }
    
    /**
     * Esegue backup automatico del database
     */
    public function executeBackup($type = 'manual') {
        try {
            $timestamp = date('Y-m-d_H-i-s');
            $filename = "backup_{$type}_{$timestamp}.sql";
            $filepath = $this->backupDir . $filename;
            
            // Comando mysqldump
            $command = sprintf(
                'mysqldump -h %s -u %s %s %s > %s',
                escapeshellarg($this->config['host']),
                escapeshellarg($this->config['username']),
                !empty($this->config['password']) ? '-p' . escapeshellarg($this->config['password']) : '',
                escapeshellarg($this->config['database']),
                escapeshellarg($filepath)
            );
            
            // Esegui backup
            exec($command . ' 2>&1', $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($filepath)) {
                $size = filesize($filepath);
                $this->logBackup($filename, $size, $type, 'SUCCESS');
                
                // Pulisci backup vecchi
                $this->cleanOldBackups();
                
                return [
                    'success' => true,
                    'filename' => $filename,
                    'size' => $this->formatBytes($size),
                    'path' => $filepath,
                    'timestamp' => $timestamp
                ];
            } else {
                throw new Exception('Errore durante il backup: ' . implode("\n", $output));
            }
            
        } catch (Exception $e) {
            $this->logBackup($filename ?? 'unknown', 0, $type, 'ERROR: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Programma backup automatico tramite cron
     */
    public function setupCronJob() {
        $cronCommand = "0 2 * * * php " . __DIR__ . "/cron_backup.php >> " . $this->logFile . " 2>&1";
        
        return [
            'cron_command' => $cronCommand,
            'instructions' => [
                'Linux/Mac: Aggiungi al crontab con "crontab -e"',
                'Windows: Usa Task Scheduler per eseguire il comando alle 2:00',
                'Hosting: Configura cron job dal pannello di controllo'
            ]
        ];
    }
    
    /**
     * Backup programmato (chiamato da cron)
     */
    public function scheduledBackup() {
        $this->logMessage("Avvio backup programmato");
        
        $result = $this->executeBackup('scheduled');
        
        if ($result['success']) {
            $this->logMessage("Backup programmato completato: " . $result['filename']);
            
            // Opzionale: invia notifica email
            $this->sendNotification($result);
        } else {
            $this->logMessage("ERRORE backup programmato: " . $result['error']);
        }
        
        return $result;
    }
    
    /**
     * Backup prima di operazioni critiche
     */
    public function preOperationBackup($operation) {
        $this->logMessage("Backup pre-operazione: $operation");
        
        return $this->executeBackup("pre_$operation");
    }
    
    /**
     * Pulisce backup vecchi
     */
    private function cleanOldBackups() {
        $backups = glob($this->backupDir . 'backup_*.sql');
        
        if (count($backups) > $this->maxBackups) {
            // Ordina per data di modifica (più vecchi prima)
            usort($backups, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            
            $toDelete = array_slice($backups, 0, count($backups) - $this->maxBackups);
            
            foreach ($toDelete as $file) {
                if (unlink($file)) {
                    $this->logMessage("Eliminato backup vecchio: " . basename($file));
                }
            }
        }
    }
    
    /**
     * Lista backup disponibili
     */
    public function getBackupList() {
        $backups = glob($this->backupDir . 'backup_*.sql');
        $list = [];
        
        foreach ($backups as $file) {
            $list[] = [
                'filename' => basename($file),
                'size' => $this->formatBytes(filesize($file)),
                'date' => date('d/m/Y H:i:s', filemtime($file)),
                'type' => $this->extractBackupType(basename($file)),
                'path' => $file
            ];
        }
        
        // Ordina per data (più recenti prima)
        usort($list, function($a, $b) {
            return filemtime($this->backupDir . $b['filename']) - filemtime($this->backupDir . $a['filename']);
        });
        
        return $list;
    }
    
    /**
     * Stato ultimo backup
     */
    public function getLastBackupStatus() {
        $backups = $this->getBackupList();
        
        if (empty($backups)) {
            return [
                'status' => 'warning',
                'message' => 'Nessun backup disponibile',
                'last_backup' => null
            ];
        }
        
        $lastBackup = $backups[0];
        $lastBackupTime = filemtime($this->backupDir . $lastBackup['filename']);
        $hoursAgo = floor((time() - $lastBackupTime) / 3600);
        
        if ($hoursAgo < 24) {
            $status = 'success';
            $message = "Ultimo backup: {$hoursAgo}h fa";
        } elseif ($hoursAgo < 72) {
            $status = 'warning';
            $message = "Ultimo backup: " . floor($hoursAgo/24) . "g fa";
        } else {
            $status = 'danger';
            $message = "Backup troppo vecchio: " . floor($hoursAgo/24) . "g fa";
        }
        
        return [
            'status' => $status,
            'message' => $message,
            'last_backup' => $lastBackup,
            'hours_ago' => $hoursAgo
        ];
    }
    
    /**
     * Download backup
     */
    public function downloadBackup($filename) {
        $filepath = $this->backupDir . $filename;
        
        if (!file_exists($filepath)) {
            throw new Exception('File backup non trovato');
        }
        
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=' . $filename);
        header('Content-Length: ' . filesize($filepath));
        readfile($filepath);
        exit;
    }
    
    /**
     * Ripristina database da backup
     */
    public function restoreBackup($filename) {
        $filepath = $this->backupDir . $filename;
        
        if (!file_exists($filepath)) {
            throw new Exception('File backup non trovato');
        }
        
        try {
            // Comando mysql per ripristino
            $command = sprintf(
                'mysql -h %s -u %s %s %s < %s',
                escapeshellarg($this->config['host']),
                escapeshellarg($this->config['username']),
                !empty($this->config['password']) ? '-p' . escapeshellarg($this->config['password']) : '',
                escapeshellarg($this->config['database']),
                escapeshellarg($filepath)
            );
            
            exec($command . ' 2>&1', $output, $returnCode);
            
            if ($returnCode === 0) {
                $this->logMessage("Database ripristinato da: $filename");
                return ['success' => true, 'message' => 'Database ripristinato con successo'];
            } else {
                throw new Exception('Errore durante il ripristino: ' . implode("\n", $output));
            }
            
        } catch (Exception $e) {
            $this->logMessage("ERRORE ripristino da $filename: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    // ===== METODI HELPER =====
    
    private function logBackup($filename, $size, $type, $status) {
        $message = sprintf(
            "[%s] BACKUP %s - File: %s, Size: %s, Type: %s",
            date('Y-m-d H:i:s'),
            $status,
            $filename,
            $this->formatBytes($size),
            $type
        );
        $this->logMessage($message);
    }
    
    private function logMessage($message) {
        $logEntry = "[" . date('Y-m-d H:i:s') . "] " . $message . "\n";
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    private function formatBytes($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
    
    private function extractBackupType($filename) {
        if (preg_match('/backup_([^_]+)_/', $filename, $matches)) {
            return $matches[1];
        }
        return 'unknown';
    }
    
    private function sendNotification($backupResult) {
        // Implementa invio email/notifica se necessario
        // mail($to, $subject, $message);
    }
}

// ===== UTILIZZO =====

// Se chiamato direttamente, esegui backup
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    $backup = new DatabaseAutoBackup();
    
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'backup':
                $result = $backup->executeBackup($_GET['type'] ?? 'manual');
                header('Content-Type: application/json');
                echo json_encode($result);
                break;
                
            case 'status':
                $status = $backup->getLastBackupStatus();
                header('Content-Type: application/json');
                echo json_encode($status);
                break;
                
            case 'list':
                $list = $backup->getBackupList();
                header('Content-Type: application/json');
                echo json_encode($list);
                break;
                
            case 'download':
                if (isset($_GET['file'])) {
                    $backup->downloadBackup($_GET['file']);
                }
                break;
                
            case 'cron_setup':
                $cronInfo = $backup->setupCronJob();
                header('Content-Type: application/json');
                echo json_encode($cronInfo);
                break;
        }
    }
}
?>