<?php
/**
 * pdf.php - Report PDF modularizzato
 * 
 * Questo file gestisce la generazione del report PDF,
 * utilizzando le funzioni e configurazioni dai file modulari.
 */

// Verifica metodo di richiesta
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Metodo non consentito. Utilizzare GET per i report PDF.",
        "file" => __FILE__
    ]);
    exit;
}

// Inclusione file necessari
require_once '../db.php';

// Verifica disponibilità TCPDF
if (file_exists('../vendor/autoload.php')) {
    require_once '../vendor/autoload.php';
} else if (file_exists('../lib/tcpdf/tcpdf.php')) {
    require_once '../lib/tcpdf/tcpdf.php';
} else {
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Libreria TCPDF non trovata",
        "message" => "Installare TCPDF tramite Composer o manualmente"
    ]);
    exit;
}

// Inclusione dei file modulari
require_once 'pdf_config.php';   // Configurazioni
require_once 'pdf_functions.php'; // Funzioni

// Parametri di filtro
$startDate = $_GET['startDate'] ?? null;
$endDate = $_GET['endDate'] ?? null;
$employeeId = $_GET['employeeId'] ?? null;
$sede = $_GET['sede'] ?? null;
$qualifica = $_GET['qualifica'] ?? null;

// Validazione parametri essenziali
if (!$startDate || !$endDate) {
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Date obbligatorie",
        "message" => "Specificare startDate e endDate come parametri GET"
    ]);
    exit;
}

try {
    // Prepara la configurazione
    $config = [
        'PDF_COLORS' => $PDF_COLORS,
        'PDF_FONT_SIZES' => $PDF_FONT_SIZES,
        'PDF_DIMENSIONS' => $PDF_DIMENSIONS,
        'PDF_TABLE_HEADERS' => $PDF_TABLE_HEADERS,
        'PDF_COLUMN_WIDTHS_PERCENT' => $PDF_COLUMN_WIDTHS_PERCENT,
        'PDF_COMPANY_INFO' => $PDF_COMPANY_INFO,
        'PDF_PAGE_FORMAT' => $PDF_PAGE_FORMAT,
        'PDF_ORIENTATION' => $PDF_ORIENTATION
    ];
    
    // 1. Recupera i dati dal database
    $reportData = getReportData($pdo, $startDate, $endDate, $employeeId, $sede, $qualifica);
    
    // Verifica errori nei dati
    if (!$reportData['success']) {
        header("Content-Type: application/json");
        echo json_encode([
            "error" => $reportData['error'],
            "message" => $reportData['message']
        ]);
        exit;
    }
    
    // 2. Genera il PDF
    $pdf = generatePDF($reportData, $config);
    
    // 3. Output del PDF
    $pdf->Output($reportData['nomeFile'] . '.pdf', 'D');
    
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