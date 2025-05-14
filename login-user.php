<?php
session_start();
$_SESSION['user'] = [
  'id' => 2,
  'username' => 'utente',
  'ruolo' => 'user'
];
header("Location: ../shifts-management.html");
?>