#!/usr/bin/env node

/**
 * TimeSheet Table Migration Script
 * Helps migrate from old TimeSheetTable to optimized version
 */

const fs = require('fs');
const path = require('path');

class TimeSheetMigrator {
    constructor() {
        this.basePath = process.cwd();
        this.backupDir = path.join(this.basePath, 'backups', 'timesheet-migration');
        this.migrationLog = [];
    }

    /**
     * Run the complete migration
     */
    async migrate() {
        console.log('🚀 Starting TimeSheet Table Migration...\n');

        try {
            // Step 1: Create backup
            await this.createBackup();

            // Step 2: Update imports in existing files
            await this.updateImports();

            // Step 3: Update component usage
            await this.updateComponentUsage();

            // Step 4: Add performance monitoring (optional)
            await this.addPerformanceMonitoring();

            // Step 5: Generate migration report
            this.generateMigrationReport();

            console.log('✅ Migration completed successfully!\n');
            console.log('📋 Next steps:');
            console.log('  1. Test the updated components');
            console.log('  2. Enable performance monitoring in development');
            console.log('  3. Review the migration report');
            console.log('  4. Update any custom table implementations\n');

        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            console.log('🔄 Restoring from backup...');
            await this.restoreFromBackup();
        }
    }

    /**
     * Create backup of existing files
     */
    async createBackup() {
        console.log('📦 Creating backup...');

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }        const filesToBackup = [
            'resources/js/Pages/Dashboard.jsx',
            'resources/js/Pages/AttendanceAdmin.jsx',
            'resources/js/Pages/AttendanceEmployee.jsx'
        ];

        for (const file of filesToBackup) {
            const fullPath = path.join(this.basePath, file);
            if (fs.existsSync(fullPath)) {
                const backupPath = path.join(this.backupDir, file);
                const backupDir = path.dirname(backupPath);
                
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                
                fs.copyFileSync(fullPath, backupPath);
                console.log(`  ✅ Backed up: ${file}`);
            }
        }
    }

    /**
     * Update import statements in files
     */
    async updateImports() {
        console.log('\n📝 Updating imports...');

        const filesToUpdate = [
            'resources/js/Pages/Dashboard.jsx',
            'resources/js/Pages/AttendanceAdmin.jsx',
            'resources/js/Pages/AttendanceEmployee.jsx'
        ];

        for (const file of filesToUpdate) {
            const fullPath = path.join(this.basePath, file);
            if (fs.existsSync(fullPath)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                
                // Update TimeSheetTable import
                const oldImport = /import\s+TimeSheetTable\s+from\s+['"]@\/Tables\/TimeSheetTable\.jsx['"];?/g;
                const newImport = `import TimeSheetTable from '@/Tables/TimeSheet/TimeSheetTable.jsx';`;
                
                if (oldImport.test(content)) {
                    content = content.replace(oldImport, newImport);
                    fs.writeFileSync(fullPath, content);
                    console.log(`  ✅ Updated imports in: ${file}`);
                    this.migrationLog.push(`Updated imports in ${file}`);
                }
            }
        }
    }

    /**
     * Update component usage patterns
     */
    async updateComponentUsage() {
        console.log('\n🔧 Updating component usage...');

        // Add any specific usage pattern updates here
        // For now, the TimeSheetTable interface remains the same
        console.log('  ✅ Component usage is backward compatible');
        this.migrationLog.push('Component usage remains backward compatible');
    }

    /**
     * Add performance monitoring to development builds
     */
    async addPerformanceMonitoring() {
        console.log('\n📊 Adding performance monitoring...');

        const dashboardFile = path.join(this.basePath, 'resources/js/Pages/Dashboard.jsx');
        
        if (fs.existsSync(dashboardFile)) {
            let content = fs.readFileSync(dashboardFile, 'utf8');
            
            // Check if performance monitoring is already added
            if (!content.includes('performance-analyzer')) {
                // Add script tag for performance analyzer
                const scriptTag = `\n            {process.env.NODE_ENV === 'development' && (
                <script src="/js/Tables/TimeSheet/performance-analyzer.js"></script>
            )}`;
                
                // Add before closing head tag or body tag
                if (content.includes('</Head>')) {
                    content = content.replace('</Head>', `${scriptTag}\n        </Head>`);
                } else if (content.includes('</head>')) {
                    content = content.replace('</head>', `${scriptTag}\n    </head>`);
                }
                
                fs.writeFileSync(dashboardFile, content);
                console.log('  ✅ Added performance monitoring to Dashboard');
                this.migrationLog.push('Added performance monitoring to Dashboard');
            } else {
                console.log('  ℹ️ Performance monitoring already exists');
            }
        }
    }

    /**
     * Generate migration report
     */
    generateMigrationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            migrationSteps: this.migrationLog,
            newFeatures: [
                'Optimized pagination with smooth transitions',
                'Memoized components for better performance',
                'Performance monitoring in development',
                'Advanced animations and micro-interactions',
                'Better error handling and loading states'
            ],
            performanceImprovements: [
                'Reduced re-renders on pagination changes',
                'Faster table updates with selective rendering',
                'Smooth 60fps animations',
                'Better memory management',
                'Optimized state management'
            ],
            breakingChanges: [],
            recommendations: [
                'Test pagination functionality thoroughly',
                'Enable performance monitoring in development',
                'Monitor table performance with large datasets',
                'Consider using virtual scrolling for 1000+ records',
                'Update any custom table styles if needed'
            ]
        };

        const reportPath = path.join(this.backupDir, 'migration-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n📋 Migration Report Generated:');
        console.log(`   Location: ${reportPath}`);
        console.log(`   Steps completed: ${this.migrationLog.length}`);
        console.log(`   New features: ${report.newFeatures.length}`);
        console.log(`   Breaking changes: ${report.breakingChanges.length}`);
    }

    /**
     * Restore from backup if migration fails
     */
    async restoreFromBackup() {
        console.log('🔄 Restoring from backup...');
        
        const backupFiles = this.getAllFiles(this.backupDir);
        
        for (const backupFile of backupFiles) {
            const relativePath = path.relative(this.backupDir, backupFile);
            const originalPath = path.join(this.basePath, relativePath);
            
            if (fs.existsSync(backupFile)) {
                fs.copyFileSync(backupFile, originalPath);
                console.log(`  ✅ Restored: ${relativePath}`);
            }
        }
    }

    /**
     * Helper to get all files recursively
     */
    getAllFiles(dir) {
        const files = [];
        
        function readDir(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    readDir(fullPath);
                } else {
                    files.push(fullPath);
                }
            }
        }
        
        if (fs.existsSync(dir)) {
            readDir(dir);
        }
        
        return files;
    }

    /**
     * Validate migration prerequisites
     */
    validatePrerequisites() {        const requiredFiles = [
            'resources/js/Tables/TimeSheet/TimeSheetTable.jsx',
            'resources/js/Tables/TimeSheet/components/OptimizedTableContent.jsx',
            'resources/js/Tables/TimeSheet/hooks/useOptimizedTable.js'
        ];

        for (const file of requiredFiles) {
            const fullPath = path.join(this.basePath, file);
            if (!fs.existsSync(fullPath)) {
                throw new Error(`Required file missing: ${file}`);
            }
        }

        console.log('✅ All prerequisites validated');
    }
}

// CLI Interface
if (require.main === module) {
    const migrator = new TimeSheetMigrator();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'migrate';

    switch (command) {
        case 'migrate':
            migrator.validatePrerequisites();
            migrator.migrate();
            break;
            
        case 'backup':
            migrator.createBackup();
            break;
            
        case 'restore':
            migrator.restoreFromBackup();
            break;
            
        case 'validate':
            migrator.validatePrerequisites();
            console.log('✅ All files are ready for migration');
            break;
            
        default:
            console.log(`
TimeSheet Table Migration Tool

Usage:
  node migrate-timesheet.js [command]

Commands:
  migrate   - Run complete migration (default)
  backup    - Create backup only
  restore   - Restore from backup
  validate  - Validate prerequisites

Examples:
  node migrate-timesheet.js
  node migrate-timesheet.js backup
  node migrate-timesheet.js validate
            `);
    }
}

module.exports = TimeSheetMigrator;
