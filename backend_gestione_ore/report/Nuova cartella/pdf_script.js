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
            pdf.setFontSize(20);
            
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
                    pdf.save(nomeFile + '.pdf');
                    
                    // Rimuovi lo stile aggiunto temporaneamente
                    document.head.removeChild(style);
                    
                    // Chiudi la finestra dopo il download
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                } catch (error) {
                    console.error("Errore nella creazione del PDF:", error);
                    alert("Si è verificato un errore nella creazione del PDF. Prova a utilizzare la funzione di stampa del browser.");
                    
                    // Rimuovi eventuali stili aggiunti
                    document.head.removeChild(style);
                }
            }).catch(error => {
                console.error("Errore nella cattura HTML:", error);
                alert("Si è verificato un errore nella creazione del PDF. Prova a utilizzare la funzione di stampa del browser.");
                
                // Rimuovi eventuali stili aggiunti
                const addedStyles = document.head.querySelectorAll('style');
                if (addedStyles.length > 0) {
                    document.head.removeChild(addedStyles[addedStyles.length - 1]);
                }
            });
        } catch (error) {
            console.error("Errore nell'inizializzazione jsPDF:", error);
            alert("Si è verificato un errore nella creazione del PDF. Prova a utilizzare la funzione di stampa del browser.");
        }
    }, 500);
}