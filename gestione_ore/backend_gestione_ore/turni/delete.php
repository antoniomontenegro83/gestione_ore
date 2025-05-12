<?php
session_start();
require_once '../db.php';

header("Content-Type: application/json");

// Verifica dell'autorizzazione
if (!isset($_SESSION['user']) || $_SESSION['user']['ruolo'] !== 'admin') {
  http_response_code(403);
  echo json_encode(["error" => "Non autorizzato"]);
  exit;
}

// Ottieni l'ID del turno da eliminare
$id = $_GET["id"] ?? null;

if ($id) {
    try {
        // Inizia una transazione
        $pdo->beginTransaction();
        
        // Elimina prima il calcolo delle ore (se esiste)
        $stmtCalcolo = $pdo->prepare("DELETE FROM calcolo_ore WHERE turno_id = ?");
        $stmtCalcolo->execute([$id]);
        
        // Poi elimina il turno
        $stmt = $pdo->prepare("DELETE FROM turni WHERE id = ?");
        $stmt->execute([$id]);
        
        // Commit della transazione
        $pdo->commit();
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        // Rollback in caso di errore
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "ID mancante"]);
}
?>