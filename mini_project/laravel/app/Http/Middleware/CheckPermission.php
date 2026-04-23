<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Kiểm tra user có permission theo module:action không.
     *
     * Sử dụng: middleware('permission:employee,create')
     */
    public function handle(Request $request, Closure $next, string $module, string $action): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$user->hasPermission($module, $action)) {
            return response()->json([
                'message' => 'Bạn không có quyền thực hiện hành động này.',
                'required' => "{$module}:{$action}",
            ], 403);
        }

        return $next($request);
    }
}
