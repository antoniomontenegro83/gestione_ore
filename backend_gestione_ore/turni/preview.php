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

// Previeni la visualizzazione degli errori
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Avvia il buffer di output
ob_start();

header("Content-Type: application/json");
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Verifica il metodo della richiesta
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metodo non consentito']);
    exit;
}

// Leggi i dati dalla richiesta
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Verifica validità del JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Input JSON non valido']);
    exit;
}

// Estrai i dati
$entry_date = isset($data['entry_date']) ? $data['entry_date'] : null;
$entry_time = isset($data['entry_time']) ? $data['entry_time'] : null;
$exit_date = isset($data['exit_date']) ? $data['exit_date'] : null;
$exit_time = isset($data['exit_time']) ? $data['exit_time'] : null;

// Validazione
if (!$entry_date || !$entry_time || !$exit_date || !$exit_time) {
    ob_clean();
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => 'Tutti i campi data/ora sono obbligatori'
    ]);
    exit;
}

try {
    // Include i file necessari
    require_once '../db.php';
    require_once '../utilities/calculator.php';
    
    // Crea gli oggetti DateTime
    $entryDateTime = new DateTime("$entry_date $entry_time");
    $exitDateTime = new DateTime("$exit_date $exit_time");
    
    // Verifica che l'uscita sia dopo l'ingresso
    if ($exitDateTime <= $entryDateTime) {
        ob_clean();
        echo json_encode([
            'success' => false, 
            'error' => 'La data/ora di uscita deve essere successiva a quella di ingresso'
        ]);
        exit;
    }
    
    // Calcola le ore
    $ore = calcolaOreLavorate($entry_date, $entry_time, $exit_date, $exit_time);
    
    // Calcola il totale
    $totale = $ore['feriali_diurne'] + $ore['feriali_notturne'] + 
              $ore['festive_diurne'] + $ore['festive_notturne'];
    
    // Calcola la durata totale
    $intervallo = $entryDateTime->diff($exitDateTime);
    $ore_totali = ($intervallo->days * 24) + $intervallo->h + ($intervallo->i / 60);
    
    // Verifica giorni festivi
    $inizio_festivo = isFestivo($entry_date);
    $fine_festivo = isFestivo($exit_date);
    
    // Costruisci la risposta con valori numerici
    $response = [
        'success' => true,
        'calcolo' => [
            'ore' => [
                'feriali_diurne' => (float)$ore['feriali_diurne'],
                'feriali_notturne' => (float)$ore['feriali_notturne'],
                'festive_diurne' => (float)$ore['festive_diurne'],
                'festive_notturne' => (float)$ore['festive_notturne']
            ],
            'totale' => (float)$totale,
            'info_aggiuntive' => [
                'ore_totali_numeric' => (float)$ore_totali,
                'giorno_inizio_festivo' => $inizio_festivo,
                'giorno_fine_festivo' => $fine_festivo,
                'giorni_attraversati' => $intervallo->days
            ]
        ]
    ];
    
    // Aggiungi warning se necessario
    if ($totale > 24) {
        $response['calcolo']['warning'] = 'Attenzione: Il turno supera le 24 ore';
    }
    
    // Pulisci il buffer e invia la risposta
    ob_clean();
    echo json_encode($response);
    exit;
    
} catch (Exception $e) {
    // Gestisci eventuali errori
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Errore: ' . $e->getMessage()
    ]);
    exit;
}

// Pulisci il buffer finale
ob_end_clean();
?>