<?php
/**
 * Calculator.php - Funzioni per il calcolo delle ore lavorative
 */

/**
 * Verifica se una data è festiva
 * @param string $data - Data in formato Y-m-d
 * @return boolean
 */
function isFestivo($data) {
    // Array con le festività italiane fisse (formato mm-dd)
    $festiviFissi = [
        '01-01', // Capodanno
        '01-06', // Epifania
        '04-25', // Festa della Liberazione
        '05-01', // Festa del Lavoro
        '06-02', // Festa della Repubblica
        '08-15', // Ferragosto
        '11-01', // Ognissanti
        '12-08', // Immacolata Concezione
        '12-25', // Natale
        '12-26'  // Santo Stefano
    ];
    
    $date = new DateTime($data);
    $dayMonth = $date->format('m-d');
    $dayOfWeek = $date->format('w'); // 0 = domenica
    
    // È festivo se è domenica o se è una festività fissa
    return $dayOfWeek == 0 || in_array($dayMonth, $festiviFissi);
}

/**
 * Calcola la Pasqua per un dato anno (algoritmo di Gauss)
 * @param int $anno - Anno
 * @return DateTime
 */
function calcolaPasqua($anno) {
    $a = $anno % 19;
    $b = floor($anno / 100);
    $c = $anno % 100;
    $d = floor($b / 4);
    $e = $b % 4;
    $f = floor(($b + 8) / 25);
    $g = floor(($b - $f + 1) / 3);
    $h = (19 * $a + $b - $d - $g + 15) % 30;
    $i = floor($c / 4);
    $k = $c % 4;
    $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
    $m = floor(($a + 11 * $h + 22 * $l) / 451);
    $n = floor(($h + $l - 7 * $m + 114) / 31);
    $p = ($h + $l - 7 * $m + 114) % 31;
    
    $giorno = $p + 1;
    $mese = $n;
    
    return new DateTime("$anno-$mese-$giorno");
}

/**
 * Verifica se una data è Pasquetta
 * @param string $data - Data in formato Y-m-d
 * @return boolean
 */
function isPasquetta($data) {
    $date = new DateTime($data);
    $anno = $date->format('Y');
    $pasqua = calcolaPasqua($anno);
    $pasquetta = clone $pasqua;
    $pasquetta->modify('+1 day');
    
    return $date->format('Y-m-d') == $pasquetta->format('Y-m-d');
}

/**
 * Calcola le ore lavorate divise per categoria
 * @param string $entryDate - Data di ingresso (Y-m-d)
 * @param string $entryTime - Ora di ingresso (H:i:s)
 * @param string $exitDate - Data di uscita (Y-m-d)
 * @param string $exitTime - Ora di uscita (H:i:s)
 * @return array
 */
function calcolaOreLavorate($entryDate, $entryTime, $exitDate, $exitTime) {
    // Crea i timestamp di inizio e fine
    $inizio = new DateTime("$entryDate $entryTime");
    $fine = new DateTime("$exitDate $exitTime");
    
    // Inizializza i contatori
    $feriali_diurne = 0;
    $feriali_notturne = 0;
    $festive_diurne = 0;
    $festive_notturne = 0;
    
    // Clona l'inizio per non modificare l'originale
    $current = clone $inizio;
    
    // Itera ora per ora
    while ($current < $fine) {
        $prossimo = clone $current;
        $prossimo->modify('+1 hour');
        
        // Se il prossimo timestamp supera la fine, usa la fine
        if ($prossimo > $fine) {
            $prossimo = clone $fine;
        }
        
        // Calcola la differenza in ore
        $diff = $current->diff($prossimo);
        $ore = $diff->h + ($diff->i / 60) + ($diff->s / 3600);
        
        // Determina l'ora del giorno e se è festivo
        $ora = (int) $current->format('H');
        $giornoCorrente = $current->format('Y-m-d');
        $isFestivo = isFestivo($giornoCorrente) || isPasquetta($giornoCorrente);
        
        // Classifica le ore
        if ($isFestivo) {
            // Giorno festivo
            if ($ora >= 6 && $ora < 22) {
                $festive_diurne += $ore;
            } else {
                $festive_notturne += $ore;
            }
        } else {
            // Giorno feriale
            if ($ora >= 6 && $ora < 22) {
                $feriali_diurne += $ore;
            } else {
                $feriali_notturne += $ore;
            }
        }
        
        // Avanza all'ora successiva
        $current = $prossimo;
    }
    
    // Arrotonda i risultati a 2 decimali
    return [
        "feriali_diurne" => round($feriali_diurne, 2),
        "feriali_notturne" => round($feriali_notturne, 2),
        "festive_diurne" => round($festive_diurne, 2),
        "festive_notturne" => round($festive_notturne, 2)
    ];
}

/**
 * Calcola le ore per turni che attraversano giorni diversi
 * @param string $entryDate - Data di ingresso
 * @param string $entryTime - Ora di ingresso
 * @param string $exitDate - Data di uscita
 * @param string $exitTime - Ora di uscita
 * @return array
 */
function calcolaOreTurnoMultigiorno($entryDate, $entryTime, $exitDate, $exitTime) {
    $inizio = new DateTime("$entryDate $entryTime");
    $fine = new DateTime("$exitDate $exitTime");
    
    // Inizializza i contatori
    $risultato = [
        "feriali_diurne" => 0,
        "feriali_notturne" => 0,
        "festive_diurne" => 0,
        "festive_notturne" => 0,
        "giorni_attraversati" => []
    ];
    
    $current = clone $inizio;
    
    while ($current <= $fine) {
        $giornoCorrente = $current->format('Y-m-d');
        
        // Se non abbiamo ancora registrato questo giorno
        if (!in_array($giornoCorrente, $risultato['giorni_attraversati'])) {
            $risultato['giorni_attraversati'][] = $giornoCorrente;
        }
        
        // Calcola fino alla fine del giorno corrente o fino alla fine del turno
        $fineDiGiornata = new DateTime($giornoCorrente . ' 23:59:59');
        $limiteCalcolo = ($fineDiGiornata < $fine) ? $fineDiGiornata : $fine;
        
        // Calcola le ore per questo segmento
        $oreSegmento = calcolaOreLavorate(
            $current->format('Y-m-d'),
            $current->format('H:i:s'),
            $limiteCalcolo->format('Y-m-d'),
            $limiteCalcolo->format('H:i:s')
        );
        
        // Somma al risultato totale
        foreach ($oreSegmento as $tipo => $ore) {
            $risultato[$tipo] += $ore;
        }
        
        // Passa al giorno successivo
        $current = clone $limiteCalcolo;
        $current->modify('+1 second');
    }
    
    return $risultato;
}

// Funzione helper per convertire ore decimali in formato hh:mm
function formatOreToHHMM($ore_decimali) {
    $ore = floor($ore_decimali);
    $minuti = round(($ore_decimali - $ore) * 60);
    return sprintf("%02d:%02d", $ore, $minuti);
}

// Test della funzione (opzionale, può essere commentato)
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    // Test con un esempio
    $result = calcolaOreLavorate('2025-01-13', '08:00:00', '2025-01-13', '17:00:00');
    echo "<pre>";
    print_r($result);
    echo "</pre>";
}
?>