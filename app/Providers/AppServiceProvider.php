<?php

namespace App\Providers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

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
        Validator::extend('custom_location', function ($attribute, $value, $parameters, $validator) {
            // Check if the location starts with "K" or "k"
            if (strtolower(substr($value, 0, 1)) !== 'k') {
                return false;
            }

            $k = intval(substr($value, 1)); // Extracting the numeric part after 'K'
            if (!($k > -1 && $k <= 48)) {
                return false;
            }

            return true;
        });
    }
}
