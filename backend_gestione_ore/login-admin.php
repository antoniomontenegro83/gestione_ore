<?php
session_start();
$_SESSION['user'] = [
  'id' => 1,
  'username' => 'admin',
  'ruolo' => 'admin'
];
header("Location: ../frontend/shifts-management.html");
exit;
?>
