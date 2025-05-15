<?php
session_start();
header("Content-Type: text/plain");

if (isset($_SESSION['user'])) {
    print_r($_SESSION['user']);
} else {
    echo "Nessuna sessione utente attiva.";
}
?>
