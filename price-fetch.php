<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$priceFile = "current_price.txt";
$price = file_exists($priceFile) ? file_get_contents($priceFile) : "0.46";

echo json_encode(['price' => floatval($price)]);
?>