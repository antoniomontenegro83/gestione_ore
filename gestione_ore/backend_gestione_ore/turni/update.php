<?php
session_start();
header("Content-Type: application/json");
require_once '../db.php';

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

    // NUOVO: Verifica che la data/ora di uscita sia successiva alla data/ora di ingresso
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
    
    // NUOVO: Verifica durata minima del turno (30 minuti)
    $diff_minutes = ($exit_datetime - $entry_datetime) / 60;
    if ($diff_minutes < 30) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "La durata del turno deve essere di almeno 30 minuti"
        ]);
        exit;
    }
    
    // NUOVO: Verifica che non esista già un turno identico (escludendo il turno corrente)
    $check_stmt = $pdo->prepare("SELECT COUNT(*) FROM turni 
                                 WHERE employee_id = (SELECT employee_id FROM turni WHERE id = ?)
                                 AND entry_date = ? 
                                 AND entry_time = ? 
                                 AND exit_date = ? 
                                 AND exit_time = ?
                                 AND id != ?");
                                 
    $check_stmt->execute([
        $id,
        $entry_date, 
        $entry_time,
        $exit_date,
        $exit_time,
        $id
    ]);
    
    if ($check_stmt->fetchColumn() > 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "Esiste già un turno identico per questo dipendente"
        ]);
        exit;
    }

    try {
        // Aggiorna il turno nella tabella turni
        $stmt = $pdo->prepare("UPDATE turni SET entry_date = ?, entry_time = ?, exit_date = ?, exit_time = ? WHERE id = ?");
        $stmt->execute([$entry_date, $entry_time, $exit_date, $exit_time, $id]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Dati incompleti"]);
}
?>