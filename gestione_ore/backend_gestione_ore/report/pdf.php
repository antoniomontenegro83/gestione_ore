<?php
require_once '../db.php';
require_once '../turni/calculator.php';

// Parametri di filtro
$startDate = $_GET['startDate'] ?? null;
$endDate = $_GET['endDate'] ?? null;
$employeeId = $_GET['employeeId'] ?? null;
$sede = $_GET['sede'] ?? null;
$qualifica = $_GET['qualifica'] ?? null;

// Validazione
if (!$startDate || !$endDate) {
    die("Date obbligatorie");
}

try {
    // Prepara la query base
    $sql = "
        SELECT t.id, t.employee_id, t.entry_date, t.entry_time, t.exit_date, t.exit_time,
               d.cognome, d.nome, d.qualifica, d.sede
        FROM turni t
        LEFT JOIN dipendenti d ON t.employee_id = d.id
        WHERE t.entry_date BETWEEN ? AND ?
    ";
    
    $params = [$startDate, $endDate];
    
    // Aggiungi il filtro per dipendente se specificato
    if ($employeeId) {
        $sql .= " AND t.employee_id = ?";
        $params[] = $employeeId;
    }
    
    // Aggiungi filtro per sede
    if ($sede) {
        $sql .= " AND d.sede = ?";
        $params[] = $sede;
    }
    
    // Aggiungi filtro per qualifica
    if ($qualifica) {
        $sql .= " AND d.qualifica = ?";
        $params[] = $qualifica;
    }
    
    // Ordina i risultati
    $sql .= " ORDER BY d.cognome, d.nome, t.entry_date";
    
    // Esegui la query
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turni = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Se non ci sono risultati
    if (count($turni) === 0) {
        die("Nessun dato disponibile per il periodo selezionato.");
    }
    
    // Calcola le ore per ogni turno
    $turniConOre = [];
    $sommario = [
        'feriali_diurne' => 0,
        'feriali_notturne' => 0,
        'festive_diurne' => 0,
        'festive_notturne' => 0,
        'totale_ore' => 0
    ];
    
    foreach ($turni as $turno) {
        // Calcola le ore lavorate
        $ore = calcolaOreLavorate(
            $turno['entry_date'],
            $turno['entry_time'],
            $turno['exit_date'],
            $turno['exit_time']
        );
        
        // Aggiungi le ore al turno
        $turno = array_merge($turno, $ore);
        $turniConOre[] = $turno;
        
        // Aggiorna il sommario
        $sommario['feriali_diurne'] += $ore['feriali_diurne'];
        $sommario['feriali_notturne'] += $ore['feriali_notturne'];
        $sommario['festive_diurne'] += $ore['festive_diurne'];
        $sommario['festive_notturne'] += $ore['festive_notturne'];
    }
    
    // Calcola il totale delle ore
    $sommario['totale_ore'] = $sommario['feriali_diurne'] + $sommario['feriali_notturne'] + 
                             $sommario['festive_diurne'] + $sommario['festive_notturne'];
    
    // Arrotonda i valori a 2 decimali
    foreach ($sommario as $key => $value) {
        $sommario[$key] = round($value, 2);
    }
    
    // Ottieni i dettagli del dipendente se specificato
    $titoloReport = "Report Ore dal " . date('d/m/Y', strtotime($startDate)) . " al " . date('d/m/Y', strtotime($endDate));
    
    if ($employeeId) {
        $stmtDip = $pdo->prepare("SELECT cognome, nome FROM dipendenti WHERE id = ?");
        $stmtDip->execute([$employeeId]);
        if ($dipendente = $stmtDip->fetch(PDO::FETCH_ASSOC)) {
            $titoloReport .= " - " . $dipendente['cognome'] . " " . $dipendente['nome'];
        }
    }
    
    if ($sede) {
        $titoloReport .= " - Sede: " . $sede;
    }
    
    if ($qualifica) {
        $titoloReport .= " - Qualifica: " . $qualifica;
    }
    
    // Inizia la generazione del PDF (HTML che verrà inviato al browser)
    ob_start();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php echo $titoloReport; ?></title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            font-size: 12px;
        }
        h1 { 
            font-size: 18px; 
            text-align: center; 
            margin-bottom: 20px;
            color: #333;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: center;
        }
        th { 
            background-color: #f2f2f2; 
            font-weight: bold;
        }
        .summary-table {
            width: 60%;
            margin: 0 auto 30px auto;
        }
        .summary-table th {
            text-align: left;
            width: 70%;
        }
        .summary-table td {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            background-color: #eaf2ff;
        }
        .page-break {
            page-break-after: always;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #777;
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <h1><?php echo $titoloReport; ?></h1>
    
    <h2 style="font-size: 16px;">Riepilogo Ore</h2>
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
            <td>Totale Ore</td>
            <td><?php echo number_format($sommario['totale_ore'], 2, ',', '.'); ?></td>
        </tr>
    </table>
    
    <h2 style="font-size: 16px;">Dettaglio Turni</h2>
    <table>
        <tr>
            <th>Cognome</th>
            <th>Nome</th>
            <th>Qualifica</th>
            <th>Sede</th>
            <th>Data</th>
            <th>Ingresso</th>
            <th>Uscita</th>
            <th>Feriali Diurne</th>
            <th>Feriali Notturne</th>
            <th>Festive Diurne</th>
            <th>Festive Notturne</th>
            <th>Totale</th>
        </tr>
        <?php foreach ($turniConOre as $turno): 
            // Calcola il totale ore per il turno
            $totaleOre = $turno['feriali_diurne'] + $turno['feriali_notturne'] + 
                        $turno['festive_diurne'] + $turno['festive_notturne'];
                        
            // Formatta le date
            $dataIngresso = date('d/m/Y', strtotime($turno['entry_date']));
            $oraIngresso = date('H:i', strtotime($turno['entry_time']));
            $oraUscita = date('H:i', strtotime($turno['exit_time']));
        ?>
        <tr>
            <td><?php echo $turno['cognome']; ?></td>
            <td><?php echo $turno['nome']; ?></td>
            <td><?php echo $turno['qualifica'] ?? '-'; ?></td>
            <td><?php echo $turno['sede'] ?? '-'; ?></td>
            <td><?php echo $dataIngresso; ?></td>
            <td><?php echo $oraIngresso; ?></td>
            <td><?php echo $oraUscita; ?></td>
            <td><?php echo number_format($turno['feriali_diurne'], 2, ',', '.'); ?></td>
            <td><?php echo number_format($turno['feriali_notturne'], 2, ',', '.'); ?></td>
            <td><?php echo number_format($turno['festive_diurne'], 2, ',', '.'); ?></td>
            <td><?php echo number_format($turno['festive_notturne'], 2, ',', '.'); ?></td>
            <td style="font-weight: bold;"><?php echo number_format($totaleOre, 2, ',', '.'); ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
    
    <div class="footer">
        Report generato il <?php echo date('d/m/Y H:i'); ?> - Pagina <span class="pagenum"></span>
    </div>
</body>
</html>
<?php
    // Ottieni il contenuto HTML generato
    $html = ob_get_clean();
    
    // Se esiste TCPDF o simili, utilizzali per generare un PDF
    // Altrimenti, invia l'HTML al browser
    
    // Per ora, inviamo l'HTML direttamente
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="report_ore_' . date('Y-m-d') . '.pdf"');
    
    // Nota: In un'implementazione reale, utilizzare TCPDF, MPDF o simili per generare un PDF
    // Per questo esempio, stamperemo solo l'HTML (che non è un vero PDF)
    // Include il commento che in produzione andrà sostituito
    echo "<!--- 
    NOTA: Questo file è una simulazione di PDF. In produzione, utilizzare una libreria come TCPDF o MPDF.
    Esempio di codice per TCPDF:
    
    require_once('tcpdf/tcpdf.php');
    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8');
    $pdf->SetCreator('Sistema Gestione Ore');
    $pdf->SetAuthor('Gestione Ore');
    $pdf->SetTitle('$titoloReport');
    $pdf->SetHeaderData('', 0, '$titoloReport', '');
    $pdf->setHeaderFont(Array('helvetica', '', 10));
    $pdf->setFooterFont(Array('helvetica', '', 8));
    $pdf->SetDefaultMonospacedFont('courier');
    $pdf->SetMargins(15, 15, 15);
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(10);
    $pdf->SetAutoPageBreak(TRUE, 15);
    $pdf->AddPage();
    $pdf->writeHTML($html, true, false, true, false, '');
    $pdf->Output('report_ore_' . date('Y-m-d') . '.pdf', 'D');
    --->";
    
    echo $html;
    
} catch (PDOException $e) {
    die("Errore: " . $e->getMessage());
}
?>