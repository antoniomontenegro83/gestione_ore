<?php
require_once 'calculator.php';

echo "<h1>Test Calcolo Ore - Verifica Precisione</h1>";

// Test 1: Il tuo esempio specifico
echo "<h2>Test 1: 09:05 - 10:08</h2>";
$test1 = calcolaOreLavorate('2025-01-13', '09:05:00', '2025-01-13', '10:08:00');
echo "<pre>";
echo "Ingresso: 09:05\n";
echo "Uscita: 10:08\n";
echo "Durata: 1 ora e 3 minuti (1.05 ore decimali)\n\n";
echo "Risultato calcolato:\n";
print_r($test1);
$totale1 = array_sum($test1);
echo "\nTotale ore: " . $totale1 . " (dovrebbe essere 1.05)\n";
echo "Verifica: " . ($totale1 == 1.05 ? "✓ CORRETTO" : "✗ ERRORE");
echo "</pre><hr>";

// Test 2: Altri esempi
echo "<h2>Test 2: Mezz'ora esatta</h2>";
$test2 = calcolaOreLavorate('2025-01-13', '09:00:00', '2025-01-13', '09:30:00');
echo "<pre>";
echo "Ingresso: 09:00\n";
echo "Uscita: 09:30\n";
echo "Durata: 30 minuti (0.5 ore)\n\n";
print_r($test2);
$totale2 = array_sum($test2);
echo "\nTotale ore: " . $totale2 . " (dovrebbe essere 0.5)\n";
echo "Verifica: " . ($totale2 == 0.5 ? "✓ CORRETTO" : "✗ ERRORE");
echo "</pre><hr>";

// Test 3: 15 minuti
echo "<h2>Test 3: 15 minuti</h2>";
$test3 = calcolaOreLavorate('2025-01-13', '09:00:00', '2025-01-13', '09:15:00');
echo "<pre>";
echo "Ingresso: 09:00\n";
echo "Uscita: 09:15\n";
echo "Durata: 15 minuti (0.25 ore)\n\n";
print_r($test3);
$totale3 = array_sum($test3);
echo "\nTotale ore: " . $totale3 . " (dovrebbe essere 0.25)\n";
echo "Verifica: " . ($totale3 == 0.25 ? "✓ CORRETTO" : "✗ ERRORE");
echo "</pre><hr>";

// Test 4: 2 ore e 45 minuti
echo "<h2>Test 4: 2 ore e 45 minuti</h2>";
$test4 = calcolaOreLavorate('2025-01-13', '08:15:00', '2025-01-13', '11:00:00');
echo "<pre>";
echo "Ingresso: 08:15\n";
echo "Uscita: 11:00\n";
echo "Durata: 2 ore e 45 minuti (2.75 ore)\n\n";
print_r($test4);
$totale4 = array_sum($test4);
echo "\nTotale ore: " . $totale4 . " (dovrebbe essere 2.75)\n";
echo "Verifica: " . ($totale4 == 2.75 ? "✓ CORRETTO" : "✗ ERRORE");
echo "</pre><hr>";

// Test 5: Turno notturno che attraversa la mezzanotte
echo "<h2>Test 5: Turno notturno (22:30 - 06:15 giorno dopo)</h2>";
$test5 = calcolaOreLavorate('2025-01-13', '22:30:00', '2025-01-14', '06:15:00');
echo "<pre>";
echo "Ingresso: 22:30 del 13/01\n";
echo "Uscita: 06:15 del 14/01\n";
echo "Durata: 7 ore e 45 minuti (7.75 ore)\n\n";
print_r($test5);
$totale5 = array_sum($test5);
echo "\nTotale ore: " . $totale5 . " (dovrebbe essere 7.75)\n";
echo "Verifica: " . ($totale5 == 7.75 ? "✓ CORRETTO" : "✗ ERRORE");
echo "</pre><hr>";

// Test 6: Verifica festivi (domenica)
echo "<h2>Test 6: Domenica (festivo)</h2>";
$test6 = calcolaOreLavorate('2025-01-12', '08:00:00', '2025-01-12', '12:00:00');
echo "<pre>";
echo "Data: 12/01/2025 (Domenica)\n";
echo "Ingresso: 08:00\n";
echo "Uscita: 12:00\n";
echo "Durata: 4 ore\n\n";
print_r($test6);
echo "\nDovrebbero essere tutte ore festive diurne\n";
echo "Verifica: " . ($test6['festive_diurne'] == 4 ? "✓ CORRETTO" : "✗ ERRORE");
echo "</pre>";
?>