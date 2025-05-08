<?php
session_start();
header("Content-Type: application/json");
require_once '../db.php';

// Verifica dell'autorizzazione (se l'utente non è admin, non può eliminare turni)
if (!isset($_SESSION['user']) || $_SESSION['user']['ruolo'] !== 'admin') {
  http_response_code(403);
  echo json_encode(["error" => "Non autorizzato"]);
  exit;
}

// Ottieni l'ID del turno da eliminare
$id = $_GET["id"] ?? null;

if ($id) {
    try {
        // Elimina il turno dalla tabella turni
        $stmt = $pdo->prepare("DELETE FROM turni WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "ID mancante"]);
}
?>