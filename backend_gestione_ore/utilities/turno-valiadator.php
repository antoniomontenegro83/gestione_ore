<?php
/**
 * turno-validator.php - Funzioni per la validazione dei turni
 */

/**
 * Valida un turno
 * @param string $data_inizio - Data inizio (Y-m-d)
 * @param string $ora_inizio - Ora inizio (H:i:s)
 * @param string $data_fine - Data fine (Y-m-d)
 * @param string $ora_fine - Ora fine (H:i:s)
 * @return array - Array con 'valid' (bool) e 'message' (string)
 */
function validaTurno($data_inizio, $ora_inizio, $data_fine, $ora_fine) {
    try {
        $inizio = new DateTime("$data_inizio $ora_inizio");
        $fine = new DateTime("$data_fine $ora_fine");
        
        // Verifica che la fine sia dopo l'inizio
        if ($fine <= $inizio) {
            return [
                'valid' => false,
                'message' => 'La data/ora di uscita deve essere successiva alla data/ora di ingresso'
            ];
        }
        
        // Verifica che il turno non sia troppo lungo (più di 24 ore)
        $differenza = $fine->getTimestamp() - $inizio->getTimestamp();
        $ore = $differenza / 3600;
        
        if ($ore > 24) {
            return [
                'valid' => false,
                'message' => 'Il turno non può durare più di 24 ore'
            ];
        }
        
        // Verifica che le date non siano nel futuro
        $oggi = new DateTime();
        if ($fine > $oggi) {
            return [
                'valid' => false,
                'message' => 'Non è possibile inserire turni futuri'
            ];
        }
        
        return [
            'valid' => true,
            'message' => 'Turno valido',
            'durata_ore' => round($ore, 2)
        ];
        
    } catch (Exception $e) {
        return [
            'valid' => false,
            'message' => 'Date o orari non validi: ' . $e->getMessage()
        ];
    }
}

/**
 * Verifica se due turni si sovrappongono
 * @param array $turno1 - Array con date e ore del primo turno
 * @param array $turno2 - Array con date e ore del secondo turno
 * @return boolean - true se si sovrappongono
 */
function turniSiSovrappongono($turno1, $turno2) {
    $inizio1 = new DateTime($turno1['data_inizio'] . ' ' . $turno1['ora_inizio']);
    $fine1 = new DateTime($turno1['data_fine'] . ' ' . $turno1['ora_fine']);
    $inizio2 = new DateTime($turno2['data_inizio'] . ' ' . $turno2['ora_inizio']);
    $fine2 = new DateTime($turno2['data_fine'] . ' ' . $turno2['ora_fine']);
    
    // I turni si sovrappongono se uno inizia prima che l'altro finisca
    return $inizio1 < $fine2 && $inizio2 < $fine1;
}

/**
 * Verifica la consistenza dei dati di un turno
 * @param array $datiTurno - Array con i dati del turno
 * @return array - Array con 'valid' (bool) e 'errors' (array)
 */
function validaDatiTurno($datiTurno) {
    $errors = [];
    
    // Campi obbligatori
    $campiObbligatori = ['employee_id', 'entry_date', 'entry_time', 'exit_date', 'exit_time'];
    
    foreach ($campiObbligatori as $campo) {
        if (empty($datiTurno[$campo])) {
            $errors[] = "Il campo '$campo' è obbligatorio";
        }
    }
    
    // Valida il formato delle date
    if (!empty($datiTurno['entry_date']) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $datiTurno['entry_date'])) {
        $errors[] = "Formato data ingresso non valido (richiesto YYYY-MM-DD)";
    }
    
    if (!empty($datiTurno['exit_date']) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $datiTurno['exit_date'])) {
        $errors[] = "Formato data uscita non valido (richiesto YYYY-MM-DD)";
    }
    
    // Valida il formato delle ore
    if (!empty($datiTurno['entry_time']) && !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $datiTurno['entry_time'])) {
        $errors[] = "Formato ora ingresso non valido (richiesto HH:MM:SS)";
    }
    
    if (!empty($datiTurno['exit_time']) && !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $datiTurno['exit_time'])) {
        $errors[] = "Formato ora uscita non valido (richiesto HH:MM:SS)";
    }
    
    // Se non ci sono errori di formato, valida il turno
    if (empty($errors) && !empty($datiTurno['entry_date']) && !empty($datiTurno['exit_date']) 
        && !empty($datiTurno['entry_time']) && !empty($datiTurno['exit_time'])) {
        
        $validazione = validaTurno(
            $datiTurno['entry_date'],
            $datiTurno['entry_time'],
            $datiTurno['exit_date'],
            $datiTurno['exit_time']
        );
        
        if (!$validazione['valid']) {
            $errors[] = $validazione['message'];
        }
    }
    
    return [
        'valid' => empty($errors),
        'errors' => $errors
    ];
}
?>