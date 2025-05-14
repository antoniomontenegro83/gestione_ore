<?php
session_start();
header("Content-Type: application/json");

$response = [
    'session_exists' => !empty($_SESSION),
    'session_user' => isset($_SESSION['user']) ? $_SESSION['user'] : null,
    'session_id' => session_id()
];

echo json_encode($response);
?>