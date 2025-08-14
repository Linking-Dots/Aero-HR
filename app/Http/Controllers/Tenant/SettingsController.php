<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\UsageTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stancl\Tenancy\Facades\Tenancy;

class SettingsController extends Controller
{
    public function __construct(
        private UsageTrackingService $usageService
    ) {}

    /**
     * Show tenant settings page
     */
    public function index()
    {
        $tenant = Tenancy::tenant();
        
        // Get timezones
        $timezones = $this->getTimezones();
        
        // Get currencies
        $currencies = $this->getCurrencies();
        
        // Get available integrations
        $integrations = $this->getAvailableIntegrations();
        
        // Get API keys
        $apiKeys = $this->getApiKeys($tenant);

        return Inertia::render('Dashboard/Settings', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'domain' => $tenant->domain,
                'description' => $tenant->settings['description'] ?? '',
                'website' => $tenant->settings['website'] ?? '',
                'phone' => $tenant->settings['phone'] ?? '',
                'address' => $tenant->settings['address'] ?? '',
                'timezone' => $tenant->settings['timezone'] ?? 'UTC',
                'currency' => $tenant->settings['currency'] ?? 'USD',
                'date_format' => $tenant->settings['date_format'] ?? 'Y-m-d',
                'time_format' => $tenant->settings['time_format'] ?? '24',
                'language' => $tenant->settings['language'] ?? 'en',
                'logo_url' => $tenant->settings['logo_url'] ?? null,
                'settings' => $tenant->settings ?? []
            ],
            'timezones' => $timezones,
            'currencies' => $currencies,
            'integrations' => $integrations,
            'apiKeys' => $apiKeys
        ]);
    }

    /**
     * Update tenant settings
     */
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:tenants,domain,' . Tenancy::tenant()->id,
            'description' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'timezone' => 'required|string|max:50',
            'currency' => 'required|string|max:3',
            'date_format' => 'required|string|max:10',
            'time_format' => 'required|string|in:12,24',
            'language' => 'required|string|max:5',
            'logo' => 'nullable|image|max:2048', // 2MB max
            // Notification settings
            'email_notifications' => 'boolean',
            'browser_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
            // Security settings
            'two_factor_required' => 'boolean',
            'session_timeout' => 'required|integer|min:15|max:480',
            'allowed_domains' => 'nullable|string|max:500',
            // Integration settings
            'slack_webhook' => 'nullable|url|max:255',
            'webhook_url' => 'nullable|url|max:255'
        ]);

        $tenant = Tenancy::tenant();
        $settings = $tenant->settings ?? [];

        try {
            // Handle logo upload
            if ($request->hasFile('logo')) {
                $logoPath = $this->uploadLogo($request->file('logo'), $tenant);
                $settings['logo_url'] = $logoPath;
            }

            // Update basic information
            $tenant->update([
                'name' => $request->name,
                'domain' => $request->domain,
            ]);

            // Update settings
            $settings = array_merge($settings, [
                'description' => $request->description,
                'website' => $request->website,
                'phone' => $request->phone,
                'address' => $request->address,
                'timezone' => $request->timezone,
                'currency' => $request->currency,
                'date_format' => $request->date_format,
                'time_format' => $request->time_format,
                'language' => $request->language,
                // Notification settings
                'email_notifications' => $request->boolean('email_notifications'),
                'browser_notifications' => $request->boolean('browser_notifications'),
                'marketing_emails' => $request->boolean('marketing_emails'),
                // Security settings
                'two_factor_required' => $request->boolean('two_factor_required'),
                'session_timeout' => $request->session_timeout,
                'allowed_domains' => $request->allowed_domains,
                // Integration settings
                'slack_webhook' => $request->slack_webhook,
                'webhook_url' => $request->webhook_url,
            ]);

            $tenant->update(['settings' => $settings]);

            return redirect()->back()->with('success', 'Settings updated successfully!');
        } catch (\Exception $e) {
            Log::error('Settings update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update settings. Please try again.');
        }
    }

    /**
     * Get available timezones
     */
    private function getTimezones(): array
    {
        return [
            ['value' => 'UTC', 'label' => 'UTC'],
            ['value' => 'America/New_York', 'label' => 'Eastern Time (ET)'],
            ['value' => 'America/Chicago', 'label' => 'Central Time (CT)'],
            ['value' => 'America/Denver', 'label' => 'Mountain Time (MT)'],
            ['value' => 'America/Los_Angeles', 'label' => 'Pacific Time (PT)'],
            ['value' => 'Europe/London', 'label' => 'Greenwich Mean Time (GMT)'],
            ['value' => 'Europe/Paris', 'label' => 'Central European Time (CET)'],
            ['value' => 'Asia/Tokyo', 'label' => 'Japan Standard Time (JST)'],
            ['value' => 'Asia/Shanghai', 'label' => 'China Standard Time (CST)'],
            ['value' => 'Asia/Kolkata', 'label' => 'India Standard Time (IST)'],
            ['value' => 'Australia/Sydney', 'label' => 'Australian Eastern Time (AET)'],
        ];
    }

    /**
     * Get available currencies
     */
    private function getCurrencies(): array
    {
        return [
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$'],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€'],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£'],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'symbol' => '¥'],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => 'C$'],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'A$'],
            ['code' => 'CHF', 'name' => 'Swiss Franc', 'symbol' => 'CHF'],
            ['code' => 'CNY', 'name' => 'Chinese Yuan', 'symbol' => '¥'],
            ['code' => 'INR', 'name' => 'Indian Rupee', 'symbol' => '₹'],
        ];
    }

    /**
     * Get available integrations
     */
    private function getAvailableIntegrations(): array
    {
        return [
            [
                'id' => 'slack',
                'name' => 'Slack',
                'description' => 'Send notifications to Slack channels',
                'connected' => false // This would check actual connection status
            ],
            [
                'id' => 'teams',
                'name' => 'Microsoft Teams',
                'description' => 'Integrate with Microsoft Teams',
                'connected' => false
            ],
            [
                'id' => 'google_workspace',
                'name' => 'Google Workspace',
                'description' => 'Sync with Google Calendar and Drive',
                'connected' => false
            ],
            [
                'id' => 'outlook',
                'name' => 'Microsoft Outlook',
                'description' => 'Calendar and email integration',
                'connected' => false
            ]
        ];
    }

    /**
     * Get tenant API keys
     */
    private function getApiKeys(Tenant $tenant): array
    {
        // This would fetch from an api_keys table
        // For now, return empty array or implement based on your API key model
        try {
            if (class_exists(\App\Models\ApiKey::class)) {
                return \App\Models\ApiKey::where('tenant_id', $tenant->id)
                    ->get()
                    ->map(function ($key) {
                        return [
                            'id' => $key->id,
                            'name' => $key->name,
                            'key' => $key->key,
                            'permissions' => $key->permissions ?? ['read'],
                            'created_at' => $key->created_at->toISOString(),
                            'last_used_at' => $key->last_used_at?->toISOString(),
                        ];
                    })
                    ->toArray();
            }
            
            return [];
        } catch (\Exception $e) {
            Log::warning("Could not fetch API keys: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Upload tenant logo
     */
    private function uploadLogo($file, Tenant $tenant): string
    {
        $filename = 'tenant-' . $tenant->id . '-logo.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('tenant-logos', $filename, 'public');
        
        // Delete old logo if exists
        if (isset($tenant->settings['logo_url'])) {
            Storage::disk('public')->delete($tenant->settings['logo_url']);
        }
        
        return Storage::url($path);
    }
}
