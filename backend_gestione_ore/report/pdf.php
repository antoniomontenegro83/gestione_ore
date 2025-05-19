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
        'feriali_notturne' => 0,
        'festive_diurne' => 0,
        'festive_notturne' => 0,
        'totale_ore' => 0
    ];
    
    foreach ($turni as $turno) {
        $sommario['feriali_diurne'] += floatval($turno['feriali_diurne']);
        $sommario['feriali_notturne'] += floatval($turno['feriali_notturne']);
        $sommario['festive_diurne'] += floatval($turno['festive_diurne']);
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
    if ($employeeId) {
        $stmtDip = $pdo->prepare("SELECT cognome, nome FROM dipendenti WHERE id = ?");
        $stmtDip->execute([$employeeId]);
        if ($dipendente = $stmtDip->fetch(PDO::FETCH_ASSOC)) {
            $nomeFile = $dipendente['cognome'] . '_' . $dipendente['nome'];
            $nomeDipendente = $dipendente['cognome'] . ' ' . $dipendente['nome'];
        }
    }
    
    // Sanitizza il nome del file
    $nomeFile .= '_' . str_replace('-', '', $startDate) . '_' . str_replace('-', '', $endDate);
    $nomeFile = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nomeFile);
    
    // Titolo del report
    $titoloReport = "Report Ore dal " . date('d/m/Y', strtotime($startDate)) . " al " . date('d/m/Y', strtotime($endDate));
    
    if ($nomeDipendente) {
        $titoloReport .= " - " . $nomeDipendente;
    }
    
    if ($sede) {
        $titoloReport .= " - Sede: " . $sede;
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
            margin: 12mm;
        }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 14pt;
            margin: 0;
            padding: 0;
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
        
        <h2>Riepilogo Ore</h2>
        
        <table class="summary-table">
            <tr>
                <th style="width:50%; text-align:center;">Tipo di ore</th>
                <th style="width:50%; text-align:center;">Totale</th>
            </tr>
            <tr>
                <td style="text-align:center;">Ore Feriali Diurne</td>
                <td style="text-align:center;"><?php echo decimal_to_time($sommario['feriali_diurne']); ?></td>
            </tr>
            <tr>
                <td style="text-align:center;">Ore Feriali Notturne</td>
                <td style="text-align:center;"><?php echo decimal_to_time($sommario['feriali_notturne']); ?></td>
            </tr>
            <tr>
                <td style="text-align:center;">Ore Festive Diurne</td>
                <td style="text-align:center;"><?php echo decimal_to_time($sommario['festive_diurne']); ?></td>
            </tr>
            <tr>
                <td style="text-align:center;">Ore Festive Notturne</td>
                <td style="text-align:center;"><?php echo decimal_to_time($sommario['festive_notturne']); ?></td>
            </tr>
            <tr class="total-row">
                <td style="text-align:center;"><strong>TOTALE ORE</strong></td>
                <td style="text-align:center;"><strong><?php echo decimal_to_time($sommario['totale_ore']); ?></strong></td>
            </tr>
        </table>
        
        <h2>Dettaglio Turni</h2>
        <table>
            <thead>
                <tr>
                    <th class="col-date">Data Ingresso</th>
                    <th class="col-time">Ingresso</th>
                    <th class="col-date">Data Uscita</th>
                    <th class="col-time">Uscita</th>
                    <th class="col-sede">Sede</th>
                    <th class="col-hours">Feriali Diurne</th>
                    <th class="col-hours">Feriali Notturne</th>
                    <th class="col-hours">Festive Diurne</th>
                    <th class="col-hours">Festive Notturne</th>
                    <th class="col-hours">Totale</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($turni as $turno): ?>
                <tr>
                    <td class="col-date"><?php echo date('d/m/Y', strtotime($turno['entry_date'])); ?></td>
                    <td class="col-time"><?php echo substr($turno['entry_time'], 0, 5); ?></td>
                    <td class="col-date"><?php echo date('d/m/Y', strtotime($turno['exit_date'])); ?></td>
                    <td class="col-time"><?php echo substr($turno['exit_time'], 0, 5); ?></td>
                    <td class="col-sede"><?php echo htmlspecialchars($turno['sede'] ?? '-'); ?></td>
                    <td class="col-hours"><?php echo decimal_to_time($turno['feriali_diurne']); ?></td>
                    <td class="col-hours"><?php echo decimal_to_time($turno['feriali_notturne']); ?></td>
                    <td class="col-hours"><?php echo decimal_to_time($turno['festive_diurne']); ?></td>
                    <td class="col-hours"><?php echo decimal_to_time($turno['festive_notturne']); ?></td>
                    <td class="col-hours"><strong><?php echo decimal_to_time($turno['totale_ore']); ?></strong></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="5"><strong>TOTALE GENERALE</strong></td>
                    <td><?php echo decimal_to_time($sommario['feriali_diurne']); ?></td>
                    <td><?php echo decimal_to_time($sommario['feriali_notturne']); ?></td>
                    <td><?php echo decimal_to_time($sommario['festive_diurne']); ?></td>
                    <td><?php echo decimal_to_time($sommario['festive_notturne']); ?></td>
                    <td><?php echo decimal_to_time($sommario['totale_ore']); ?></td>
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
                                font-size: 20pt; /* Dimensione grande per il PDF */
                                background-color: white;
                            }
                            h1, h2 {
                                color: #800020;
                                font-size: 24pt; /* Titoli più grandi per il PDF */
                            }
                            h2 {
                                font-size: 22pt; /* Sottotitoli per il PDF */
                                margin-top: 18px;
                                margin-bottom: 12px;
                                border-bottom: 1px solid #800020;
                                padding-bottom: 8px;
                            }
                            .header {
                                position: relative;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 18px;
                                border-bottom: 1px solid #800020;
                                padding-bottom: 12px;
                            }
                            .logo {
                                height: 60px;
                                margin-right: 20px;
                            }
                            .company-info {
                                flex-grow: 1;
                                text-align: right;
                                font-size: 16pt;
                                color: #555;
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin-bottom: 18px;
                                font-size: 20pt; /* Tabella per il PDF */
                                table-layout: fixed;
                            }
                            th, td { 
                                border: 1px solid #ddd; 
                                padding: 12px 6px; /* Padding per il PDF */
                                text-align: center;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                line-height: 1.5;
                            }
                            th { 
                                background-color: #800020;
                                color: white;
                                font-weight: bold;
                                font-size: 20pt;
                            }
                            .summary-table {
                                width: 100%;
                                margin: 0 0 18px 0;
                                table-layout: auto;
                                font-size: 20pt;
                            }
                            .summary-table th {
                                text-align: center !important;
                                padding: 10px;
                            }
                            .summary-table td {
                                text-align: center !important;
                                font-weight: bold;
                                padding: 10px;
                            }
                            .total-row {
                                background-color: rgba(128, 0, 32, 0.1);
                                font-weight: bold;
                                font-size: 22pt;
                                color: #800020;
                            }
                            .footer {
                                text-align: center;
                                margin-top: 18px;
                                font-size: 16pt; /* Footer più grande */
                                color: #777;
                                padding-top: 10px;
                                border-top: 1px solid #800020;
                            }
                        `;
                        document.head.appendChild(style);
                        
                        // Assicuriamoci che il contenuto sia visibile durante la generazione del PDF
                        document.getElementById('content').style.display = 'block';
                        
                        // Crea un nuovo documento PDF in formato verticale
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        
                        // Imposta font e dimensione
                        pdf.setFont("helvetica");
                        pdf.setFontSize(20); /* Dimensione font di base per il PDF */
                        
                        html2canvas(document.getElementById('content'), {
                            scale: 2, /* Scala bilanciata */
                            useCORS: true,
                            logging: false,
                            backgroundColor: "#ffffff"
                        }).then(canvas => {
                            try {
                                const imgData = canvas.toDataURL('image/png');
                                
                                // Dimensioni ottimizzate per formato verticale
                                const imgWidth = 190;
                                const pageHeight = 270;
                                const imgHeight = canvas.height * imgWidth / canvas.width;
                                
                                // Aggiungi l'immagine alla prima pagina
                                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                                
                                // Se necessario, aggiungi pagine aggiuntive
                                let heightLeft = imgHeight;
                                let position = 0;
                                heightLeft -= pageHeight;
                                
                                while (heightLeft > 0) {
                                    position = heightLeft - imgHeight;
                                    pdf.addPage();
                                    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
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