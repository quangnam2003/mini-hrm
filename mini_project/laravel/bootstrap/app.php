<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\JwtFromCookie;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: [
            'access_token',
        ]);
        $middleware->api(prepend: [
            JwtFromCookie::class,
        ]);
        $middleware->alias([
            'permission' => CheckPermission::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('attendance:mark-absent')->dailyAt('23:59');
        $schedule->command('app:auto-generate-calendar')->daily();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
