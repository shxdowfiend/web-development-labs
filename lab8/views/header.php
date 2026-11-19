<?php /** @var callable $e */ $active = $_GET['action'] ?? 'list'; ?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Книжкова полиця — журнал</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<header class="top">
    <a class="logo" href="index.php">📚 Книжкова полиця</a>
    <nav>
        <a href="index.php?action=create"<?= $active === 'create' ? ' class="active"' : '' ?>>Додати книгу</a>
        <a href="index.php"<?= $active === 'list' ? ' class="active"' : '' ?>>Журнал</a>
    </nav>
</header>
<main>
