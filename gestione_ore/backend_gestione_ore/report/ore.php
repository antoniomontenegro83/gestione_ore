<?php
require_once '../db.php';
header("Content-Type: application/json");

// Se viene richiesta la lista dei dipendenti dalla tabella calcolo_ore
if (isset($_GET['action']) && $_GET['action'] === 'dipendenti') {
    try {
        // Prima verifica se la tabella ha record
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM calcolo_ore");
        $count = $countStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($count['count'] == 0) {
            // Se non ci sono record, prova a caricare i dipendenti dalla tabella dipendenti
            $stmt = $pdo->query("
                SELECT DISTINCT id as employee_id, cognome, nome, qualifica
                FROM dipendenti
                ORDER BY cognome, nome
            ");
        } else {
            // Altrimenti usa la tabella calcolo_ore
            $stmt = $pdo->query("
                SELECT DISTINCT employee_id, cognome, nome, qualifica
                FROM calcolo_ore
                ORDER BY cognome, nome
            ");
        }
        
        $dipendenti = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($dipendenti);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// Se viene richiesta la lista delle sedi dalla tabella calcolo_ore
if (isset($_GET['action']) && $_GET['action'] === 'sedi') {
    try {
        // Prima verifica se la colonna sede esiste
        $checkColumn = $pdo->query("SHOW COLUMNS FROM calcolo_ore LIKE 'sede'");
        $columnExists = $checkColumn->rowCount() > 0;
        
        if (!$columnExists) {
            // Se la colonna non esiste, usa la tabella dipendenti
            $stmt = $pdo->query("
                SELECT DISTINCT sede
                FROM dipendenti
                WHERE sede IS NOT NULL AND sede != ''
                ORDER BY sede
            ");
        } else {
            // Prima verifica se ci sono sedi nella tabella calcolo_ore
            $stmt = $pdo->query("
                SELECT DISTINCT sede
                FROM calcolo_ore
                WHERE sede IS NOT NULL AND sede != ''
            ");
            $sediCalcolo = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($sediCalcolo)) {
                // Se non ci sono sedi, usa la tabella dipendenti
                $stmt = $pdo->query("
                    SELECT DISTINCT sede
                    FROM dipendenti
                    WHERE sede IS NOT NULL AND sede != ''
                    ORDER BY sede
                ");
            } else {
                $stmt = $pdo->query("
                    SELECT DISTINCT sede
                    FROM calcolo_ore
                    WHERE sede IS NOT NULL AND sede != ''
                    ORDER BY sede
                ");
            }
        }
        
        $sedi = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($sedi);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage(), 'details' => 'Errore nel caricamento sedi']);
    }
    exit;
}

// Query principale per i report
try {
    // Ottieni i parametri dalla query string
    $start_date = $_GET['startDate'] ?? null;
    $end_date = $_GET['endDate'] ?? null;
    $employee_id = $_GET['employeeId'] ?? null;
    $sede = $_GET['sede'] ?? null;
    $qualifica = $_GET['qualifica'] ?? null;
    
    // Verifica se la colonna sede esiste
    $checkColumn = $pdo->query("SHOW COLUMNS FROM calcolo_ore LIKE 'sede'");
    $sedeExists = $checkColumn->rowCount() > 0;
    
    // Query diretta sulla tabella calcolo_ore
    $sql = "
        SELECT 
            co.turno_id,
            co.employee_id,
            co.cognome,
            co.nome,
            co.qualifica,
            " . ($sedeExists ? "co.sede," : "d.sede,") . "
            co.entry_date,
            co.entry_time,
            co.exit_date,
            co.exit_time,
            co.feriali_diurne,
            co.feriali_notturne,
            co.festive_diurne,
            co.festive_notturne,
            co.totale_ore,
            1 as calcolato
        FROM calcolo_ore co
        LEFT JOIN dipendenti d ON co.employee_id = d.id
        WHERE 1=1
    ";
    
    // Array dei parametri
    $params = [];
    
    // Aggiungi condizioni in base ai filtri
    if ($start_date) {
        $sql .= " AND co.entry_date >= ?";
        $params[] = $start_date;
    }
    
    if ($end_date) {
        $sql .= " AND co.entry_date <= ?";
        $params[] = $end_date;
    }
    
    if ($employee_id) {
        $sql .= " AND co.employee_id = ?";
        $params[] = $employee_id;
    }
    
    if ($sede) {
        if ($sedeExists) {
            $sql .= " AND co.sede = ?";
        } else {
            $sql .= " AND d.sede = ?";
        }
        $params[] = $sede;
    }
    
    if ($qualifica) {
        $sql .= " AND co.qualifica = ?";
        $params[] = $qualifica;
    }
    
    // Ordinamento
    $sql .= " ORDER BY co.cognome, co.nome, co.entry_date, co.entry_time";
    
    // Esegui la query
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Ottieni i risultati
    $risultati = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Restituisci i risultati come JSON
    echo json_encode($risultati);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'sql' => $sql ?? '']);
}
?>