<?php /** @var callable $e @var int $status @var string $message */ ?>
<h1>Помилка <?= (int) $status ?></h1>
<p class="card"><?= $e($message) ?> <a href="index.php">Повернутися до журналу.</a></p>
