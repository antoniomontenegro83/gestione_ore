<?php
// Questo file è incluso da pdf.php e contiene il template HTML del report
// Variabili disponibili: $titoloReport, $nomeFile, $this->turni, $this->sommario, $this->action
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
        /* Intestazione con logo */
        .header {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #4b0082;
            padding-bottom: 15px;
        }
        .logo {
            height: 50px;
            margin-right: 20px;
        }
        .company-info {
            flex-grow: 1;
            text-align: right;
            font-size: 9pt;
            color: #555;
        }
        h1 { 
            font-size: 16pt; 
            text-align: center; 
            margin: 20px 0;
            color: #4b0082;
            padding-bottom: 5px;
        }
        h2 {
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #4b0082;
            border-bottom: 1px solid #e3deff;
            padding-bottom: 5px;
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
            background-color: #7b68ee;
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
            background-color: #e3deff;
            color: #4b0082;
            font-weight: bold;
        }
        .summary-table td {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            background-color: #e3deff;
            font-weight: bold;
            color: #4b0082;
        }
        .total-row td:last-child {
            font-size: 110%;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 8pt;
            color: #777;
            padding-top: 10px;
            border-top: 1px solid #e3deff;
        }
        /* Badge per i tipi di ore */
        .ore-badge {
            padding: 3px 6px;
            border-radius: 3px;
            color: white;
            font-weight: bold;
            font-size: 8pt;
            display: inline-block;
            margin-top: 5px;
        }
        .badge-feriali-diurne {
            background-color: #28a745;
        }
        .badge-feriali-notturne {
            background-color: #0d6efd;
        }
        .badge-festive-diurne {
            background-color: #fd7e14;
        }
        .badge-festive-notturne {
            background-color: #dc3545;
        }
        /* Legenda */
        .legend {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        /* Grafici a barre per il riepilogo */
        .bar-chart-container {
            margin: 20px auto;
            width: 70%;
        }
        .bar-chart {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .bar-label {
            width: 30%;
            text-align: right;
            padding-right: 10px;
        }
        .bar-container {
            width: 50%;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            height: 20px;
        }
        .bar {
            height: 100%;
        }
        .bar-value {
            width: 20%;
            text-align: left;
            padding-left: 10px;
            font-weight: bold;
        }
        .bar-feriali-diurne {
            background-color: #28a745;
        }
        .bar-feriali-notturne {
            background-color: #0d6efd;
        }
        .bar-festive-diurne {
            background-color: #fd7e14;
        }
        .bar-festive-notturne {
            background-color: #dc3545;
        }
        .bar-totale {
            background-color: #7b68ee;
        }
        /* Nuovi stili per la tabella responsiva */
        .detail-table th {
            white-space: nowrap;
        }
        .detail-table td {
            vertical-align: middle;
        }
        /* Sottototali per dipendente */
        .subtotal-row {
            background-color: #f0f0ff;
            font-weight: bold;
        }
        /* Testo di nota sul formato orario */
        .time-note {
            font-size: 8pt;
            font-style: italic;
            text-align: center;
            margin-top: -15px;
            margin-bottom: 15px;
            color: #555;
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
        <div class="header">
            <img src="../img/logo.png" alt="Logo Azienda" class="logo" onerror="this.style.display='none'">
            <div class="company-info">
                <strong>Gestione Ore v1.0</strong><br>
                Sistema di gestione presenze e calcolo ore<br>
                <?php echo date('d/m/Y H:i'); ?>
            </div>
        </div>
        
        <h1><?php echo htmlspecialchars($titoloReport); ?></h1>
        
        <!-- Grafico a barre del riepilogo -->
        <div class="bar-chart-container">
            <?php 
            // Calcola il valore massimo per dimensionare le barre
            $maxValue = max($this->sommario);
            foreach ($this->sommario as $key => $value):
                $percentage = ($value / $maxValue) * 100;
                $barClass = 'bar-' . str_replace('_', '-', $key);
                $label = ucfirst(str_replace('_', ' ', $key));
            ?>
            <div class="bar-chart">
                <div class="bar-label"><?php echo $label; ?></div>
                <div class="bar-container">
                    <div class="bar <?php echo $barClass; ?>" style="width: <?php echo $percentage; ?>%"></div>
                </div>
                <div class="bar-value"><?php echo $this->convertToHoursMinutes($value); ?></div>
            </div>
            <?php endforeach; ?>
        </div>
        
        <h2>Riepilogo Ore</h2>
        <div class="time-note">Nota: Tutti i valori orari sono espressi nel formato ore:minuti (HH:MM)</div>
        <div class="legend">
            <span class="ore-badge badge-feriali-diurne">Feriali Diurne</span>
            <span class="ore-badge badge-feriali-notturne">Feriali Notturne</span>
            <span class="ore-badge badge-festive-diurne">Festive Diurne</span>
            <span class="ore-badge badge-festive-notturne">Festive Notturne</span>
        </div>
        <table class="summary-table">
            <tr>
                <th>Tipo di ore</th>
                <th>Totale</th>
            </tr>
            <tr>
                <td>Ore Feriali Diurne</td>
                <td><?php echo $this->convertToHoursMinutes($this->sommario['feriali_diurne']); ?></td>
            </tr>
            <tr>
                <td>Ore Feriali Notturne</td>
                <td><?php echo $this->convertToHoursMinutes($this->sommario['feriali_notturne']); ?></td>
            </tr>
            <tr>
                <td>Ore Festive Diurne</td>
                <td><?php echo $this->convertToHoursMinutes($this->sommario['festive_diurne']); ?></td>
            </tr>
            <tr>
                <td>Ore Festive Notturne</td>
                <td><?php echo $this->convertToHoursMinutes($this->sommario['festive_notturne']); ?></td>
            </tr>
            <tr class="total-row">
                <td>TOTALE ORE</td>
                <td><?php echo $this->convertToHoursMinutes($this->sommario['totale_ore']); ?></td>
            </tr>
        </table>
        
        <h2>Dettaglio Turni</h2>
        <table class="detail-table">
            <thead>
                <tr>
                    <th>Qualifica</th>
                    <th>Cognome</th>
                    <th>Nome</th>
                    <th>Sede</th>
                    <th>Data Ingresso</th>
                    <th>Ingresso</th>
                    <th>Data Uscita</th>
                    <th>Uscita</th>
                    <th>Fer. D.</th>
                    <th>Fer. N.</th>
                    <th>Fest. D.</th>
                    <th>Fest. N.</th>
                    <th>Totale</th>
                </tr>
            </thead>
            <tbody>
                <?php 
                $lastEmployee = '';
                $subtotals = [
                    'feriali_diurne' => 0,
                    'feriali_notturne' => 0,
                    'festive_diurne' => 0,
                    'festive_notturne' => 0,
                    'totale_ore' => 0
                ];
                
                foreach ($this->turni as $index => $turno): 
                    $currentEmployee = $turno['cognome'] . ' ' . $turno['nome'];
                    
                    // Aggiungi i valori ai subtotali
                    $subtotals['feriali_diurne'] += floatval($turno['feriali_diurne']);
                    $subtotals['feriali_notturne'] += floatval($turno['feriali_notturne']);
                    $subtotals['festive_diurne'] += floatval($turno['festive_diurne']);
                    $subtotals['festive_notturne'] += floatval($turno['festive_notturne']);
                    $subtotals['totale_ore'] += floatval($turno['totale_ore']);
                    
                    // Se è cambiato il dipendente e non è il primo, mostra i subtotali
                    if ($lastEmployee !== '' && $lastEmployee !== $currentEmployee) {
                        // Subtotali del dipendente precedente
                        echo '<tr class="subtotal-row">';
                        echo '<td colspan="8">Subtotale ' . htmlspecialchars($lastEmployee) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['feriali_diurne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['feriali_notturne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['festive_diurne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['festive_notturne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['totale_ore']) . '</td>';
                        echo '</tr>';
                        
                        // Reset subtotali per il nuovo dipendente
                        $subtotals = [
                            'feriali_diurne' => floatval($turno['feriali_diurne']),
                            'feriali_notturne' => floatval($turno['feriali_notturne']),
                            'festive_diurne' => floatval($turno['festive_diurne']),
                            'festive_notturne' => floatval($turno['festive_notturne']),
                            'totale_ore' => floatval($turno['totale_ore'])
                        ];
                    }
                ?>
                <tr>
                    <td><?php echo htmlspecialchars($turno['qualifica'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($turno['cognome']); ?></td>
                    <td><?php echo htmlspecialchars($turno['nome']); ?></td>
                    <td><?php echo htmlspecialchars($turno['sede'] ?? '-'); ?></td>
                    <td><?php echo date('d/m/Y', strtotime($turno['entry_date'])); ?></td>
                    <td><?php echo substr($turno['entry_time'], 0, 5); ?></td>
                    <td><?php echo date('d/m/Y', strtotime($turno['exit_date'])); ?></td>
                    <td><?php echo substr($turno['exit_time'], 0, 5); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($turno['feriali_diurne']); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($turno['feriali_notturne']); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($turno['festive_diurne']); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($turno['festive_notturne']); ?></td>
                    <td><strong><?php echo $this->convertToHoursMinutes($turno['totale_ore']); ?></strong></td>
                </tr>
                <?php 
                    $lastEmployee = $currentEmployee;
                    
                    // Se è l'ultimo record, mostra i subtotali
                    if ($index == count($this->turni) - 1) {
                        echo '<tr class="subtotal-row">';
                        echo '<td colspan="8">Subtotale ' . htmlspecialchars($lastEmployee) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['feriali_diurne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['feriali_notturne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['festive_diurne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['festive_notturne']) . '</td>';
                        echo '<td>' . $this->convertToHoursMinutes($subtotals['totale_ore']) . '</td>';
                        echo '</tr>';
                    }
                endforeach; 
                ?>
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="8"><strong>TOTALE GENERALE</strong></td>
                    <td><?php echo $this->convertToHoursMinutes($this->sommario['feriali_diurne']); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($this->sommario['feriali_notturne']); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($this->sommario['festive_diurne']); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($this->sommario['festive_notturne']); ?></td>
                    <td><?php echo $this->convertToHoursMinutes($this->sommario['totale_ore']); ?></td>
                </tr>
            </tfoot>
        </table>
        
        <div class="footer">
            Report generato il <?php echo date('d/m/Y H:i'); ?> - Sistema Gestione Ore v1.0
        </div>
    </div>
    
    <script>
        const nomeFile = '<?php echo $nomeFile; ?>';
        const action = '<?php echo $this->action; ?>';
        
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