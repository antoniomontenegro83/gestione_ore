<?php
/**
 * pdf_config.php - Configurazioni per la generazione dei report PDF
 * 
 * Questo file contiene tutte le configurazioni per la generazione dei report PDF
 * Come colori, dimensioni, margini, ecc.
 */

// Configurazioni colori (formato RGB)
$PDF_COLORS = [
    'primary'        => [128, 0, 32],    // Colore principale (bordeaux)
    'table_header'   => [128, 0, 32],    // Intestazioni tabelle (bordeaux)
    'alternate_row'  => [245, 245, 255], // Righe alterne tabella (azzurro chiaro)
    'totals_row'     => [230, 222, 255], // Riga totali (viola chiaro)
    'text_light'     => [255, 255, 255], // Testo chiaro (bianco)
    'text_dark'      => [0, 0, 0],       // Testo scuro (nero)
    'feriali_diurne' => [40, 167, 69],   // Verde
    'feriali_notturne' => [13, 110, 253], // Blu
    'festive_diurne' => [253, 126, 20],  // Arancione
    'festive_notturne' => [220, 53, 69], // Rosso
];

// Dimensioni font
$PDF_FONT_SIZES = [
    'title'        => 16, // Titolo principale
    'subtitle'     => 14, // Sottotitolo
    'section'      => 14, // Titoli sezioni (riportato al valore originale)
    'table_header' => 9,  // Intestazioni tabelle
    'table_body'   => 9,  // Contenuto tabelle
    'totals'       => 10, // Totali
    'footer'       => 8,  // Piè di pagina
];

// Margini e dimensioni
$PDF_DIMENSIONS = [
    'margin_left'   => 5,   // Margine sinistro
    'margin_top'    => 10,  // Margine superiore riportato al valore originale
    'margin_right'  => 5,   // Margine destro
    'margin_bottom' => 15,  // Margine inferiore
    'row_height'    => 7,   // Altezza riga dati
    'header_height' => 5,   // Altezza riga intestazione
    'rows_per_page' => 34,  // Numero massimo di righe per pagina
];

// Intestazioni tabella dettaglio
$PDF_TABLE_HEADERS = [
    'top' => [
        'Sede di', 'Data', 'Ora', 'Data', 'Ora', 
        'Feriali', 'Festive o', 'Festive', 'Totale'
    ],
    'bottom' => [
        'Servizio', 'Ingresso', 'Ingresso', 'Uscita', 'Uscita', 
        'Diurne', 'Notturne', 'Notturne', 'Ore'
    ],
];

// Larghezze colonne (in percentuale)
$PDF_COLUMN_WIDTHS_PERCENT = [16, 11, 9, 11, 9, 11, 11, 11, 11];

// Informazioni azienda (opzionale)
$PDF_COMPANY_INFO = [
    'name'    => 'Sistema Gestione Ore',
    'version' => 'v1.0',
    'logo'    => '../img/logo.png', // Path del logo, se disponibile
];

// Formato pagina
$PDF_PAGE_FORMAT = 'A4';
$PDF_ORIENTATION = 'P'; // P = Portrait, L = Landscape

/**
 * Funzione per convertire un valore decimale in formato ore:minuti (HH:MM)
 * 
 * @param float $decimal Valore decimale delle ore
 * @return string Ore in formato HH:MM
 */
function decimal_to_time($decimal) {
    $hours = floor($decimal);
    $minutes = round(($decimal - $hours) * 60);
    
    if ($minutes == 60) {
        $hours++;
        $minutes = 0;
    }
    
    return $hours . ":" . str_pad($minutes, 2, "0", STR_PAD_LEFT);
}