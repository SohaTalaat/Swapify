<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::ignoreRoutes();

        // Disable all default Fortify views
        Fortify::loginView(fn() => abort(404));
        Fortify::registerView(fn() => abort(404));
        Fortify::requestPasswordResetLinkView(fn() => abort(404));
        Fortify::resetPasswordView(fn() => abort(404));
        Fortify::verifyEmailView(fn() => abort(404));
        Fortify::twoFactorChallengeView(fn() => abort(404));


        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorAuthenticatable::class);

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // Allow login using username
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)
                ->orwhere('username', $request->email)
                ->first();

            if ($user && Hash::check($request->password, $user->password)) {
                return $user;
            }

            return null;
        });

        // Custom Login Response
        app()->singleton(LoginResponse::class, function () {
            return new class implements LoginResponse {
                public function toResponse($request)
                {

                    /** @var \App\Models\User $user */
                    $user = Auth::user();

                    // Last login timestamp
                    $user->last_login_at = now();
                    $user->save();


                    // Create token

                    $token = $user->createToken('swapify_token')->plainTextToken;

                    return response()->json([
                        'message' => 'Login successful',
                        'token' => $token,
                        'user' => $user,
                    ], 200);
                }
            };
        });
    }
}
