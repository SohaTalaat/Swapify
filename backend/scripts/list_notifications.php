<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$ids = $argv;
array_shift($ids);
if (empty($ids)) {
    $ids = [1, 2];
}
foreach ($ids as $id) {
    $u = User::find($id);
    if (!$u) {
        echo "User {$id} not found\n";
        continue;
    }
    echo "Notifications for user {$id} ({$u->username}):\n";
    $n = $u->notifications()->orderByDesc('created_at')->take(10)->get();
    foreach ($n as $notif) {
        echo $notif->id . ' | ' . $notif->type . ' | ' . json_encode($notif->data) . ' | ' . $notif->created_at . "\n";
    }
    echo "---\n";
}
