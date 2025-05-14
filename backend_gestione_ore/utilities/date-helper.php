<?php
/**
 * date-helper.php - Funzioni di utilità per la gestione di date e orari
 */

/**
 * Converte minuti in formato ore decimali
 * @param int $minuti - Numero di minuti
 * @return float - Ore decimali
 */
function minutiInOre($minuti) {
    return round($minuti / 60, 2);
}

/**
 * Converte ore decimali in minuti
 * @param float $ore - Ore decimali
 * @return int - Minuti
 */
function oreInMinuti($ore) {
    return round($ore * 60);
}

/**
 * Formatta un'ora decimale in formato leggibile
 * @param float $ore - Ore decimali
 * @return string - Formato "X ore e Y minuti"
 */
function formattaOreLeggibile($ore) {
    $ore_intere = floor($ore);
    $minuti = round(($ore - $ore_intere) * 60);
    
    if ($ore_intere == 0) {
        return $minuti . " minuti";
    } elseif ($minuti == 0) {
        return $ore_intere . " ore";
    } else {
        return $ore_intere . " ore e " . $minuti . " minuti";
    }
}

/**
 * Calcola la differenza tra due date/ore in minuti
 * @param string $data_inizio - Data inizio (Y-m-d)
 * @param string $ora_inizio - Ora inizio (H:i:s)
 * @param string $data_fine - Data fine (Y-m-d)
 * @param string $ora_fine - Ora fine (H:i:s)
 * @return int - Differenza in minuti
 */
function differenzaInMinuti($data_inizio, $ora_inizio, $data_fine, $ora_fine) {
    $inizio = new DateTime("$data_inizio $ora_inizio");
    $fine = new DateTime("$data_fine $ora_fine");
    
    if ($fine < $inizio) {
        return 0;
    }
    
    $differenza = $fine->getTimestamp() - $inizio->getTimestamp();
    return $differenza / 60;
}

/**
 * Verifica se un orario è notturno (22:00 - 06:00)
 * @param int $ora - Ora (0-23)
 * @return boolean
 */
function isOrarioNotturno($ora) {
    return $ora < 6 || $ora >= 22;
}

/**
 * Verifica se un orario è diurno (06:00 - 22:00)
 * @param int $ora - Ora (0-23)
 * @return boolean
 */
function isOrarioDiurno($ora) {
    return $ora >= 6 && $ora < 22;
}

/**
 * Ottiene il giorno della settimana in italiano
 * @param string $data - Data in formato Y-m-d
 * @return string - Nome del giorno in italiano
 */
function giornoSettimanaItaliano($data) {
    $giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    $date = new DateTime($data);
    return $giorni[$date->format('w')];
}

/**
 * Formatta una data in italiano
 * @param string $data - Data in formato Y-m-d
 * @return string - Data formattata (es. "13 Gennaio 2025")
 */
function formattaDataItaliano($data) {
    $mesi = [
        1 => 'Gennaio', 2 => 'Febbraio', 3 => 'Marzo', 4 => 'Aprile',
        5 => 'Maggio', 6 => 'Giugno', 7 => 'Luglio', 8 => 'Agosto',
        9 => 'Settembre', 10 => 'Ottobre', 11 => 'Novembre', 12 => 'Dicembre'
    ];
    
    $date = new DateTime($data);
    $giorno = $date->format('j');
    $mese = $mesi[(int)$date->format('n')];
    $anno = $date->format('Y');
    
    return "$giorno $mese $anno";
}
?>