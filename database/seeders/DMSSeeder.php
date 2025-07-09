<?php

namespace Database\Seeders;

use App\Models\DMS\Category;
use App\Models\DMS\Folder;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DMSSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create DMS permissions
        $permissions = [
            'dms.view' => 'View DMS Dashboard and Documents',
            'dms.create' => 'Create and Upload Documents',
            'dms.update' => 'Update Documents',
            'dms.delete' => 'Delete Documents',
            'dms.manage' => 'Manage Categories and Folders',
            'dms.admin' => 'Admin Access to DMS',
        ];

        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ]);
        }

        // Assign permissions to roles
        $superAdmin = Role::where('name', 'Super Administrator')->first();
        $admin = Role::where('name', 'Administrator')->first();
        $hrManager = Role::where('name', 'HR Manager')->first();

        if ($superAdmin) {
            $superAdmin->givePermissionTo(array_keys($permissions));
        }

        if ($admin) {
            $admin->givePermissionTo(['dms.view', 'dms.create', 'dms.update', 'dms.delete', 'dms.manage']);
        }

        if ($hrManager) {
            $hrManager->givePermissionTo(['dms.view', 'dms.create', 'dms.update', 'dms.manage']);
        }

        // Create default categories
        $categories = [
            [
                'name' => 'HR Documents',
                'description' => 'Human Resources related documents',
                'color' => '#10B981',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Financial Reports',
                'description' => 'Financial statements and reports',
                'color' => '#3B82F6',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Legal Documents',
                'description' => 'Contracts, agreements, and legal documents',
                'color' => '#8B5CF6',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Policies & Procedures',
                'description' => 'Company policies and standard procedures',
                'color' => '#F59E0B',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Training Materials',
                'description' => 'Training documents and educational content',
                'color' => '#EF4444',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Technical Documentation',
                'description' => 'Technical manuals and specifications',
                'color' => '#06B6D4',
                'is_active' => true,
                'created_by' => 1,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }

        // Create default folders
        $folders = [
            [
                'name' => 'Employee Files',
                'description' => 'Individual employee documentation',
                'parent_id' => null,
                'created_by' => 1,
            ],
            [
                'name' => 'Contracts',
                'description' => 'Employment and vendor contracts',
                'parent_id' => null,
                'created_by' => 1,
            ],
            [
                'name' => 'Templates',
                'description' => 'Document templates for company use',
                'parent_id' => null,
                'created_by' => 1,
            ],
            [
                'name' => 'Archive',
                'description' => 'Archived documents',
                'parent_id' => null,
                'created_by' => 1,
            ],
        ];

        foreach ($folders as $folder) {
            Folder::firstOrCreate(['name' => $folder['name']], $folder);
        }

        $this->command->info('DMS permissions, categories, and folders created successfully.');
    }
}
