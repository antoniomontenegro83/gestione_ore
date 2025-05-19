<?php
/**
 * pdf.php - File principale per la generazione dei report PDF
 */

// Include le funzioni di supporto e configurazioni
require_once '../db.php';
require_once '../utilities/calculator.php';
require_once __DIR__ . '/pdf_helpers.php';  // Percorso corretto usando __DIR__

// Verifica che sia una richiesta GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Metodo non consentito. Utilizzare GET per i report PDF.",
        "file" => __FILE__
    ]);
    exit;
}

// Ottieni e verifica i parametri
$startDate = $_GET['startDate'] ?? null;
$endDate = $_GET['endDate'] ?? null;
$employeeId = $_GET['employeeId'] ?? null;
$sede = $_GET['sede'] ?? null;
$action = $_GET['action'] ?? 'download';

// Validazione con risposta JSON per compatibilità
if (!$startDate || !$endDate) {
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Date obbligatorie",
        "message" => "Specificare startDate e endDate come parametri GET"
    ]);
    exit;
}

try {
    // Ottieni i dati per il report dalla funzione in pdf_helpers.php
    $reportData = getReportData($pdo, $startDate, $endDate, $employeeId, $sede);
    
    // Estrai i dati necessari
    $turni = $reportData['turni'];
    $sommario = $reportData['sommario'];
    $nomeFile = $reportData['nomeFile'];
    $titoloReport = $reportData['titoloReport'];
    $sottotitoloReport = $reportData['sottotitoloReport'] ?? '';
    
    // Se non ci sono risultati
    if (count($turni) === 0) {
        header("Content-Type: application/json");
        echo json_encode([
            "error" => "Nessun dato disponibile",
            "message" => "Nessun turno trovato per il periodo selezionato"
        ]);
        exit;
    }
    
    // Carica e genera il template HTML
    include __DIR__ . '/pdf_template.php';
    
} catch (PDOException $e) {
    error_log("Errore database in pdf.php: " . $e->getMessage());
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Errore database",
        "message" => $e->getMessage()
    ]);
    exit;
} catch (Exception $e) {
    error_log("Errore generale in pdf.php: " . $e->getMessage());
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Errore generale",
        "message" => $e->getMessage()
    ]);
    exit;
}
?>