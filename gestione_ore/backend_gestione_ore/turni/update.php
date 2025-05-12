<?php
session_start();
require_once '../db.php';
require_once '../calcolo/calcola-ore.php';  // Includiamo il file per i calcoli

header("Content-Type: application/json");

// Verifica dell'autorizzazione (se l'utente non è admin, non può modificare turni)
if (!isset($_SESSION['user']) || $_SESSION['user']['ruolo'] !== 'admin') {
  http_response_code(403);
  echo json_encode(["error" => "Non autorizzato"]);
  exit;
}

// Legge i dati inviati in formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;
$ingresso = $data["ingresso"] ?? null;
$uscita = $data["uscita"] ?? null;

if ($id && $ingresso && $uscita) {
    $entry_date = substr($ingresso, 0, 10);
    $entry_time = substr($ingresso, 11, 5);
    $exit_date = substr($uscita, 0, 10);
    $exit_time = substr($uscita, 11, 5);

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

    // Inizia una transazione
    $pdo->beginTransaction();
    
    try {
        // Aggiorna il turno nella tabella turni
        $stmt = $pdo->prepare("
            UPDATE turni 
            SET entry_date = ?, entry_time = ?, exit_date = ?, exit_time = ? 
            WHERE id = ?
        ");
        
        $stmt->execute([$entry_date, $entry_time, $exit_date, $exit_time, $id]);
        
        // Ricalcola automaticamente le ore per questo turno
        $risultatoCalcolo = calcolaESalvaOreTurno($id);
        
        // Commit della transazione
        $pdo->commit();
        
        echo json_encode([
            "success" => true,
            "calcolo_ore" => $risultatoCalcolo
        ]);
        
    } catch (Exception $e) {
        // Se c'è un errore, annulla la transazione
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Dati incompleti"]);
}
?>