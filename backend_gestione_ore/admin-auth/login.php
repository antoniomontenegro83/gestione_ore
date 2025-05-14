<?php
session_start();
require_once '../db.php';

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);

if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
    if (password_verify($password, $user['password']) && $user['ruolo'] === 'superadmin') {
        $_SESSION['user'] = [
            "id" => $user['id'],
            "username" => $user['username'],
            "ruolo" => $user['ruolo']
        ];
        echo json_encode(["success" => true, "user" => $_SESSION['user']]);
    } else {
        echo json_encode(["success" => false, "message" => "Accesso negato"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Utente non trovato"]);
}
?>
