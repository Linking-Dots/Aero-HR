<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Facades\Tenancy;

class ApiKeyController extends Controller
{
    /**
     * Generate new API key
     */
    public function generate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'in:read,write,delete,all'
        ]);

        $tenant = Tenancy::tenant();

        try {
            $apiKey = ApiKey::generate(
                $tenant->id,
                $request->name,
                $request->permissions
            );

            return redirect()->back()->with('success', 'API key generated successfully!');
        } catch (\Exception $e) {
            Log::error('API key generation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to generate API key. Please try again.');
        }
    }

    /**
     * Revoke API key
     */
    public function revoke(ApiKey $apiKey)
    {
        $tenant = Tenancy::tenant();

        // Ensure the API key belongs to the current tenant
        if ($apiKey->tenant_id !== $tenant->id) {
            abort(404);
        }

        try {
            $apiKey->revoke();
            
            return redirect()->back()->with('success', 'API key revoked successfully!');
        } catch (\Exception $e) {
            Log::error('API key revocation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to revoke API key. Please try again.');
        }
    }

    /**
     * Update API key permissions
     */
    public function updatePermissions(Request $request, ApiKey $apiKey)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'in:read,write,delete,all'
        ]);

        $tenant = Tenancy::tenant();

        // Ensure the API key belongs to the current tenant
        if ($apiKey->tenant_id !== $tenant->id) {
            abort(404);
        }

        try {
            $apiKey->update([
                'permissions' => $request->permissions
            ]);
            
            return redirect()->back()->with('success', 'API key permissions updated successfully!');
        } catch (\Exception $e) {
            Log::error('API key update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update API key. Please try again.');
        }
    }
}
