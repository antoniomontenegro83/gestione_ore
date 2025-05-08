<?php
require_once '../db.php';
header("Content-Type: application/json");

try {
    $data = json_decode(file_get_contents("php://input"), true);
    // Utilizza la tabella dipendenti (con 'd' minuscola)
    $stmt = $pdo->prepare("UPDATE dipendenti SET cognome = ?, nome = ?, qualifica = ?, sede = ? WHERE id = ?");
    $stmt->execute([$data['cognome'], $data['nome'], $data['qualifica'], $data['sede'], $data['id']]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>