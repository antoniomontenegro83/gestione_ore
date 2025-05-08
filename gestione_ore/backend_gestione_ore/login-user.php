<?php
session_start();
$_SESSION['user'] = [
  'id' => 2,
  'username' => 'utente',
  'ruolo' => 'user'
];
header("Location: ../frontend/shifts-management.html");
exit;
?>
