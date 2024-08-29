<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Designation;
use Illuminate\Database\Seeder;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
//        User::factory()->create([
//            'user_name' => 'emamhosen',
//            'name' => 'Emam Hosen',
//            'email' => 'emam@dhakabypass.com',
//        ]);
//
//        User::factory(10)->create();



        Department::create(['name' => 'Engineering Department']);
        Department::create(['name' => 'Quality Control Department']);
        Department::create(['name' => 'Admin Department']);
        Department::create(['name' => 'Contract Department']);
        Department::create(['name' => 'Design Department']);
        Department::create(['name' => 'Finance Department']);

        Designation::create(['department_id' => 2, 'title' => 'Manager']);
        Designation::create(['department_id' => 2, 'title' => 'Deputy Manager']);
        Designation::create(['department_id' => 2, 'title' => 'Supervision Engineer']);
        Designation::create(['department_id' => 2, 'title' => 'Quality Control Inspector']);
        Designation::create(['department_id' => 2, 'title' => 'Asst. Quality Control Inspector']);
        Designation::create(['department_id' => 2, 'title' => 'IT Executive']);
        Designation::create(['department_id' => 2, 'title' => 'Office Engineer']);
        Designation::create(['department_id' => 2, 'title' => 'Office Assistant']);
        Designation::create(['department_id' => 2, 'title' => 'Driver']);
        Designation::create(['department_id' => 2, 'title' => 'Lab Assistant']);
    }
}
