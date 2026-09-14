<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuração - tudo aqui em cima
$rotationInterval = 86400; // Deve aparecer no output
echo "rotationInterval definido: " . $rotationInterval . "<br>";

require_once 'encrypt_json.php'; // Se isto falhar, vais ver o erro aqui

echo "Chegou ao fim sem erro.<br>";
echo "Se não viste o valor 86400 acima, o require falhou antes.";
?>