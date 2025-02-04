<?php
$adminPassword = "Gogoneriel"; // Change this password
$priceFile = "current_price.txt";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['password'] === $adminPassword) {
        file_put_contents($priceFile, $_POST['price']);
        echo "Price updated successfully!";
    } else {
        echo "Invalid password";
    }
}

$currentPrice = file_exists($priceFile) ? file_get_contents($priceFile) : "0.46";
?>

<!DOCTYPE html>
<html>
<head>
    <title>LETH Price Admin</title>
    <style>
        body { max-width: 400px; margin: 40px auto; padding: 20px; font-family: Arial; }
        input, button { padding: 10px; margin: 10px 0; width: 100%; }
        button { background: #FF2400; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h2>Update LETH Price</h2>
    <form method="post">
        <input type="password" name="password" placeholder="Admin Password" required>
        <input type="number" name="price" step="0.01" value="<?php echo $currentPrice; ?>" required>
        <button type="submit">Update Price</button>
    </form>
</body>
</html>