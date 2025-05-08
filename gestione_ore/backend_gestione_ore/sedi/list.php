<?php
require_once '../db.php';
$stmt = $pdo->query("SELECT id, nome FROM sedi ORDER BY nome");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>