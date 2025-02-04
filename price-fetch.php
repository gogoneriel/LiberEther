<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$priceFile = "current_price.txt";
$price = file_exists($priceFile) ? file_get_contents($priceFile) : "0.46";

echo json_encode(['price' => floatval($price)]);
?>