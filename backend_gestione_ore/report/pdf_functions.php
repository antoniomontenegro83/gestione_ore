<?php
/**
 * pdf_functions.php - Funzioni per la generazione dei report PDF
 * 
 * Questo file contiene tutte le funzioni necessarie per generare i report PDF
 */

/**
 * Recupera i dati necessari per il report dal database
 * 
 * @param PDO $pdo Connessione al database
 * @param string $startDate Data di inizio
 * @param string $endDate Data di fine
 * @param int|null $employeeId ID dipendente (opzionale)
 * @param string|null $sede Sede (opzionale)
 * @param string|null $qualifica Qualifica (opzionale)
 * @return array Array con dati turni, sommario, nome file, ecc.
 */
function getReportData($pdo, $startDate, $endDate, $employeeId = null, $sede = null, $qualifica = null) {
    // Query principale
    $sql = "
        SELECT 
            co.cognome, co.nome, co.qualifica, co.sede,
            co.entry_date, co.entry_time, co.exit_date, co.exit_time,
            co.feriali_diurne, co.feriali_notturne, 
            co.festive_diurne, co.festive_notturne, co.totale_ore
        FROM calcolo_ore co
        WHERE co.entry_date BETWEEN ? AND ?
    ";

    $params = [$startDate, $endDate];

    // Aggiungi filtri opzionali
    if ($employeeId) {
        $sql .= " AND co.employee_id = ?";
        $params[] = $employeeId;
    }
    if ($sede) {
        $sql .= " AND co.sede = ?";
        $params[] = $sede;
    }
    if ($qualifica) {
        $sql .= " AND co.qualifica = ?";
        $params[] = $qualifica;
    }
    
    $sql .= " ORDER BY co.cognome, co.nome, co.entry_date";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Verifica se ci sono risultati
    if (count($turni) === 0) {
        return [
            'success' => false,
            'error' => "Nessun dato disponibile",
            'message' => "Nessun turno trovato per il periodo selezionato"
        ];
    }

    // Calcola i totali
    $sommario = calculateTotals($turni);

    // Ottieni dettagli dipendente
    $dettaglioDipendente = '';
    $nomeDipendente = '';
    $qualificaDipendente = '';
    
    if ($employeeId) {
        $stmtDip = $pdo->prepare("SELECT cognome, nome, qualifica FROM dipendenti WHERE id = ?");
        $stmtDip->execute([$employeeId]);
        if ($dipendente = $stmtDip->fetch(PDO::FETCH_ASSOC)) {
            $nomeDipendente = $dipendente['cognome'] . ' ' . $dipendente['nome'];
            $qualificaDipendente = $dipendente['qualifica'] ?? '';
            $dettaglioDipendente = ($qualificaDipendente ? $qualificaDipendente . ' ' : '') . $nomeDipendente;
        }
    }

    // Estrai il mese e l'anno dalla data di inizio
    $mesiInItaliano = [
        '01' => 'gennaio',
        '02' => 'febbraio',
        '03' => 'marzo',
        '04' => 'aprile',
        '05' => 'maggio',
        '06' => 'giugno',
        '07' => 'luglio',
        '08' => 'agosto',
        '09' => 'settembre',
        '10' => 'ottobre',
        '11' => 'novembre',
        '12' => 'dicembre'
    ];
    
    $meseNum = date('m', strtotime($startDate));
    $anno = date('Y', strtotime($startDate));
    $meseNome = $mesiInItaliano[$meseNum] ?? $meseNum;

    // Costruisci nome file con formato: cognome_nome_qualifica_mese_anno
    $nomeFile = 'report_ore';
    
    if ($employeeId && $nomeDipendente) {
        $cognome = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($dipendente['cognome'] ?? ''));
        $nome = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($dipendente['nome'] ?? ''));
        $qualifica = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($qualificaDipendente));
        
        // Formato: cognome_nome_qualifica_mese_anno
        $nomeFile = $cognome . '_' . $nome . '_' . $qualifica . '_' . $meseNome . '_' . $anno;
    } else {
        // Se non è specificato un dipendente, includi solo mese e anno
        $nomeFile = 'report_ore_' . $meseNome . '_' . $anno;
    }
    
    // Sanitizza il nome del file (rimuovi caratteri non validi)
    $nomeFile = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nomeFile);

    // Costruisci titolo report
    $titoloReport = "Report Ore dal " . date('d/m/Y', strtotime($startDate)) . " al " . date('d/m/Y', strtotime($endDate));

    return [
        'success' => true,
        'turni' => $turni,
        'sommario' => $sommario,
        'dettaglioDipendente' => $dettaglioDipendente,
        'nomeDipendente' => $nomeDipendente,
        'qualificaDipendente' => $qualificaDipendente,
        'nomeFile' => $nomeFile,
        'titoloReport' => $titoloReport,
        'startDate' => $startDate,
        'endDate' => $endDate,
        'sede' => $sede,
        'mese' => $meseNome,
        'anno' => $anno
    ];
}

/**
 * Calcola i totali per le diverse tipologie di ore
 * 
 * @param array $turni Lista dei turni
 * @return array Totali calcolati
 */
function calculateTotals($turni) {
    $sommario = [
        'feriali_diurne' => 0,
        'feriali_notturne' => 0,
        'festive_diurne' => 0,
        'festive_notturne' => 0,
        'festivo_e_notturno' => 0,
        'totale_ore' => 0
    ];

    foreach ($turni as $turno) {
        $sommario['feriali_diurne'] += floatval($turno['feriali_diurne']);
        $sommario['feriali_notturne'] += floatval($turno['feriali_notturne']);
        $sommario['festive_diurne'] += floatval($turno['festive_diurne']);
        $sommario['festive_notturne'] += floatval($turno['festive_notturne']);
        $sommario['totale_ore'] += floatval($turno['totale_ore']);
    }

    // Calcola festivo_e_notturno (combinazione di feriali_notturne e festive_diurne)
    $sommario['festivo_e_notturno'] = $sommario['feriali_notturne'] + $sommario['festive_diurne'];

    // Arrotonda i totali a 2 decimali
    foreach ($sommario as $key => $value) {
        $sommario[$key] = round($value, 2);
    }

    return $sommario;
}

/**
 * Genera l'intestazione del report
 * 
 * @param TCPDF $pdf Oggetto PDF
 * @param array $reportData Dati del report
 * @param array $config Configurazioni
 * @return float Posizione Y corrente
 */
function generateHeader($pdf, $reportData, $config) {
    // Estrai i dati necessari
    extract($reportData);
    
    // Posizione Y iniziale
    $currentY = $config['PDF_DIMENSIONS']['margin_top']; 
    $pdf->SetY($currentY);
    
    // Imposta il font per il titolo
    $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['title']);
    
    // Titolo del report
    $pdf->Cell(0, 10, $titoloReport, 0, 1, 'C');
    $currentY += 10;
    
    // Dettagli dipendente
    if (!empty($dettaglioDipendente)) {
        $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['subtitle']);
        $pdf->Cell(0, 8, $dettaglioDipendente, 0, 1, 'C');
        $currentY += 8;
        
        // Aggiungi una linea orizzontale dopo i dettagli del dipendente
        $pdf->SetDrawColor(
            $config['PDF_COLORS']['primary'][0], 
            $config['PDF_COLORS']['primary'][1], 
            $config['PDF_COLORS']['primary'][2]
        );
        $pdf->Line(5, $pdf->GetY(), 205, $pdf->GetY());
        
        // Aggiungi una seconda linea sotto la prima
        $pdf->Ln(1);
        $pdf->Line(5, $pdf->GetY(), 205, $pdf->GetY());
        
        $pdf->Ln(2);
        $currentY += 3; // Aggiornato per considerare le due linee
    }
    
    // Sede
    if (!empty($sede)) {
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, "Sede: " . $sede, 0, 1, 'C');
        $currentY += 8;
    }
    
    // Spazio aggiuntivo dopo l'intestazione
    $pdf->Ln(5);
    $currentY += 5;
    
    return $currentY;
}

/**
 * Genera la sezione riepilogo del report
 * 
 * @param TCPDF $pdf Oggetto PDF
 * @param array $reportData Dati del report
 * @param array $config Configurazioni
 * @param float $currentY Posizione Y corrente
 * @return float Nuova posizione Y
 */
function generateSummary($pdf, $reportData, $config, $currentY) {
    // Estrai sommario
    $sommario = $reportData['sommario'];
    
    // Verifica che siamo alla posizione Y corretta
    $pdf->SetY($currentY);
    
    // Titolo sezione
    $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['section']);
    $pdf->Cell(0, 8, 'Riepilogo Ore', 0, 1, 'C');
    $currentY += 8;
    
    // Linea divisoria
    $pdf->SetDrawColor(
        $config['PDF_COLORS']['primary'][0], 
        $config['PDF_COLORS']['primary'][1], 
        $config['PDF_COLORS']['primary'][2]
    );
    $pdf->Line(5, $pdf->GetY(), 205, $pdf->GetY());
    
    // Spazio ridotto dopo la linea (come in "Dettaglio Turni")
    $pdf->Ln(2);
    $currentY += 2;
    
    // Centra la tabella di riepilogo
    $pageWidth = $pdf->getPageWidth();
    $tableWidth = 150; // Larghezza totale della tabella (100+50)
    $leftMargin = ($pageWidth - $tableWidth) / 2;
    
    // Intestazioni tabella riepilogo - Usando font in grassetto
    $pdf->SetFont('helvetica', 'B', 11); // Aggiunto 'B' per grassetto
    $pdf->SetFillColor(
        $config['PDF_COLORS']['table_header'][0], 
        $config['PDF_COLORS']['table_header'][1], 
        $config['PDF_COLORS']['table_header'][2]
    );
    $pdf->SetTextColor(
        $config['PDF_COLORS']['text_light'][0], 
        $config['PDF_COLORS']['text_light'][1], 
        $config['PDF_COLORS']['text_light'][2]
    );
    $pdf->SetX($leftMargin);
    $pdf->Cell(100, 8, 'Tipo di Ore', 1, 0, 'C', true);
    $pdf->Cell(50, 8, 'Totale', 1, 1, 'C', true);
    $currentY += 8;
    
    // Righe tabella riepilogo
    $pdf->SetTextColor(
        $config['PDF_COLORS']['text_dark'][0], 
        $config['PDF_COLORS']['text_dark'][1], 
        $config['PDF_COLORS']['text_dark'][2]
    );
    $pdf->SetFillColor(240, 240, 255);
    $pdf->SetFont('helvetica', '', 11); // Torna a font normale per il corpo
    
    $pdf->SetX($leftMargin);
    $pdf->Cell(100, 8, 'Ore Feriali Diurne', 1, 0, 'C');
    $pdf->Cell(50, 8, decimal_to_time($sommario['feriali_diurne']), 1, 1, 'C');
    $currentY += 8;
    
    $pdf->SetX($leftMargin);
    $pdf->Cell(100, 8, 'Ore Festive o Notturne', 1, 0, 'C');
    $pdf->Cell(50, 8, decimal_to_time($sommario['festivo_e_notturno']), 1, 1, 'C');
    $currentY += 8;
    
    $pdf->SetX($leftMargin);
    $pdf->Cell(100, 8, 'Ore Festive Notturne', 1, 0, 'C');
    $pdf->Cell(50, 8, decimal_to_time($sommario['festive_notturne']), 1, 1, 'C');
    $currentY += 8;
    
    // Riga totale con sfondo rosso chiaro
    $pdf->SetFillColor(255, 200, 200); // Rosso chiaro (RGB: 255, 200, 200)
    $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['totals']);
    $pdf->SetX($leftMargin);
    $pdf->Cell(100, 8, 'TOTALE ORE', 1, 0, 'C', true);
    $pdf->Cell(50, 8, decimal_to_time($sommario['totale_ore']), 1, 1, 'C', true);
    $currentY += 8;
    
    // Spazio
    $pdf->Ln(8);
    $currentY += 8;
    
    return $currentY;
}

/**
 * Genera la tabella dettaglio del report
 * 
 * @param TCPDF $pdf Oggetto PDF
 * @param array $reportData Dati del report
 * @param array $config Configurazioni
 * @param float $currentY Posizione Y corrente
 */
function generateDetails($pdf, $reportData, $config, $currentY) {
    // Estrai i dati necessari
    $turni = $reportData['turni'];
    $sommario = $reportData['sommario'];
    $headers_top = $config['PDF_TABLE_HEADERS']['top'];
    $headers_bottom = $config['PDF_TABLE_HEADERS']['bottom'];
    $colPerc = $config['PDF_COLUMN_WIDTHS_PERCENT'];
    
    // Titolo sezione
    $pdf->SetY($currentY);
    $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['section']);
    $pdf->Cell(0, 8, 'Dettaglio Turni', 0, 1, 'C');
    $currentY += 8;
    
    // Linea divisoria
    $pdf->SetDrawColor(
        $config['PDF_COLORS']['primary'][0], 
        $config['PDF_COLORS']['primary'][1], 
        $config['PDF_COLORS']['primary'][2]
    );
    $pdf->Line(5, $pdf->GetY(), 205, $pdf->GetY());
    $pdf->Ln(2);
    $currentY += 2;
    
    // Calcola larghezza colonne (percentuale della larghezza disponibile)
    $availableWidth = $pdf->getPageWidth() - 10;
    $colWidths = [];
    foreach ($colPerc as $perc) {
        $colWidths[] = ($availableWidth * $perc) / 100;
    }
    
    // Intestazioni della tabella dettaglio - dividiamo in due righe
    $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['table_header']);
    $pdf->SetFillColor(
        $config['PDF_COLORS']['table_header'][0], 
        $config['PDF_COLORS']['table_header'][1], 
        $config['PDF_COLORS']['table_header'][2]
    );
    $pdf->SetTextColor(
        $config['PDF_COLORS']['text_light'][0], 
        $config['PDF_COLORS']['text_light'][1], 
        $config['PDF_COLORS']['text_light'][2]
    );
    
    // Prima riga intestazioni
    $startX = $pdf->GetX();
    $startY = $pdf->GetY();
    for ($i = 0; $i < count($headers_top); $i++) {
        $pdf->Rect($startX, $startY, $colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], 'F');
        $pdf->Cell($colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], $headers_top[$i], 0, 0, 'C', false);
        $startX += $colWidths[$i];
    }
    $currentY += $config['PDF_DIMENSIONS']['header_height'];
    
    // Vai alla seconda riga
    $pdf->Ln();
    $startX = $pdf->GetX();
    $startY = $pdf->GetY();
    
    // Seconda riga intestazioni
    for ($i = 0; $i < count($headers_bottom); $i++) {
        $pdf->Rect($startX, $startY, $colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], 'F');
        $pdf->Cell($colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], $headers_bottom[$i], 0, 0, 'C', false);
        $startX += $colWidths[$i];
    }
    $currentY += $config['PDF_DIMENSIONS']['header_height'];
    
    // Vai alla riga dei dati
    $pdf->Ln();
    $pdf->SetTextColor(
        $config['PDF_COLORS']['text_dark'][0], 
        $config['PDF_COLORS']['text_dark'][1], 
        $config['PDF_COLORS']['text_dark'][2]
    );
    $pdf->SetFont('helvetica', '', $config['PDF_FONT_SIZES']['table_body']);
    
    // Righe dati
    $rowsOnCurrentPage = 2; // Contatore per le righe intestazione
    $lastSede = '';
    $fillColor = false;
    
    foreach ($turni as $turno) {
        // Verifica se è necessario aggiungere una nuova pagina
        if ($rowsOnCurrentPage >= $config['PDF_DIMENSIONS']['rows_per_page']) {
            // Aggiungi piè di pagina alla pagina corrente
            addFooter($pdf, $config);
            
            // Aggiungi nuova pagina
            $pdf->AddPage();
            $currentY = $config['PDF_DIMENSIONS']['margin_top'];
            $rowsOnCurrentPage = 0;
            
            // Rifai le intestazioni nella nuova pagina
            $pdf->SetY($currentY);
            
            // Titolo della pagina successiva per chiarezza
            $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['title'] - 2);
            $pdf->Cell(0, 8, $reportData['titoloReport'] . ' (continua)', 0, 1, 'C');
            $currentY += 8;
            
            // Intestazioni tabella
            $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['table_header']);
            $pdf->SetFillColor(
                $config['PDF_COLORS']['table_header'][0], 
                $config['PDF_COLORS']['table_header'][1], 
                $config['PDF_COLORS']['table_header'][2]
            );
            $pdf->SetTextColor(
                $config['PDF_COLORS']['text_light'][0], 
                $config['PDF_COLORS']['text_light'][1], 
                $config['PDF_COLORS']['text_light'][2]
            );
            
            // Prima riga intestazioni
            $startX = $pdf->GetX();
            $startY = $pdf->GetY();
            for ($i = 0; $i < count($headers_top); $i++) {
                $pdf->Rect($startX, $startY, $colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], 'F');
                $pdf->Cell($colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], $headers_top[$i], 0, 0, 'C', false);
                $startX += $colWidths[$i];
            }
            
            // Vai alla seconda riga
            $pdf->Ln();
            $startX = $pdf->GetX();
            $startY = $pdf->GetY();
            
            // Seconda riga intestazioni
            for ($i = 0; $i < count($headers_bottom); $i++) {
                $pdf->Rect($startX, $startY, $colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], 'F');
                $pdf->Cell($colWidths[$i], $config['PDF_DIMENSIONS']['header_height'], $headers_bottom[$i], 0, 0, 'C', false);
                $startX += $colWidths[$i];
            }
            
            // Vai alla riga dei dati
            $pdf->Ln();
            $pdf->SetTextColor(
                $config['PDF_COLORS']['text_dark'][0], 
                $config['PDF_COLORS']['text_dark'][1], 
                $config['PDF_COLORS']['text_dark'][2]
            );
            $pdf->SetFont('helvetica', '', $config['PDF_FONT_SIZES']['table_body']);
            
            $rowsOnCurrentPage = 2; // Contatore per le righe intestazione
        }
        
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();
        
        // Calcola festivo_e_notturno
        $festivoENotturno = floatval($turno['feriali_notturne']) + floatval($turno['festive_diurne']);
        
        // Se cambia la sede, aggiungi una separazione
        if ($turno['sede'] !== $lastSede) {
            if ($lastSede !== '') {
                $pdf->Ln(5);
                $rowsOnCurrentPage++;
            }
            $lastSede = $turno['sede'];
            $fillColor = false;
        }
        
        // Alternanza colori sfondo per leggibilità
        if ($fillColor) {
            $pdf->SetFillColor(
                $config['PDF_COLORS']['alternate_row'][0], 
                $config['PDF_COLORS']['alternate_row'][1], 
                $config['PDF_COLORS']['alternate_row'][2]
            );
        } else {
            $pdf->SetFillColor(255, 255, 255);
        }
        $fillColor = !$fillColor;
        
        // Dati della riga
        $cellData = [
            $turno['sede'] ?? '-',
            date('d/m/Y', strtotime($turno['entry_date'])),
            substr($turno['entry_time'], 0, 5),
            date('d/m/Y', strtotime($turno['exit_date'])),
            substr($turno['exit_time'], 0, 5),
            decimal_to_time($turno['feriali_diurne']),
            decimal_to_time($festivoENotturno),
            decimal_to_time($turno['festive_notturne']),
            decimal_to_time($turno['totale_ore'])
        ];
        
        // Disegna le celle
        $currX = $startX;
        for ($i = 0; $i < count($cellData); $i++) {
            $pdf->Rect($currX, $startY, $colWidths[$i], $config['PDF_DIMENSIONS']['row_height'], 'DF');
            $pdf->Cell($colWidths[$i], $config['PDF_DIMENSIONS']['row_height'], $cellData[$i], 0, 0, 'C', false);
            $currX += $colWidths[$i];
        }
        
        // Vai alla riga successiva
        $pdf->Ln();
        $rowsOnCurrentPage++;
    }
    
    // Riga totali - con sfondo rosso chiaro come in riepilogo
    $pdf->Ln(2);
    $pdf->SetFillColor(255, 200, 200); // Rosso chiaro (stesso usato nel riepilogo)
    $pdf->SetFont('helvetica', 'B', $config['PDF_FONT_SIZES']['totals']);
    
    // Unisci le prime 5 celle per l'etichetta TOTALE
    $startX = $pdf->GetX();
    $totalsLabelWidth = $colWidths[0] + $colWidths[1] + $colWidths[2] + $colWidths[3] + $colWidths[4];
    
    // Disegna lo sfondo
    $pdf->Rect($startX, $pdf->GetY(), $totalsLabelWidth, 7, 'DF');
    // Disegna il testo
    $pdf->Cell($totalsLabelWidth, 7, 'TOTALE GENERALE', 0, 0, 'C', false);
    
    // Colonne totali per tipo di ore
    $totals = [
        decimal_to_time($sommario['feriali_diurne']),
        decimal_to_time($sommario['festivo_e_notturno']),
        decimal_to_time($sommario['festive_notturne']),
        decimal_to_time($sommario['totale_ore'])
    ];
    
    for ($i = 0; $i < count($totals); $i++) {
        $index = $i + 5;
        $pdf->Rect($pdf->GetX(), $pdf->GetY(), $colWidths[$index], 7, 'DF');
        $pdf->Cell($colWidths[$index], 7, $totals[$i], 0, 0, 'C', false);
    }
    $pdf->Ln();
    
    // Aggiungi piè di pagina
    addFooter($pdf, $config);
}

/**
 * Aggiunge il piè di pagina al PDF
 * 
 * @param TCPDF $pdf Oggetto PDF
 * @param array $config Configurazioni
 */
function addFooter($pdf, $config) {
    $pdf->SetY($pdf->getPageHeight() - 15);
    $pdf->SetFont('helvetica', 'I', $config['PDF_FONT_SIZES']['footer']);
    $pdf->Cell(0, 10, 'Report generato il ' . date('d/m/Y H:i:s') . ' - ' . $config['PDF_COMPANY_INFO']['name'] . ' ' . $config['PDF_COMPANY_INFO']['version'], 0, 0, 'C');
}

/**
 * Genera il report PDF completo
 * 
 * @param array $reportData Dati del report
 * @param array $config Configurazioni
 * @return TCPDF Oggetto PDF completo
 */
function generatePDF($reportData, $config) {
    // Crea un nuovo oggetto TCPDF
    $pdf = new TCPDF(
        $config['PDF_ORIENTATION'],    // Orientamento (P o L)
        'mm',                          // Unità di misura
        $config['PDF_PAGE_FORMAT'],    // Formato pagina (A4, Letter, ecc.)
        true,                          // Unicode
        'UTF-8',                       // Encoding
        false                          // Disabilita cache disco
    );
    
    // Imposta le informazioni del documento
    $pdf->SetCreator($config['PDF_COMPANY_INFO']['name']);
    $pdf->SetAuthor($config['PDF_COMPANY_INFO']['name']);
    $pdf->SetTitle($reportData['titoloReport']);
    $pdf->SetSubject('Report Ore Lavorate');
    $pdf->SetKeywords('PDF, Report, Ore, Lavoro');
    
    // Imposta margini
    $pdf->SetMargins(
        $config['PDF_DIMENSIONS']['margin_left'],
        $config['PDF_DIMENSIONS']['margin_top'],
        $config['PDF_DIMENSIONS']['margin_right']
    );
    
    // Disabilita intestazione e piè di pagina predefiniti
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    
    // Disattiva la generazione automatica di pagine
    $pdf->SetAutoPageBreak(false, 0);
    
    // Aggiungi prima pagina
    $pdf->AddPage();
    
    // Genera intestazione e ottieni la posizione Y aggiornata
    $currentY = generateHeader($pdf, $reportData, $config);
    
    // Genera sezione riepilogo partendo dalla posizione Y corretta
    $currentY = generateSummary($pdf, $reportData, $config, $currentY);
    
    // Genera dettaglio turni partendo dalla posizione Y corretta
    generateDetails($pdf, $reportData, $config, $currentY);
    
    return $pdf;
}