<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\Admin\AdminShipmentController;

$ctrl = new AdminShipmentController();
$response = $ctrl->index();
if (is_object($response) && method_exists($response, 'getContent')) {
    echo $response->getContent() . PHP_EOL;
} else {
    var_export($response);
}
