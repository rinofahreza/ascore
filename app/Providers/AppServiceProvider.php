<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
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
        // Force HTTPS URLs when behind a proxy (like ngrok)
        if (
            request()->header('X-Forwarded-Proto') === 'https' ||
            request()->header('X-Forwarded-Ssl') === 'on' ||
            str_contains(request()->header('Host', ''), 'ngrok')
        ) {
            \URL::forceScheme('https');
        }

        // Implicitly grant "Admin" all permissions
        // This works for any check like Gate::allows('cabang.view') or @can('cabang.view')
        Gate::before(function ($user, $ability) {
            if ($user->role && $user->role->nama === 'Admin') {
                return true;
            }
        });

        // Dynamically register permissions
        try {
            if (Schema::hasTable('permissions')) {
                foreach (Permission::all() as $permission) {
                    Gate::define($permission->name, function ($user) use ($permission) {
                        return $user->hasPermission($permission->name);
                    });
                }
            }
        } catch (\Exception $e) {
            // Failsafe for initial migrations/setup where table might not exist
        }

        Vite::prefetch(concurrency: 3);
    }
}
