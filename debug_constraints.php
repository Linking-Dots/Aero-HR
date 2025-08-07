<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DATABASE CONSTRAINT ANALYSIS ===\n\n";

// Check the users table structure
echo "Checking users table structure:\n";
try {
    $columns = DB::select("SHOW COLUMNS FROM users");
    foreach ($columns as $column) {
        if (in_array($column->Field, ['department', 'designation'])) {
            echo "  Column: {$column->Field}\n";
            echo "    Type: {$column->Type}\n";
            echo "    Null: {$column->Null}\n";
            echo "    Key: {$column->Key}\n";
            echo "    Default: " . ($column->Default ?? 'NULL') . "\n";
            echo "    Extra: {$column->Extra}\n\n";
        }
    }
} catch (Exception $e) {
    echo "Error checking columns: " . $e->getMessage() . "\n";
}

// Check foreign key constraints
echo "Checking foreign key constraints:\n";
try {
    $constraints = DB::select("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'users' 
        AND TABLE_SCHEMA = DATABASE() 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    foreach ($constraints as $constraint) {
        echo "  Constraint: {$constraint->CONSTRAINT_NAME}\n";
        echo "    Column: {$constraint->COLUMN_NAME}\n";
        echo "    References: {$constraint->REFERENCED_TABLE_NAME}.{$constraint->REFERENCED_COLUMN_NAME}\n\n";
    }
} catch (Exception $e) {
    echo "Error checking constraints: " . $e->getMessage() . "\n";
}

// Check if department 11 exists in the referenced table
echo "Verifying department 11 in departments table:\n";
try {
    $dept = DB::select("SELECT id, name FROM departments WHERE id = 11");
    if (!empty($dept)) {
        echo "  ✓ Department 11 found: " . $dept[0]->name . "\n";
    } else {
        echo "  ❌ Department 11 not found!\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Check what's different about department 11
echo "\nDebugging department 11 specifically:\n";
try {
    $dept11Details = DB::select("SELECT * FROM departments WHERE id = 11");
    if (!empty($dept11Details)) {
        $dept = $dept11Details[0];
        echo "  ID: {$dept->id}\n";
        echo "  Name: {$dept->name}\n";
        echo "  Created: {$dept->created_at}\n";
        echo "  Updated: {$dept->updated_at}\n";
        if (isset($dept->deleted_at)) {
            echo "  Deleted: " . ($dept->deleted_at ?? 'NULL') . "\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
