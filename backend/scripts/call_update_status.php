<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\BarterController;
use Illuminate\Support\Facades\Auth;

$id = $argv[1] ?? null;
$status = $argv[2] ?? 'accepted';
if (!$id) {
    echo "Usage: php call_update_status.php {barter_id} [status]\n";
    exit(1);
}

$req = Request::create('/', 'PUT', ['status' => $status]);
// login as admin (id 1) for controller auth checks
Auth::loginUsingId(1);
$ctrl = new BarterController();
$res = $ctrl->updateStatus($req, $id);
if (is_object($res) && method_exists($res, 'getContent')) {
    echo $res->getContent() . PHP_EOL;
} else {
    var_dump($res);
}
