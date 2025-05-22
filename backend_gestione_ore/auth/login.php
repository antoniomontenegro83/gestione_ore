<?php
// IMPORTANTE: session_start() deve essere la prima cosa
session_start();

require_once '../db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// Log per debug
error_log("Login attempt for: " . $username);
error_log("Session ID: " . session_id());

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);

if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
    if (password_verify($password, $user['password'])) {
        // Imposta la sessione PHP
        $_SESSION['user'] = [
            "id" => $user['id'],
            "username" => $user['username'],
            "ruolo" => $user['ruolo']
        ];
        
        // Salva immediatamente la sessione
        session_write_close();
        session_start();
        
        // Log per debug
        error_log("Login successful for: " . $username . " with role: " . $user['ruolo']);
        error_log("Session data: " . print_r($_SESSION, true));
        
        // Determina dove reindirizzare in base al ruolo
        $redirect = "dashboard.html";
        switch ($user['ruolo']) {
            case 'superadmin':
                $redirect = "users-privileges.html";
                break;
            case 'admin':
                $redirect = "management-turni.html";
                break;
            default:
                $redirect = "dashboard.html";
        }
        
        echo json_encode([
            "success" => true, 
            "user" => $_SESSION['user'],
            "redirect" => $redirect,
            "session_id" => session_id()
        ]);
    } else {
        error_log("Wrong password for: " . $username);
        echo json_encode(["success" => false, "message" => "Password errata"]);
    }
} else {
    error_log("User not found: " . $username);
    echo json_encode(["success" => false, "message" => "Utente non trovato"]);
}
?>