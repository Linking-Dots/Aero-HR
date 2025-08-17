<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class TenantStorageService
{
    /**
     * Create tenant-specific storage directories
     */
    public function createTenantStorage(Tenant $tenant): bool
    {
        try {
            tenancy()->initialize($tenant);
            
            // Create tenant-specific directories
            $directories = [
                'tenant-files',
                'tenant-files/documents',
                'tenant-files/uploads',
                'tenant-files/exports',
                'tenant-files/temp',
                'tenant-files/profile-photos',
                'tenant-files/company-assets'
            ];

            foreach ($directories as $directory) {
                Storage::disk('public')->makeDirectory($directory);
            }

            Log::info('Tenant storage created', [
                'tenant_id' => $tenant->id,
                'directories' => count($directories)
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to create tenant storage', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            return false;
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Get tenant storage usage statistics
     */
    public function getTenantStorageStats(Tenant $tenant): array
    {
        try {
            tenancy()->initialize($tenant);
            
            $totalSize = 0;
            $fileCount = 0;
            $directories = [];

            $storagePath = Storage::disk('public')->path('tenant-files');
            
            if (File::exists($storagePath)) {
                $files = File::allFiles($storagePath);
                $fileCount = count($files);
                
                foreach ($files as $file) {
                    $totalSize += $file->getSize();
                }

                // Get directory-specific stats
                $subDirs = ['documents', 'uploads', 'exports', 'profile-photos', 'company-assets'];
                foreach ($subDirs as $dir) {
                    $dirPath = $storagePath . '/' . $dir;
                    if (File::exists($dirPath)) {
                        $dirFiles = File::allFiles($dirPath);
                        $dirSize = array_sum(array_map(fn($f) => $f->getSize(), $dirFiles));
                        $directories[$dir] = [
                            'size' => $dirSize,
                            'file_count' => count($dirFiles),
                            'size_human' => $this->formatBytes($dirSize)
                        ];
                    }
                }
            }

            return [
                'total_size' => $totalSize,
                'total_size_human' => $this->formatBytes($totalSize),
                'file_count' => $fileCount,
                'directories' => $directories,
                'last_checked' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get tenant storage stats', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'total_size' => 0,
                'total_size_human' => '0 B',
                'file_count' => 0,
                'directories' => [],
                'error' => $e->getMessage()
            ];
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Clean up tenant storage on deletion
     */
    public function cleanupTenantStorage(Tenant $tenant): bool
    {
        try {
            tenancy()->initialize($tenant);
            
            // Remove tenant-specific storage
            Storage::disk('public')->deleteDirectory('tenant-files');
            
            Log::info('Tenant storage cleaned up', [
                'tenant_id' => $tenant->id
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to cleanup tenant storage', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            return false;
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Create tenant backup
     */
    public function createTenantBackup(Tenant $tenant): ?string
    {
        try {
            tenancy()->initialize($tenant);
            
            $backupName = "tenant-{$tenant->id}-backup-" . now()->format('Y-m-d-H-i-s') . '.tar.gz';
            $backupPath = storage_path('app/backups/' . $backupName);
            
            // Ensure backup directory exists
            File::ensureDirectoryExists(dirname($backupPath));
            
            $storagePath = Storage::disk('public')->path('tenant-files');
            
            if (File::exists($storagePath)) {
                // Create tar.gz backup of tenant files
                $command = "tar -czf {$backupPath} -C " . dirname($storagePath) . " " . basename($storagePath);
                exec($command, $output, $returnCode);
                
                if ($returnCode === 0) {
                    Log::info('Tenant backup created', [
                        'tenant_id' => $tenant->id,
                        'backup_file' => $backupName,
                        'backup_size' => File::size($backupPath)
                    ]);
                    
                    return $backupName;
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Failed to create tenant backup', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            return null;
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $size, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }
}
