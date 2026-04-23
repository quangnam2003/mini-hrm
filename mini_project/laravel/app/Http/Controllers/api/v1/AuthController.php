<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginAuthRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\User;
use App\Services\UploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|string|email|max:255|unique:users",
            "password" => "required|string|min:6",
        ]);

        $emp_code = "EMP" . date("Y") . str_pad(User::count() + 1, 3, '0', STR_PAD_LEFT);

        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => bcrypt($request->password),
            "role" => $request->role,
            "empCode" => $emp_code,
            "is_active" => $request->is_active ?? 1,
        ]);

        return response()->json([
            "message" => "User created successfully",
            "user" => $user,
        ], 201);
    }

    public function login(LoginAuthRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (! $token = $this->guard()->attempt($credentials)) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Email hoặc mật khẩu không chính xác.'
            ], 401);
        }

        if ($this->guard()->user()->is_active != 1) {
            $this->guard()->logout();
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Tài khoản của bạn đã bị khóa.'
            ], 403);
        }
        return $this->respondWithToken($token);
    }

    public function profile()
    {
        return response()->json($this->guard()->user());
    }




    public function updateProfile(Request $request, UploadService $uploadService)
    {
        /** @var \App\Models\User $user */
        $user = $this->guard()->user();

        $data = $request->validate([
            "name"    => "sometimes|string|max:255",
            "phone"   => "sometimes|string|max:255",
            "avatar"  => "sometimes|image|mimes:jpeg,png,jpg,gif|max:2048",
            "address" => "sometimes|string|max:255",
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $uploadService->deleteFile($user->avatar);
            }

            $image = $uploadService->uploadFile($request->file('avatar'), 'avatars', 500, 500);
            $data['avatar'] = $image['path'];
        }

        $user->update($data);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công.',
            'user'    => new EmployeeResource($user),
        ]);
    }

    public function changePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $this->guard()->user();
        $data = $request->validate([
            "old_password" => "required|string|min:6",
            "new_password" => "required|string|min:6|confirmed",
        ]);
        if (!Hash::check($data['old_password'], $user->password)) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Mật khẩu cũ không chính xác.'
            ], 401);
        }
        $user->update([
            'password' => bcrypt($data['new_password']),
        ]);
        return response()->json([
            'message' => 'Đổi mật khẩu thành công.',
        ]);
    }

    public function logout()
    {
        $this->guard()->logout();
        $cookie = cookie()->forget('access_token');
        return response()->json(['message' => 'Đăng xuất thành công'])->withCookie($cookie);
    }

    public function refresh()
    {
        return $this->respondWithToken($this->guard()->refresh());
    }

    protected function respondWithToken($token)
    {
        $minutes = $this->guard()->factory()->getTTL();
        $cookie = cookie(
            'access_token',
            $token,
            $minutes,
            '/',
            null,
            false,
            true,
            false,
            'Lax'
        );

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $minutes * 60,
            'user' => new EmployeeResource($this->guard()->user())
        ])->withCookie($cookie);
    }

    /**
     * Get the guard to be used during authentication.
     *
     * @return \Illuminate\Contracts\Auth\Guard|\Illuminate\Contracts\Auth\StatefulGuard|\Tymon\JWTAuth\JWTGuard
     */
    protected function guard()
    {
        return auth('api');
    }
}
