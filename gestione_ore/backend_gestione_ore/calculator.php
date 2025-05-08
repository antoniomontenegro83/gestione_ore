<?php
function isFestivo($data) {
    $festivi = [
        '01-01', '06-01', '25-04', '01-05', '02-06',
        '15-08', '01-11', '08-12', '25-12', '26-12'
    ];
    $date = new DateTime($data);
    $dayMonth = $date->format('d-m');
    $dayOfWeek = $date->format('w'); // 0 = domenica
    return $dayOfWeek == 0 || in_array($dayMonth, $festivi);
}

function calcolaOreLavorate($entryDate, $entryTime, $exitDate, $exitTime) {
    $inizio = new DateTime("$entryDate $entryTime");
    $fine = new DateTime("$exitDate $exitTime");

    $current = clone $inizio;
    $feriali_diurne = 0;
    $feriali_notturne = 0;
    $festive_diurne = 0;
    $festive_notturne = 0;

    while ($current < $fine) {
        $prossimo = clone $current;
        $prossimo->modify('+1 hour');
        if ($prossimo > $fine) {
            $prossimo = $fine;
        }

        $ora = (int) $current->format('H');
        $giornoCorrente = $current->format('Y-m-d');
        $isFestivo = isFestivo($giornoCorrente);
        $minuti = ($prossimo->getTimestamp() - $current->getTimestamp()) / 60;
        $ore = $minuti / 60;

        if ($isFestivo) {
            if ($ora >= 6 && $ora < 22) {
                $festive_diurne += $ore;
            } else {
                $festive_notturne += $ore;
            }
        } else {
            if ($ora >= 6 && $ora < 22) {
                $feriali_diurne += $ore;
            } else {
                $feriali_notturne += $ore;
            }
        }

        $current = $prossimo;
    }

    return [
        "feriali_diurne" => round($feriali_diurne, 2),
        "feriali_notturne" => round($feriali_notturne, 2),
        "festive_diurne" => round($festive_diurne, 2),
        "festive_notturne" => round($festive_notturne, 2),
    ];
}
?>