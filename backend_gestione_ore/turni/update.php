<?php
// IMPORTANTE: session_start() deve essere la prima cosa
session_start();

require_once '../db.php';
require_once '../calcolo/calcola-ore.php';  // Includiamo il file per i calcoli

header("Content-Type: application/json");

// Debug sessione
error_log("Update.php - Session ID: " . session_id());
error_log("Update.php - Session data: " . print_r($_SESSION, true));

// Verifica dell'autorizzazione
if (!isset($_SESSION['user'])) {
    error_log("Update.php - No user in session");
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Non autorizzato - Nessun utente in sessione"]);
    exit;
}

$userRole = $_SESSION['user']['ruolo'] ?? '';
error_log("Update.php - User role: " . $userRole);

if ($userRole !== 'admin' && $userRole !== 'superadmin') {
    error_log("Update.php - Unauthorized role: " . $userRole);
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Non autorizzato - Ruolo non valido: " . $userRole]);
    exit;
}

// Legge i dati inviati in formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;
$ingresso = $data["ingresso"] ?? null;
$uscita = $data["uscita"] ?? null;
$sede = $data["sede"] ?? null;

error_log("Update.php - Request data: " . print_r($data, true));

if ($id && $ingresso && $uscita) {
    // Estrai date e orari dai valori datetime
    $entry_date = substr($ingresso, 0, 10);
    $entry_time = substr($ingresso, 11, 5) . ':00'; // Aggiungi i secondi
    $exit_date = substr($uscita, 0, 10);
    $exit_time = substr($uscita, 11, 5) . ':00'; // Aggiungi i secondi

    // Verifica che la data/ora di uscita sia successiva alla data/ora di ingresso
    $entry_datetime = strtotime($entry_date . ' ' . $entry_time);
    $exit_datetime = strtotime($exit_date . ' ' . $exit_time);
    
    if ($exit_datetime <= $entry_datetime) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "La data/ora di uscita deve essere successiva alla data/ora di ingresso"
        ]);
        exit;
    }
    
    // Verifica che il turno non superi le 24 ore
    $diff_hours = ($exit_datetime - $entry_datetime) / 3600;
    if ($diff_hours > 24) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "Un turno non può durare più di 24 ore"
        ]);
        exit;
    }

    // Inizia una transazione
    $pdo->beginTransaction();
    
    try {
        // Prima ottieni i dati attuali del turno per il log
        $stmtSelect = $pdo->prepare("
            SELECT t.*, d.cognome, d.nome 
            FROM turni t 
            LEFT JOIN dipendenti d ON t.employee_id = d.id 
            WHERE t.id = ?
        ");
        $stmtSelect->execute([$id]);
        $turnoOld = $stmtSelect->fetch(PDO::FETCH_ASSOC);
        
        if (!$turnoOld) {
            throw new Exception("Turno non trovato");
        }
        
        // Elimina prima il calcolo esistente per forzare il ricalcolo
        $deleteStmt = $pdo->prepare("DELETE FROM calcolo_ore WHERE turno_id = ?");
        $deleteStmt->execute([$id]);
        
        // Aggiorna il turno nella tabella turni includendo la sede
        $stmt = $pdo->prepare("
            UPDATE turni 
            SET entry_date = ?, entry_time = ?, exit_date = ?, exit_time = ?, sede = ? 
            WHERE id = ?
        ");
        
        $stmt->execute([$entry_date, $entry_time, $exit_date, $exit_time, $sede, $id]);
        
        // Ricalcola automaticamente le ore per questo turno
        $risultatoCalcolo = calcolaESalvaOreTurno($id);
        
        // Log dell'operazione (opzionale)
        $logStmt = $pdo->prepare("
            INSERT INTO log_modifiche (user_id, turno_id, dipendente, 
                old_entry_date, old_entry_time, old_exit_date, old_exit_time, old_sede,
                new_entry_date, new_entry_time, new_exit_date, new_exit_time, new_sede,
                modified_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        // Prova a inserire il log, ma non fallire se la tabella non esiste
        try {
            $logStmt->execute([
                $_SESSION['user']['id'],
                $id,
                $turnoOld['cognome'] . ' ' . $turnoOld['nome'],
                $turnoOld['entry_date'],
                $turnoOld['entry_time'],
                $turnoOld['exit_date'],
                $turnoOld['exit_time'],
                $turnoOld['sede'],
                $entry_date,
                $entry_time,
                $exit_date,
                $exit_time,
                $sede
            ]);
        } catch (Exception $logException) {
            // Ignora errori di log
            error_log("Log error: " . $logException->getMessage());
        }
        
        // Commit della transazione
        $pdo->commit();
        
        echo json_encode([
            "success" => true,
            "calcolo_ore" => $risultatoCalcolo,
            "message" => "Turno modificato e ore ricalcolate con successo"
        ]);
        
    } catch (Exception $e) {
        // Se c'è un errore, annulla la transazione
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "error" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "error" => "Dati incompleti"
    ]);
}
?>