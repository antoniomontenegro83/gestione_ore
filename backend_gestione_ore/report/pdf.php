<?php
// Funzione helper per convertire decimali in formato HH:MM
function decimal_to_time($decimal) {
    $hours = floor($decimal);
    $minutes = round(($decimal - $hours) * 60);
    
    if ($minutes == 60) {
        $hours++;
        $minutes = 0;
    }
    
    return $hours . ":" . str_pad($minutes, 2, "0", STR_PAD_LEFT);
}

// Verifica che sia una richiesta GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header("Content-Type: application/json");
    echo json_encode([
        "error" => "Metodo non consentito. Utilizzare GET per i report PDF.",
        "file" => __FILE__
    ]);
    exit;
}

require_once '../db.php';
require_once '../utilities/calculator.php';  // Percorso corretto

// Parametri di filtro
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
    // Query dalla tabella calcolo_ore
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
    
    if ($employeeId) {
        $sql .= " AND co.employee_id = ?";
        $params[] = $employeeId;
    }
    
    if ($sede) {
        $sql .= " AND co.sede = ?";
        $params[] = $sede;
    }
    
    $sql .= " ORDER BY co.cognome, co.nome, co.entry_date";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Se non ci sono risultati
    if (count($turni) === 0) {
        header("Content-Type: application/json");
        echo json_encode([
            "error" => "Nessun dato disponibile",
            "message" => "Nessun turno trovato per il periodo selezionato"
        ]);
        exit;
    }
    
    // Calcola i totali
    $sommario = [
        'feriali_diurne' => 0,
        'festivo_e_notturno' => 0, // Colonna combinata
        'festive_notturne' => 0,
        'totale_ore' => 0
    ];
    
    foreach ($turni as $turno) {
        $sommario['feriali_diurne'] += floatval($turno['feriali_diurne']);
        // Combina feriali_notturne e festive_diurne 
        $sommario['festivo_e_notturno'] += floatval($turno['feriali_notturne']) + floatval($turno['festive_diurne']);
        $sommario['festive_notturne'] += floatval($turno['festive_notturne']);
        $sommario['totale_ore'] += floatval($turno['totale_ore']);
    }
    
    // Arrotonda i totali
    foreach ($sommario as $key => $value) {
        $sommario[$key] = round($value, 2);
    }
    
    // Costruisci il nome del file
    $nomeFile = 'report_ore';
    $nomeDipendente = '';
    $dettaglioDipendente = '';
    $meseAnno = '';

    // Estrai il mese e l'anno dalle date
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

    // Ottieni il mese e l'anno dalla data di inizio
    $meseNum = date('m', strtotime($startDate));
    $anno = date('Y', strtotime($startDate));
    $meseNome = $mesiInItaliano[$meseNum] ?? $meseNum;
    $meseAnno = $meseNome . '_' . $anno;

    if ($employeeId) {
        $stmtDip = $pdo->prepare("SELECT cognome, nome, qualifica FROM dipendenti WHERE id = ?");
        $stmtDip->execute([$employeeId]);
        if ($dipendente = $stmtDip->fetch(PDO::FETCH_ASSOC)) {
            $qualifica = strtolower($dipendente['qualifica'] ?? 'nd');
            $cognome = strtolower($dipendente['cognome'] ?? '');
            $nome = strtolower($dipendente['nome'] ?? '');
            
            // Formato: qualifica_cognome_nome_mese_anno per il nome del file
            $nomeFile = $qualifica . '_' . $cognome . '_' . $nome . '_' . $meseAnno;
            // Per il titolo del PDF
            $nomeDipendente = $dipendente['cognome'] . ' ' . $dipendente['nome'];
            
            // Formato: QUALIFICA Cognome Nome per intestazione PDF
            $dettaglioDipendente = strtoupper($dipendente['qualifica'] ?? '') . ' ' . $dipendente['cognome'] . ' ' . $dipendente['nome'];
        }
    } else {
        // Se non è specificato un dipendente, includi solo mese e anno
        $nomeFile = 'report_ore_' . $meseAnno;
    }

    // Sanitizza il nome del file
    $nomeFile = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nomeFile);
    
    // Titolo del report
    $titoloReport = "Report Ore dal " . date('d/m/Y', strtotime($startDate)) . " al " . date('d/m/Y', strtotime($endDate));
    
    if ($sede) {
        $sedeInfo = " - Sede: " . $sede;
    } else {
        $sedeInfo = "";
    }
    
    // Genera il contenuto HTML
    ob_start();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($titoloReport); ?></title>
    <style>
        @page { 
            size: A4 portrait;
            margin: 0.5mm; /* Margini molto stretti */
        }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 18pt; /* Testo generale ancora più grande */
            margin: 0;
            padding: 4mm;
            color: #333;
            background-color: #f7f9fc;
        }
        .loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f7f9fc;
            z-index: 1000;
        }
        .loading-message {
            padding: 20px;
            border-radius: 5px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        #content {
            display: none; /* Nascondi completamente il contenuto HTML */
        }
        .dipendente-info {
            text-align: center;
            font-size: 22pt; /* Ancora più grande */
            color: #800020;
            border-bottom: none !important;
            margin-top: 10px;
            margin-bottom: 20px;
        }
        /* Stili per le celle della tabella */
        table {
            font-size: 16pt; /* Carattere ancora più grande */
            width: 100%;
            border-collapse: collapse;
            margin: 0;
        }
        th, td {
            padding: 8px 6px; /* Padding aumentato */
            text-align: center;
            border: 1px solid #ddd;
            word-wrap: break-word; /* Permette al testo di andare a capo */
            overflow-wrap: break-word; /* Fallback per browser più vecchi */
            hyphens: auto; /* Gestisce anche sillabazione */
            max-width: 150px; /* Limita la larghezza massima */
            height: auto; /* Regola l'altezza in base al contenuto */
        }
        th {
            background-color: #800020;
            color: white;
            font-weight: bold;
            font-size: 15pt; /* Intestazioni più grandi */
            vertical-align: middle;
            height: auto; /* Altezza automatica basata sul contenuto */
            padding: 10px 6px; /* Padding verticale aumentato */
            line-height: 1.2; /* Interlinea più generosa */
        }
        /* Stili per le intestazioni multilinea */
        th div.multiline {
            line-height: 1.3;
            font-size: 15pt;
            padding: 0;
            margin: 0;
        }
        /* Stili per le celle con testo che deve andare a capo */
        td.wrap-text {
            white-space: normal; /* Permette il testo di andare a capo */
            word-break: break-word; /* Fa andare a capo le parole lunghe */
            min-width: 80px; /* Imposta una larghezza minima */
            line-height: 1.3; /* Interlinea più generosa */
        }
        /* Stili per le intestazioni specifiche */
        th.col-hours {
            width: 9%;
        }
        td.col-hours {
            width: 9%;
            font-size: 17pt; /* Font size specifico per i numeri delle ore */
        }
        th.col-qual {
            width: 8%;
        }
        th.col-name {
            width: 18%;
        }
        th.col-date {
            width: 10%;
        }
        th.col-time {
            width: 7%;
        }
        th.col-sede {
            width: 12%;
        }
        /* Colori e stili aggiuntivi */
        h1 {
            font-size: 24pt; /* Titolo principale ancora più grande */
            text-align: center;
            color: #800020;
            margin: 5mm 0 4mm 0;
        }
        h2 {
            font-size: 22pt; /* Sottotitoli ancora più grandi */
            color: #800020;
            border-bottom: 1px solid #800020;
            padding-bottom: 5px;
            margin: 6mm 0 4mm 0;
        }
        .total-row {
            background-color: rgba(128, 0, 32, 0.1);
            font-weight: bold;
        }
        .total-row td {
            font-size: 17pt; /* Riga totali più grande */
        }
        .summary-table {
            width: 85%; /* Tabella leggermente più larga */
            margin: 0 auto;
            font-size: 18pt; /* Dimensione testo riepilogo aumentata */
        }
        .summary-table th, .summary-table td {
            padding: 10px; /* Padding maggiore */
            line-height: 1.4; /* Interlinea più ampia */
        }
        .footer {
            text-align: center;
            margin-top: 5mm;
            font-size: 13pt;
            color: #777;
            padding-top: 2mm;
            border-top: 1px solid #800020;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
</head>
<body>
    <!-- Indicatore di caricamento sempre visibile -->
    <div class="loading" id="loading">
        <div class="loading-message">
            <p>Generazione PDF in corso, attendere...</p>
        </div>
    </div>

    <!-- Contenuto nascosto per la generazione del PDF -->
    <div id="content">
        <div class="header">
            <img src="../img/logo.png" alt="Logo Azienda" class="logo" onerror="this.style.display='none'">
            <div class="company-info">
                <?php echo date('d/m/Y H:i'); ?>
            </div>
        </div>
        
        <h1><?php echo htmlspecialchars($titoloReport); ?></h1>
        <?php if (!empty($dettaglioDipendente)): ?>
        <h2 class="dipendente-info"><?php echo htmlspecialchars($dettaglioDipendente); ?></h2>
        <?php endif; ?>
        <?php if (!empty($sedeInfo)): ?>
        <p class="sede-info" style="text-align: center; margin-top: -10px; margin-bottom: 20px; font-weight: bold; font-size: 18pt;"><?php echo htmlspecialchars($sedeInfo); ?></p>
        <?php endif; ?>
        
        <h2>Riepilogo Ore</h2>
        
        <table class="summary-table">
            <tr>
                <th style="width:60%; text-align:center;">Tipo di ore</th>
                <th style="width:40%; text-align:center;">Totale</th>
            </tr>
            <tr>
                <td style="text-align:center;">Ore Feriali Diurne</td>
                <td style="text-align:center; font-size: 19pt;"><?php echo decimal_to_time($sommario['feriali_diurne']); ?></td>
            </tr>
            <tr>
                <td style="text-align:center;">Ore Festive o Notturne</td>
                <td style="text-align:center; font-size: 19pt;"><?php echo decimal_to_time($sommario['festivo_e_notturno']); ?></td>
            </tr>
            <tr>
                <td style="text-align:center;">Ore Festive Notturne</td>
                <td style="text-align:center; font-size: 19pt;"><?php echo decimal_to_time($sommario['festive_notturne']); ?></td>
            </tr>
            <tr class="total-row">
                <td style="text-align:center;"><strong>TOTALE ORE</strong></td>
                <td style="text-align:center; font-size: 20pt;"><strong><?php echo decimal_to_time($sommario['totale_ore']); ?></strong></td>
            </tr>
        </table>
        
        <h2>Dettaglio Turni</h2>
        <table>
            <thead>
                <tr>
                    <th class="col-qual">Qual.</th>
                    <th class="col-name">Dipendente</th>
                    <th class="col-date">Data In</th>
                    <th class="col-time">Ora In</th>
                    <th class="col-date">Data Out</th>
                    <th class="col-time">Ora Out</th>
                    <th class="col-sede">Sede</th>
                    <th class="col-hours"><div class="multiline">Feriali<br>Diurne</div></th>
                    <th class="col-hours"><div class="multiline">Festive o<br>Notturne</div></th>
                    <th class="col-hours"><div class="multiline">Festive<br>Notturne</div></th>
                    <th class="col-hours">Totale</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($turni as $turno): 
                    // Calcola la somma delle feriali notturne e festive diurne
                    $festivo_e_notturno = floatval($turno['feriali_notturne']) + floatval($turno['festive_diurne']);
                ?>
                <tr>
                    <td class="col-qual"><?php echo htmlspecialchars($turno['qualifica'] ?? '-'); ?></td>
                    <td class="col-name wrap-text"><?php echo htmlspecialchars($turno['cognome'] . ' ' . $turno['nome']); ?></td>
                    <td class="col-date"><?php echo date('d/m/Y', strtotime($turno['entry_date'])); ?></td>
                    <td class="col-time"><?php echo substr($turno['entry_time'], 0, 5); ?></td>
                    <td class="col-date"><?php echo date('d/m/Y', strtotime($turno['exit_date'])); ?></td>
                    <td class="col-time"><?php echo substr($turno['exit_time'], 0, 5); ?></td>
                    <td class="col-sede wrap-text"><?php echo htmlspecialchars($turno['sede'] ?? '-'); ?></td>
                    <td class="col-hours"><?php echo decimal_to_time($turno['feriali_diurne']); ?></td>
                    <td class="col-hours"><?php echo decimal_to_time($festivo_e_notturno); ?></td>
                    <td class="col-hours"><?php echo decimal_to_time($turno['festive_notturne']); ?></td>
                    <td class="col-hours"><strong><?php echo decimal_to_time($turno['totale_ore']); ?></strong></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="7"><strong>TOTALE GENERALE</strong></td>
                    <td><?php echo decimal_to_time($sommario['feriali_diurne']); ?></td>
                    <td><?php echo decimal_to_time($sommario['festivo_e_notturno']); ?></td>
                    <td><?php echo decimal_to_time($sommario['festive_notturne']); ?></td>
                    <td><strong><?php echo decimal_to_time($sommario['totale_ore']); ?></strong></td>
                </tr>
            </tfoot>
        </table>
        
        <div class="footer">
            Report generato il <?php echo date('d/m/Y H:i'); ?>
        </div>
    </div>
    
    <script>
        // Avvia immediatamente la generazione del PDF
        document.addEventListener('DOMContentLoaded', function() {
            // Per opzione di stampa
            if ("<?php echo $action; ?>" === "print") {
                // Mostra il contenuto per la stampa
                document.getElementById('content').style.display = 'block';
                document.getElementById('loading').style.display = 'none';
                
                // Avvia la stampa
                setTimeout(function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    }
                }, 500);
            } else {
                // Per opzione di download
                setTimeout(function() {
                    try {
                        const { jsPDF } = window.jspdf;
                        
                        // Imposta stili CSS globali per migliorare la qualità del report per il PDF
                        const style = document.createElement('style');
                        style.textContent = `
                            #content {
                                display: block !important;
                                font-family: Helvetica, Arial, sans-serif;
                                color: #000000;
                                font-size: 18pt;
                                background-color: white;
                                padding: 4mm;
                            }
                            h1 {
                                color: #800020;
                                font-size: 24pt;
                                text-align: center;
                                margin: 5mm 0 4mm 0;
                            }
                            h2 {
                                font-size: 22pt;
                                color: #800020;
                                border-bottom: 1px solid #800020;
                                padding-bottom: 5px;
                                margin: 6mm 0 4mm 0;
                            }
                            .dipendente-info {
                                text-align: center;
                                font-size: 22pt;
                                color: #800020;
                                border-bottom: none !important;
                                margin-top: 5px;
                                margin-bottom: 15px;
                                font-weight: bold;
                            }
                            .sede-info {
                                text-align: center;
                                font-size: 18pt;
                                color: #333333;
                                margin-top: -10px;
                                margin-bottom: 15px;
                            }
                            .header {
                                position: relative;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 10px;
                                border-bottom: 1px solid #800020;
                                padding-bottom: 8px;
                            }
                            .logo {
                                height: 40px;
                                margin-right: 10px;
                            }
                            .company-info {
                                flex-grow: 1;
                                text-align: right;
                                font-size: 14pt;
                                color: #555;
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin-bottom: 15px;
                                font-size: 16pt;
                            }
                            th, td { 
                                border: 1px solid #ddd; 
                                padding: 8px 6px;
                                text-align: center;
                                line-height: 1.3;
                                word-wrap: break-word;
                                overflow-wrap: break-word;
                                hyphens: auto;
                                max-width: 150px;
                            }
                            th { 
                                background-color: #800020;
                                color: white;
                                font-weight: bold;
                                font-size: 15pt;
                                padding: 10px 6px;
                                line-height: 1.2;
                            }
                            th div.multiline {
                                line-height: 1.3;
                                font-size: 15pt;
                            }
                            td.wrap-text {
                                white-space: normal;
                                word-break: break-word;
                                min-width: 80px;
                            }
                            td.col-hours {
                                font-size: 17pt;
                            }
                            
                            .summary-table {
                                width: 85%;
                                margin: 0 auto 15px auto;
                                font-size: 18pt;
                            }
                            .summary-table th {
                                text-align: center !important;
                                padding: 10px;
                                font-size: 18pt;
                            }
                            .summary-table td {
                                text-align: center !important;
                                font-weight: bold;
                                padding: 10px;
                                font-size: 18pt;
                                line-height: 1.4;
                            }
                            .total-row {
                                background-color: rgba(128, 0, 32, 0.1);
                                font-weight: bold;
                                color: #800020;
                            }
                            .total-row td {
                                font-size: 17pt;
                            }
                            .footer {
                                text-align: center;
                                margin-top: 15px;
                                font-size: 13pt;
                                color: #777;
                                padding-top: 5px;
                                border-top: 1px solid #800020;
                            }
                        `;
                        document.head.appendChild(style);
                        
                        // Assicuriamoci che il contenuto sia visibile durante la generazione del PDF
                        document.getElementById('content').style.display = 'block';
                        
                        // Crea un nuovo documento PDF in formato verticale con margini minimi
                        const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'mm',
                            format: 'a4',
                            compress: true,
                            margins: {
                                top: 0.5,
                                right: 0.5,
                                bottom: 0.5,
                                left: 0.5
                            }
                        });
                        
                        // Imposta font e dimensione
                        pdf.setFont("helvetica");
                        pdf.setFontSize(18);
                        
                        html2canvas(document.getElementById('content'), {
                            scale: 2.5, // Qualità aumentata
                            useCORS: true,
                            logging: false,
                            backgroundColor: "#ffffff"
                        }).then(canvas => {
                            try {
                                const imgData = canvas.toDataURL('image/png');
                                
                                // Dimensioni ottimizzate per formato verticale con margini minimi
                                const imgWidth = 204; // A4 width (210mm) minus margins
                                const pageHeight = 295; // A4 height (297mm) minus margins
                                const imgHeight = canvas.height * imgWidth / canvas.width;
                                
                                // Aggiungi l'immagine alla prima pagina
                                pdf.addImage(imgData, 'PNG', 3, 3, imgWidth, imgHeight);
                                
                                // Se necessario, aggiungi pagine aggiuntive
                                let heightLeft = imgHeight;
                                let position = 0;
                                heightLeft -= pageHeight;
                                
                                while (heightLeft > 0) {
                                    position = heightLeft - imgHeight;
                                    pdf.addPage();
                                    pdf.addImage(imgData, 'PNG', 3, position, imgWidth, imgHeight);
                                    heightLeft -= pageHeight;
                                }
                                
                                // Proprietà PDF
                                pdf.setProperties({
                                    title: 'Report Ore',
                                    subject: 'Report Ore Lavorate',
                                    creator: 'Sistema Gestione Ore'
                                });
                                
                                // Salva il PDF
                                pdf.save('<?php echo $nomeFile; ?>.pdf');
                                
                                // Rimuovi lo stile aggiunto temporaneamente
                                document.head.removeChild(style);
                                
                                // Chiudi la finestra dopo il download
                                setTimeout(() => {
                                    window.close();
                                }, 1000);
                            } catch (error) {
                                console.error("Errore nella creazione del PDF:", error);
                                alert("Si è verificato un errore nella creazione del PDF. Prova a utilizzare la funzione di stampa del browser.");
                                document.head.removeChild(style);
                            }
                        }).catch(error => {
                            console.error("Errore nella cattura HTML:", error);
                            alert("Si è verificato un errore nella creazione del PDF. Prova a utilizzare la funzione di stampa del browser.");
                            document.head.removeChild(style);
                        });
                    } catch (error) {
                        console.error("Errore nell'inizializzazione jsPDF:", error);
                        alert("Si è verificato un errore nella creazione del PDF. Prova a utilizzare la funzione di stampa del browser.");
                    }
                }, 500);
            }
        });
    </script>
</body>
</html>
<?php
    $html = ob_get_clean();
    echo $html;
    
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