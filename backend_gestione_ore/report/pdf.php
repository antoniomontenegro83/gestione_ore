<?php
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
    
    // Set appropriate headers
    header('Content-Type: text/html; charset=UTF-8');
    
    // Genera il contenuto HTML
    ob_start();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($titoloReport); ?></title>
    <style>
        @page { 
            size: A4 landscape; 
            margin: 15mm;
        }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 10pt;
            margin: 0;
            padding: 0;
            color: #333;
        }
        h1 { 
            font-size: 16pt; 
            text-align: center; 
            margin-bottom: 20px;
            color: #000;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        h2 {
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #333;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
            font-size: 9pt;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: center;
        }
        th { 
            background-color: #337ab7;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .summary-table {
            width: 50%;
            margin: 0 auto 30px auto;
        }
        .summary-table th {
            text-align: left;
            background-color: #5bc0de;
            color: white;
        }
        .summary-table td {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            background-color: #d9edf7;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 8pt;
            color: #777;
        }
        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
</head>
<body>
    <div id="content">
        <h1><?php echo htmlspecialchars($titoloReport); ?></h1>
        
        <h2>Riepilogo Ore</h2>
        <table class="summary-table">
            <tr>
                <th>Tipo di ore</th>
                <th>Totale</th>
            </tr>
            <tr>
                <td>Ore Feriali Diurne</td>
                <td><?php echo number_format($sommario['feriali_diurne'], 2, ',', '.'); ?></td>
            </tr>
            <tr>
                <td>Ore Feriali Notturne</td>
                <td><?php echo number_format($sommario['feriali_notturne'], 2, ',', '.'); ?></td>
            </tr>
            <tr>
                <td>Ore Festive Diurne</td>
                <td><?php echo number_format($sommario['festive_diurne'], 2, ',', '.'); ?></td>
            </tr>
            <tr>
                <td>Ore Festive Notturne</td>
                <td><?php echo number_format($sommario['festive_notturne'], 2, ',', '.'); ?></td>
            </tr>
            <tr class="total-row">
                <td>TOTALE ORE</td>
                <td><?php echo number_format($sommario['totale_ore'], 2, ',', '.'); ?></td>
            </tr>
        </table>
        
        <h2>Dettaglio Turni</h2>
        <table>
            <thead>
                <tr>
                    <th>Cognome</th>
                    <th>Nome</th>
                    <th>Qualifica</th>
                    <th>Sede</th>
                    <th>Data Ingresso</th>
                    <th>Ingresso</th>
                    <th>Data Uscita</th>
                    <th>Uscita</th>
                    <th>Feriali D.</th>
                    <th>Feriali N.</th>
                    <th>Festive D.</th>
                    <th>Festive N.</th>
                    <th>Totale</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($turni as $turno): ?>
                <tr>
                    <td><?php echo htmlspecialchars($turno['cognome']); ?></td>
                    <td><?php echo htmlspecialchars($turno['nome']); ?></td>
                    <td><?php echo htmlspecialchars($turno['qualifica'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($turno['sede'] ?? '-'); ?></td>
                    <td><?php echo date('d/m/Y', strtotime($turno['entry_date'])); ?></td>
                    <td><?php echo substr($turno['entry_time'], 0, 5); ?></td>
                    <td><?php echo date('d/m/Y', strtotime($turno['exit_date'])); ?></td>
                    <td><?php echo substr($turno['exit_time'], 0, 5); ?></td>
                    <td><?php echo number_format($turno['feriali_diurne'], 2, ',', '.'); ?></td>
                    <td><?php echo number_format($turno['feriali_notturne'], 2, ',', '.'); ?></td>
                    <td><?php echo number_format($turno['festive_diurne'], 2, ',', '.'); ?></td>
                    <td><?php echo number_format($turno['festive_notturne'], 2, ',', '.'); ?></td>
                    <td><strong><?php echo number_format($turno['totale_ore'], 2, ',', '.'); ?></strong></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        
        <div class="footer">
            Report generato il <?php echo date('d/m/Y H:i'); ?>
        </div>
    </div>
    
    <script>
        const nomeFile = '<?php echo $nomeFile; ?>';
        const action = '<?php echo $action; ?>';
        
        window.onload = function() {
            if (action === 'print') {
                // Modalità stampa
                window.print();
                window.onafterprint = function() {
                    window.close();
                }
            } else {
                // Modalità download PDF
                const { jsPDF } = window.jspdf;
                
                html2canvas(document.getElementById('content'), {
                    scale: 2,
                    useCORS: true,
                    logging: false
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('l', 'mm', 'a4');
                    
                    const imgWidth = 280;
                    const pageHeight = 210;
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;
                    
                    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    
                    pdf.save(nomeFile + '.pdf');
                    
                    // Chiudi la finestra dopo il download
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                });
            }
        }
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