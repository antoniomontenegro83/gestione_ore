<?php
// ============================================
// PROTEZIONE PER FILE CHE RICHIEDONO ADMIN/SUPERADMIN
// Aggiungi all'inizio di: dipendenti/*, turni/*, sedi/*, qualifiche/*
// ============================================
session_start();

// Verifica autenticazione
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Accesso riservato - Login richiesto"]);
    exit;
}

// Verifica ruolo admin o superadmin
$userRole = $_SESSION['user']['ruolo'] ?? '';
if ($userRole !== 'admin' && $userRole !== 'superadmin') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Accesso riservato agli amministratori"]);
    exit;
}

require_once '../db.php';
header("Content-Type: application/json; charset=utf-8");

try {
    // Query per ottenere i turni con le informazioni dei dipendenti
    $query = "
        SELECT t.id, t.entry_date, t.entry_time, t.exit_date, t.exit_time,
               d.cognome, d.nome, d.qualifica, d.sede
        FROM turni t
        LEFT JOIN dipendenti d ON t.employee_id = d.id
        ORDER BY t.entry_date DESC, t.entry_time DESC
    ";

    // Verifica se esiste la vista turni_con_dettagli
    $checkView = $pdo->query("SHOW TABLES LIKE 'turni_con_dettagli'");
    if ($checkView->rowCount() > 0) {
        $query = "
            SELECT 
                id,
                employee_id,
                entry_date,
                entry_time,
                exit_date,
                exit_time,
                turno_sede,
                cognome,
                nome,
                qualifica,
                sede,
                feriali_diurne,
                feriali_notturne,
                festive_diurne,
                festive_notturne,
                totale_ore,
                calcolato,
                durata_ore,
                durata_minuti,
                totale_ore_formatted
            FROM turni_con_dettagli
            ORDER BY entry_date DESC, entry_time DESC
            LIMIT 100
        ";
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Pulisci i dati per garantire che siano JSON-safe
    foreach ($turni as &$turno) {
        foreach ($turno as $key => &$value) {
            if ($value !== null) {
                // Converti eventuali caratteri speciali
                if (is_string($value)) {
                    // Gestisci encoding UTF-8
                    $value = mb_convert_encoding($value, 'UTF-8', 'auto');
                    // Rimuovi caratteri di controllo
                    $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value);
                }
                
                // Se è un campo numerico con virgola, sostituiscila con punto
                if (in_array($key, ['feriali_diurne', 'feriali_notturne', 'festive_diurne', 
                                   'festive_notturne', 'totale_ore', 'totale_ore_formatted'])) {
                    if (is_string($value)) {
                        $value = str_replace(',', '.', $value);
                    }
                }
            }
        }
    }
    
    // Usa json_encode con opzioni per gestire caratteri speciali
    $json = json_encode($turni, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK | JSON_PARTIAL_OUTPUT_ON_ERROR);
    
    if ($json === false) {
        // Se json_encode fallisce, prova a identificare il problema
        $error = json_last_error_msg();
        http_response_code(500);
        echo json_encode(['error' => 'Errore nella codifica JSON: ' . $error]);
        exit;
    }
    
    echo $json;
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>