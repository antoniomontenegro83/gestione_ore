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

// File di diagnostica più completo
header("Content-Type: text/html; charset=UTF-8");

echo "<h2>Diagnostica Turni</h2>";

// Verifica file
echo "<h3>Verifica File</h3>";
$files_to_check = [
    'db.php' => '../db.php',
    'calcola-ore.php' => '../calcolo/calcola-ore.php',
    'add.php' => 'add.php'
];

foreach ($files_to_check as $name => $path) {
    $exists = file_exists($path);
    $readable = is_readable($path);
    echo "<p>$name: " . ($exists ? "✓ Esiste" : "✗ Non esiste") . 
         " | " . ($readable ? "✓ Leggibile" : "✗ Non leggibile") . "</p>";
}

// Test POST data
echo "<h3>Test Ricezione Dati POST</h3>";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<p>Dati POST ricevuti:</p>";
    echo "<pre>";
    echo "POST data: " . print_r($_POST, true) . "\n";
    echo "Raw input: " . file_get_contents("php://input") . "\n";
    echo "</pre>";
} else {
    echo "<p>Metodo: " . $_SERVER['REQUEST_METHOD'] . "</p>";
}

// Verifica PHP JSON
echo "<h3>Supporto JSON</h3>";
echo "<p>json_encode: " . (function_exists('json_encode') ? "✓ Disponibile" : "✗ Non disponibile") . "</p>";
echo "<p>json_decode: " . (function_exists('json_decode') ? "✓ Disponibile" : "✗ Non disponibile") . "</p>";

// Test Database
echo "<h3>Test Database</h3>";
try {
    require_once '../db.php';
    echo "<p>✓ Connessione al database riuscita</p>";
    
    // Verifica tabella turni
    $stmt = $pdo->query("SHOW COLUMNS FROM turni");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<p>Colonne tabella turni:</p>";
    echo "<pre>" . print_r($columns, true) . "</pre>";
} catch (Exception $e) {
    echo "<p>✗ Errore database: " . $e->getMessage() . "</p>";
}

// Percorsi
echo "<h3>Percorsi</h3>";
echo "<p>Current directory: " . __DIR__ . "</p>";
echo "<p>Document root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Script name: " . $_SERVER['SCRIPT_NAME'] . "</p>";
?>