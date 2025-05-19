<?php
/**
 * pdf_template.php - Template HTML per il report PDF
 * 
 * Questo file genera l'HTML del report PDF da visualizzare o scaricare.
 * Variabili disponibili: $turni, $sommario, $nomeFile, $titoloReport, $sottotitoloReport, $action
 */

// Inizia a catturare l'output
ob_start();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($titoloReport); ?></title>
    <style>
        <?php 
        // Includi gli stili CSS in modo inline invece di usare il file esterno
        // per evitare problemi di percorso
        $cssFile = __DIR__ . '/pdf_styles.css';
        if (file_exists($cssFile)) {
            echo file_get_contents($cssFile);
        }
        ?>
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
            <!-- Scritta al posto del logo -->
            <div class="company-title">Gestione Ore</div>
            <div class="company-info">
                <?php echo date('d/m/Y H:i'); ?>
            </div>
        </div>
        
        <!-- Titolo principale centrato -->
        <div class="report-title"><?php echo htmlspecialchars($titoloReport); ?></div>
        
        <!-- Sottotitolo con qualifica e nome centrato -->
        <?php if (!empty($sottotitoloReport)): ?>
        <div class="report-subtitle"><?php echo htmlspecialchars($sottotitoloReport); ?></div>
        <?php endif; ?>
        
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
    
    <script src="<?php echo __DIR__; ?>/pdf_script.js"></script>
    <script>
        // Poiché il file esterno potrebbe non caricare, includiamo il JavaScript essenziale qui
        // Variabili passate da PHP
        const nomeFile = '<?php echo $nomeFile; ?>';
        const action = '<?php echo $action; ?>';

        // Avvia immediatamente la generazione del PDF
        document.addEventListener('DOMContentLoaded', function() {
            // Per opzione di stampa
            if (action === "print") {
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
                // Per opzione di download, gestita dal file esterno se disponibile
                if (typeof handleDownload !== 'function') {
                    // Funzione di fallback se il file esterno non è disponibile
                    setTimeout(function() {
                        try {
                            const { jsPDF } = window.jspdf;
                            
                            // Aggiungi stili per il PDF
                            const style = document.createElement('style');
                            style.textContent = `
                                #content {
                                    display: block !important;
                                    font-family: Helvetica, Arial, sans-serif;
                                    color: #000000;
                                    font-size: 20pt;
                                    background-color: white;
                                }
                                .report-title { font-size: 24pt; }
                                .report-subtitle { font-size: 18pt; }
                            `;
                            document.head.appendChild(style);
                            
                            // Mostra il contenuto
                            document.getElementById('content').style.display = 'block';
                            
                            // Crea un nuovo documento PDF
                            const pdf = new jsPDF('p', 'mm', 'a4');
                            
                            // Genera il PDF
                            html2canvas(document.getElementById('content')).then(canvas => {
                                const imgData = canvas.toDataURL('image/png');
                                const imgWidth = 190;
                                const pageHeight = 270;
                                const imgHeight = canvas.height * imgWidth / canvas.width;
                                
                                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                                
                                // Aggiungi pagine aggiuntive se necessario
                                let heightLeft = imgHeight - pageHeight;
                                while (heightLeft > 0) {
                                    pdf.addPage();
                                    pdf.addImage(imgData, 'PNG', 10, -(pageHeight * (imgHeight / heightLeft)), imgWidth, imgHeight);
                                    heightLeft -= pageHeight;
                                }
                                
                                pdf.save(nomeFile + '.pdf');
                                setTimeout(() => { window.close(); }, 1000);
                            });
                        } catch (error) {
                            console.error(error);
                            alert("Errore nella generazione del PDF. Prova a usare la funzione di stampa.");
                        }
                    }, 500);
                } else {
                    handleDownload();
                }
            }
        });
    </script>
</body>
</html>
<?php
// Ottieni l'output e invialo al browser
$html = ob_get_clean();
echo $html;
?>