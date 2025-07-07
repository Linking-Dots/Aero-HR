<?php

use App\Http\Controllers\CRM\CustomerController;
use App\Http\Controllers\CRM\OpportunityController;
use App\Http\Controllers\CRM\InteractionController;
use App\Http\Controllers\FMS\TransactionController;
use App\Http\Controllers\FMS\AccountController;
use App\Http\Controllers\FMS\ReportController as FMSReportController;
use App\Http\Controllers\POS\SaleController;
use App\Http\Controllers\POS\OrderController;
use App\Http\Controllers\POS\CashierController;
use App\Http\Controllers\IMS\InventoryItemController;
use App\Http\Controllers\IMS\StockController;
use App\Http\Controllers\IMS\TransferController;
use App\Http\Controllers\LMS\CourseController;
use App\Http\Controllers\LMS\EnrollmentController;
use App\Http\Controllers\LMS\AssessmentController;
use App\Http\Controllers\SCM\SupplierController;
use App\Http\Controllers\SCM\PurchaseController;
use App\Http\Controllers\SCM\LogisticsController;
use App\Http\Controllers\Sales\OrderController as SalesOrderController;
use App\Http\Controllers\Sales\InvoiceController;
use App\Http\Controllers\Sales\QuoteController;
use App\Http\Controllers\Helpdesk\TicketController;
use App\Http\Controllers\Helpdesk\KnowledgeBaseController;
use App\Http\Controllers\Asset\AssetController;
use App\Http\Controllers\Asset\MaintenanceController;
use App\Http\Controllers\Compliance\DocumentController;
use App\Http\Controllers\Compliance\AuditController;
use App\Http\Controllers\Quality\InspectionController;
use App\Http\Controllers\Quality\NCRController;
use App\Http\Controllers\Analytics\ReportController as AnalyticsReportController;
use App\Http\Controllers\Analytics\DashboardController as AnalyticsDashboardController;
use App\Http\Controllers\Analytics\KPIController;
use App\Http\Controllers\Procurement\PurchaseOrderController;
use App\Http\Controllers\Procurement\VendorController;
use App\Http\Controllers\Procurement\RFQController;
use App\Http\Controllers\Settings\CRMSettingController;
use App\Http\Controllers\Settings\FMSSettingController;
use App\Http\Controllers\Settings\POSSettingController;
use App\Http\Controllers\Settings\IMSSettingController;
use App\Http\Controllers\Settings\LMSSettingController;
use App\Http\Controllers\Settings\SCMSettingController;
use App\Http\Controllers\Settings\SalesSettingController;
use App\Http\Controllers\Settings\HelpdeskSettingController;
use App\Http\Controllers\Settings\AssetSettingController;
use App\Http\Controllers\Settings\ComplianceSettingController;
use App\Http\Controllers\Settings\QualitySettingController;
use App\Http\Controllers\Settings\AnalyticsSettingController;
use App\Http\Controllers\Settings\ProcurementSettingController;
use Illuminate\Support\Facades\Route;


// CRM Routes
Route::middleware(['auth', 'verified'])->prefix('crm')->name('crm.')->group(function () {
    // CRM Dashboard
    Route::middleware(['permission:crm.dashboard.view'])->get('/dashboard', [CustomerController::class, 'dashboard'])->name('dashboard');

    // Customers
    Route::middleware(['permission:crm.customers.view'])->group(function () {
        Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create');
        Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
    });

    Route::middleware(['permission:crm.customers.create'])->post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::middleware(['permission:crm.customers.update'])->put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::middleware(['permission:crm.customers.delete'])->delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // Opportunities
    Route::middleware(['permission:crm.opportunities.view'])->group(function () {
        Route::get('/opportunities', [OpportunityController::class, 'index'])->name('opportunities.index');
        Route::get('/opportunities/create', [OpportunityController::class, 'create'])->name('opportunities.create');
        Route::get('/opportunities/{opportunity}/edit', [OpportunityController::class, 'edit'])->name('opportunities.edit');
    });

    Route::middleware(['permission:crm.opportunities.create'])->post('/opportunities', [OpportunityController::class, 'store'])->name('opportunities.store');
    Route::middleware(['permission:crm.opportunities.update'])->put('/opportunities/{opportunity}', [OpportunityController::class, 'update'])->name('opportunities.update');
    Route::middleware(['permission:crm.opportunities.delete'])->delete('/opportunities/{opportunity}', [OpportunityController::class, 'destroy'])->name('opportunities.destroy');

    // Interactions
    Route::middleware(['permission:crm.interactions.view'])->group(function () {
        Route::get('/interactions', [InteractionController::class, 'index'])->name('interactions.index');
        Route::get('/interactions/create', [InteractionController::class, 'create'])->name('interactions.create');
        Route::get('/interactions/{interaction}/edit', [InteractionController::class, 'edit'])->name('interactions.edit');
    });

    Route::middleware(['permission:crm.interactions.create'])->post('/interactions', [InteractionController::class, 'store'])->name('interactions.store');
    Route::middleware(['permission:crm.interactions.update'])->put('/interactions/{interaction}', [InteractionController::class, 'update'])->name('interactions.update');
    Route::middleware(['permission:crm.interactions.delete'])->delete('/interactions/{interaction}', [InteractionController::class, 'destroy'])->name('interactions.destroy');
});

// FMS Routes
Route::middleware(['auth', 'verified'])->prefix('fms')->name('fms.')->group(function () {
    // FMS Dashboard
    Route::middleware(['permission:fms.dashboard.view'])->get('/dashboard', [TransactionController::class, 'dashboard'])->name('dashboard');

    // Transactions
    Route::middleware(['permission:fms.transactions.view'])->group(function () {
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/create', [TransactionController::class, 'create'])->name('transactions.create');
        Route::get('/transactions/{transaction}/edit', [TransactionController::class, 'edit'])->name('transactions.edit');
    });

    Route::middleware(['permission:fms.transactions.create'])->post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::middleware(['permission:fms.transactions.update'])->put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::middleware(['permission:fms.transactions.delete'])->delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Accounts
    Route::middleware(['permission:fms.accounts.view'])->group(function () {
        Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
        Route::get('/accounts/create', [AccountController::class, 'create'])->name('accounts.create');
        Route::get('/accounts/{account}/edit', [AccountController::class, 'edit'])->name('accounts.edit');
    });

    Route::middleware(['permission:fms.accounts.create'])->post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::middleware(['permission:fms.accounts.update'])->put('/accounts/{account}', [AccountController::class, 'update'])->name('accounts.update');
    Route::middleware(['permission:fms.accounts.delete'])->delete('/accounts/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy');

    // Reports
    Route::middleware(['permission:fms.reports.view'])->group(function () {
        Route::get('/reports', [FMSReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/{report}', [FMSReportController::class, 'show'])->name('reports.show');
    });

    // Budgets
    Route::middleware(['permission:fms.budgets.view'])->group(function () {
        Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
        Route::get('/budgets/create', [BudgetController::class, 'create'])->name('budgets.create');
        Route::get('/budgets/{budget}/edit', [BudgetController::class, 'edit'])->name('budgets.edit');
    });

    Route::middleware(['permission:fms.budgets.create'])->post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
    Route::middleware(['permission:fms.budgets.update'])->put('/budgets/{budget}', [BudgetController::class, 'update'])->name('budgets.update');
    Route::middleware(['permission:fms.budgets.delete'])->delete('/budgets/{budget}', [BudgetController::class, 'destroy'])->name('budgets.destroy');
});

// POS Routes
Route::middleware(['auth', 'verified'])->prefix('pos')->name('pos.')->group(function () {
    // POS Dashboard
    Route::middleware(['permission:pos.dashboard.view'])->get('/dashboard', [SaleController::class, 'dashboard'])->name('dashboard');

    // Sales
    Route::middleware(['permission:pos.sales.view'])->group(function () {
        Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
        Route::get('/sales/create', [SaleController::class, 'create'])->name('sales.create');
        Route::get('/sales/{sale}/edit', [SaleController::class, 'edit'])->name('sales.edit');
    });

    Route::middleware(['permission:pos.sales.create'])->post('/sales', [SaleController::class, 'store'])->name('sales.store');
    Route::middleware(['permission:pos.sales.update'])->put('/sales/{sale}', [SaleController::class, 'update'])->name('sales.update');
    Route::middleware(['permission:pos.sales.delete'])->delete('/sales/{sale}', [SaleController::class, 'destroy'])->name('sales.destroy');

    // Orders
    Route::middleware(['permission:pos.orders.view'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::get('/orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    });

    Route::middleware(['permission:pos.orders.create'])->post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::middleware(['permission:pos.orders.update'])->put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::middleware(['permission:pos.orders.delete'])->delete('/orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');

    // Cashier
    Route::middleware(['permission:pos.cashier.view'])->get('/cashier', [CashierController::class, 'index'])->name('cashier');
    Route::middleware(['permission:pos.cashier.process'])->post('/cashier/process', [CashierController::class, 'process'])->name('cashier.process');
});

// IMS Routes
Route::middleware(['auth', 'verified'])->prefix('ims')->name('ims.')->group(function () {
    // IMS Dashboard
    Route::middleware(['permission:ims.dashboard.view'])->get('/dashboard', [InventoryItemController::class, 'dashboard'])->name('dashboard');

    // Items
    Route::middleware(['permission:ims.items.view'])->group(function () {
        Route::get('/items', [InventoryItemController::class, 'index'])->name('items.index');
        Route::get('/items/create', [InventoryItemController::class, 'create'])->name('items.create');
        Route::get('/items/{item}/edit', [InventoryItemController::class, 'edit'])->name('items.edit');
    });

    Route::middleware(['permission:ims.items.create'])->post('/items', [InventoryItemController::class, 'store'])->name('items.store');
    Route::middleware(['permission:ims.items.update'])->put('/items/{item}', [InventoryItemController::class, 'update'])->name('items.update');
    Route::middleware(['permission:ims.items.delete'])->delete('/items/{item}', [InventoryItemController::class, 'destroy'])->name('items.destroy');

    // Stock
    Route::middleware(['permission:ims.stock.view'])->group(function () {
        Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
        Route::get('/stock/adjustment', [StockController::class, 'adjustment'])->name('stock.adjustment');
    });

    Route::middleware(['permission:ims.stock.adjust'])->post('/stock/adjust', [StockController::class, 'adjust'])->name('stock.adjust');

    // Transfers
    Route::middleware(['permission:ims.transfers.view'])->group(function () {
        Route::get('/transfers', [TransferController::class, 'index'])->name('transfers.index');
        Route::get('/transfers/create', [TransferController::class, 'create'])->name('transfers.create');
        Route::get('/transfers/{transfer}/edit', [TransferController::class, 'edit'])->name('transfers.edit');
    });

    Route::middleware(['permission:ims.transfers.create'])->post('/transfers', [TransferController::class, 'store'])->name('transfers.store');
    Route::middleware(['permission:ims.transfers.update'])->put('/transfers/{transfer}', [TransferController::class, 'update'])->name('transfers.update');
    Route::middleware(['permission:ims.transfers.delete'])->delete('/transfers/{transfer}', [TransferController::class, 'destroy'])->name('transfers.destroy');
});

// LMS Routes
Route::middleware(['auth', 'verified'])->prefix('lms')->name('lms.')->group(function () {
    // LMS Dashboard
    Route::middleware(['permission:lms.dashboard.view'])->get('/dashboard', [CourseController::class, 'dashboard'])->name('dashboard');

    // Courses
    Route::middleware(['permission:lms.courses.view'])->group(function () {
        Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
        Route::get('/courses/create', [CourseController::class, 'create'])->name('courses.create');
        Route::get('/courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    });

    Route::middleware(['permission:lms.courses.create'])->post('/courses', [CourseController::class, 'store'])->name('courses.store');
    Route::middleware(['permission:lms.courses.update'])->put('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
    Route::middleware(['permission:lms.courses.delete'])->delete('/courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');

    // Enrollments
    Route::middleware(['permission:lms.enrollments.view'])->group(function () {
        Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
        Route::get('/enrollments/create', [EnrollmentController::class, 'create'])->name('enrollments.create');
        Route::get('/enrollments/{enrollment}/edit', [EnrollmentController::class, 'edit'])->name('enrollments.edit');
    });

    Route::middleware(['permission:lms.enrollments.create'])->post('/enrollments', [EnrollmentController::class, 'store'])->name('enrollments.store');
    Route::middleware(['permission:lms.enrollments.update'])->put('/enrollments/{enrollment}', [EnrollmentController::class, 'update'])->name('enrollments.update');
    Route::middleware(['permission:lms.enrollments.delete'])->delete('/enrollments/{enrollment}', [EnrollmentController::class, 'destroy'])->name('enrollments.destroy');

    // Assessments
    Route::middleware(['permission:lms.assessments.view'])->group(function () {
        Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments.index');
        Route::get('/assessments/create', [AssessmentController::class, 'create'])->name('assessments.create');
        Route::get('/assessments/{assessment}/edit', [AssessmentController::class, 'edit'])->name('assessments.edit');
        Route::get('/assessments/{assessment}', [AssessmentController::class, 'show'])->name('assessments.show');
    });

    Route::middleware(['permission:lms.assessments.create'])->post('/assessments', [AssessmentController::class, 'store'])->name('assessments.store');
    Route::middleware(['permission:lms.assessments.update'])->put('/assessments/{assessment}', [AssessmentController::class, 'update'])->name('assessments.update');
    Route::middleware(['permission:lms.assessments.delete'])->delete('/assessments/{assessment}', [AssessmentController::class, 'destroy'])->name('assessments.destroy');
});

// SCM Routes
Route::middleware(['auth', 'verified'])->prefix('scm')->name('scm.')->group(function () {
    // SCM Dashboard
    Route::middleware(['permission:scm.dashboard.view'])->get('/dashboard', [SupplierController::class, 'dashboard'])->name('dashboard');

    // Suppliers
    Route::middleware(['permission:scm.suppliers.view'])->group(function () {
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
        Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit');
    });

    Route::middleware(['permission:scm.suppliers.create'])->post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::middleware(['permission:scm.suppliers.update'])->put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::middleware(['permission:scm.suppliers.delete'])->delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // Purchases
    Route::middleware(['permission:scm.purchases.view'])->group(function () {
        Route::get('/purchases', [PurchaseController::class, 'index'])->name('purchases.index');
        Route::get('/purchases/create', [PurchaseController::class, 'create'])->name('purchases.create');
        Route::get('/purchases/{purchase}/edit', [PurchaseController::class, 'edit'])->name('purchases.edit');
    });

    Route::middleware(['permission:scm.purchases.create'])->post('/purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::middleware(['permission:scm.purchases.update'])->put('/purchases/{purchase}', [PurchaseController::class, 'update'])->name('purchases.update');
    Route::middleware(['permission:scm.purchases.delete'])->delete('/purchases/{purchase}', [PurchaseController::class, 'destroy'])->name('purchases.destroy');

    // Logistics
    Route::middleware(['permission:scm.logistics.view'])->group(function () {
        Route::get('/logistics', [LogisticsController::class, 'index'])->name('logistics.index');
        Route::get('/logistics/create', [LogisticsController::class, 'create'])->name('logistics.create');
        Route::get('/logistics/{logistic}/edit', [LogisticsController::class, 'edit'])->name('logistics.edit');
    });

    Route::middleware(['permission:scm.logistics.create'])->post('/logistics', [LogisticsController::class, 'store'])->name('logistics.store');
    Route::middleware(['permission:scm.logistics.update'])->put('/logistics/{logistic}', [LogisticsController::class, 'update'])->name('logistics.update');
    Route::middleware(['permission:scm.logistics.delete'])->delete('/logistics/{logistic}', [LogisticsController::class, 'destroy'])->name('logistics.destroy');
});

// Sales Routes
Route::middleware(['auth', 'verified'])->prefix('sales')->name('sales.')->group(function () {
    // Sales Dashboard
    Route::middleware(['permission:sales.dashboard.view'])->get('/dashboard', [SalesOrderController::class, 'dashboard'])->name('dashboard');

    // Orders
    Route::middleware(['permission:sales.orders.view'])->group(function () {
        Route::get('/orders', [SalesOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/create', [SalesOrderController::class, 'create'])->name('orders.create');
        Route::get('/orders/{order}/edit', [SalesOrderController::class, 'edit'])->name('orders.edit');
    });

    Route::middleware(['permission:sales.orders.create'])->post('/orders', [SalesOrderController::class, 'store'])->name('orders.store');
    Route::middleware(['permission:sales.orders.update'])->put('/orders/{order}', [SalesOrderController::class, 'update'])->name('orders.update');
    Route::middleware(['permission:sales.orders.delete'])->delete('/orders/{order}', [SalesOrderController::class, 'destroy'])->name('orders.destroy');

    // Invoices
    Route::middleware(['permission:sales.invoices.view'])->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('invoices.create');
        Route::get('/invoices/{invoice}/edit', [InvoiceController::class, 'edit'])->name('invoices.edit');
    });

    Route::middleware(['permission:sales.invoices.create'])->post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::middleware(['permission:sales.invoices.update'])->put('/invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::middleware(['permission:sales.invoices.delete'])->delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

    // Quotes
    Route::middleware(['permission:sales.quotes.view'])->group(function () {
        Route::get('/quotes', [QuoteController::class, 'index'])->name('quotes.index');
        Route::get('/quotes/create', [QuoteController::class, 'create'])->name('quotes.create');
        Route::get('/quotes/{quote}/edit', [QuoteController::class, 'edit'])->name('quotes.edit');
    });

    Route::middleware(['permission:sales.quotes.create'])->post('/quotes', [QuoteController::class, 'store'])->name('quotes.store');
    Route::middleware(['permission:sales.quotes.update'])->put('/quotes/{quote}', [QuoteController::class, 'update'])->name('quotes.update');
    Route::middleware(['permission:sales.quotes.delete'])->delete('/quotes/{quote}', [QuoteController::class, 'destroy'])->name('quotes.destroy');
});

// Helpdesk Routes
Route::middleware(['auth', 'verified'])->prefix('helpdesk')->name('helpdesk.')->group(function () {
    // Helpdesk Dashboard
    Route::middleware(['permission:helpdesk.dashboard.view'])->get('/dashboard', [TicketController::class, 'dashboard'])->name('dashboard');

    // Tickets
    Route::middleware(['permission:helpdesk.tickets.view'])->group(function () {
        Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
        Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
        Route::get('/tickets/{ticket}/edit', [TicketController::class, 'edit'])->name('tickets.edit');
        Route::get('/tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    });

    Route::middleware(['permission:helpdesk.tickets.create'])->post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
    Route::middleware(['permission:helpdesk.tickets.update'])->put('/tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
    Route::middleware(['permission:helpdesk.tickets.delete'])->delete('/tickets/{ticket}', [TicketController::class, 'destroy'])->name('tickets.destroy');

    // Knowledge Base
    Route::middleware(['permission:helpdesk.knowledge.view'])->group(function () {
        Route::get('/knowledge', [KnowledgeBaseController::class, 'index'])->name('knowledge.index');
        Route::get('/knowledge/create', [KnowledgeBaseController::class, 'create'])->name('knowledge.create');
        Route::get('/knowledge/{article}/edit', [KnowledgeBaseController::class, 'edit'])->name('knowledge.edit');
        Route::get('/knowledge/{article}', [KnowledgeBaseController::class, 'show'])->name('knowledge.show');
    });

    Route::middleware(['permission:helpdesk.knowledge.create'])->post('/knowledge', [KnowledgeBaseController::class, 'store'])->name('knowledge.store');
    Route::middleware(['permission:helpdesk.knowledge.update'])->put('/knowledge/{article}', [KnowledgeBaseController::class, 'update'])->name('knowledge.update');
    Route::middleware(['permission:helpdesk.knowledge.delete'])->delete('/knowledge/{article}', [KnowledgeBaseController::class, 'destroy'])->name('knowledge.destroy');
});

// Asset Management Routes
Route::middleware(['auth', 'verified'])->prefix('assets')->name('assets.')->group(function () {
    // Asset Dashboard
    Route::middleware(['permission:assets.dashboard.view'])->get('/dashboard', [AssetController::class, 'dashboard'])->name('dashboard');

    // Asset Items
    Route::middleware(['permission:assets.items.view'])->group(function () {
        Route::get('/items', [AssetController::class, 'index'])->name('items.index');
        Route::get('/items/create', [AssetController::class, 'create'])->name('items.create');
        Route::get('/items/{asset}/edit', [AssetController::class, 'edit'])->name('items.edit');
    });

    Route::middleware(['permission:assets.items.create'])->post('/items', [AssetController::class, 'store'])->name('items.store');
    Route::middleware(['permission:assets.items.update'])->put('/items/{asset}', [AssetController::class, 'update'])->name('items.update');
    Route::middleware(['permission:assets.items.delete'])->delete('/items/{asset}', [AssetController::class, 'destroy'])->name('items.destroy');

    // Maintenance
    Route::middleware(['permission:assets.maintenance.view'])->group(function () {
        Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
        Route::get('/maintenance/create', [MaintenanceController::class, 'create'])->name('maintenance.create');
        Route::get('/maintenance/{maintenance}/edit', [MaintenanceController::class, 'edit'])->name('maintenance.edit');
    });

    Route::middleware(['permission:assets.maintenance.create'])->post('/maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::middleware(['permission:assets.maintenance.update'])->put('/maintenance/{maintenance}', [MaintenanceController::class, 'update'])->name('maintenance.update');
    Route::middleware(['permission:assets.maintenance.delete'])->delete('/maintenance/{maintenance}', [MaintenanceController::class, 'destroy'])->name('maintenance.destroy');
});

// Compliance Routes
Route::middleware(['auth', 'verified'])->prefix('compliance')->name('compliance.')->group(function () {
    // Compliance Dashboard
    Route::middleware(['permission:compliance.dashboard.view'])->get('/dashboard', [DocumentController::class, 'dashboard'])->name('dashboard');

    // Documents
    Route::middleware(['permission:compliance.documents.view'])->group(function () {
        Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
        Route::get('/documents/create', [DocumentController::class, 'create'])->name('documents.create');
        Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])->name('documents.edit');
        Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    });

    Route::middleware(['permission:compliance.documents.create'])->post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::middleware(['permission:compliance.documents.update'])->put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::middleware(['permission:compliance.documents.delete'])->delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Audits
    Route::middleware(['permission:compliance.audits.view'])->group(function () {
        Route::get('/audits', [AuditController::class, 'index'])->name('audits.index');
        Route::get('/audits/create', [AuditController::class, 'create'])->name('audits.create');
        Route::get('/audits/{audit}/edit', [AuditController::class, 'edit'])->name('audits.edit');
        Route::get('/audits/{audit}', [AuditController::class, 'show'])->name('audits.show');
    });

    Route::middleware(['permission:compliance.audits.create'])->post('/audits', [AuditController::class, 'store'])->name('audits.store');
    Route::middleware(['permission:compliance.audits.update'])->put('/audits/{audit}', [AuditController::class, 'update'])->name('audits.update');
    Route::middleware(['permission:compliance.audits.delete'])->delete('/audits/{audit}', [AuditController::class, 'destroy'])->name('audits.destroy');
});

// Quality Management Routes
Route::middleware(['auth', 'verified'])->prefix('quality')->name('quality.')->group(function () {
    // Quality Dashboard
    Route::middleware(['permission:quality.dashboard.view'])->get('/dashboard', [InspectionController::class, 'dashboard'])->name('dashboard');

    // Inspections
    Route::middleware(['permission:quality.inspections.view'])->group(function () {
        Route::get('/inspections', [InspectionController::class, 'index'])->name('inspections.index');
        Route::get('/inspections/create', [InspectionController::class, 'create'])->name('inspections.create');
        Route::get('/inspections/{inspection}/edit', [InspectionController::class, 'edit'])->name('inspections.edit');
    });

    Route::middleware(['permission:quality.inspections.create'])->post('/inspections', [InspectionController::class, 'store'])->name('inspections.store');
    Route::middleware(['permission:quality.inspections.update'])->put('/inspections/{inspection}', [InspectionController::class, 'update'])->name('inspections.update');
    Route::middleware(['permission:quality.inspections.delete'])->delete('/inspections/{inspection}', [InspectionController::class, 'destroy'])->name('inspections.destroy');

    // Non-Conformance Reports
    Route::middleware(['permission:quality.ncr.view'])->group(function () {
        Route::get('/ncr', [NCRController::class, 'index'])->name('ncr.index');
        Route::get('/ncr/create', [NCRController::class, 'create'])->name('ncr.create');
        Route::get('/ncr/{ncr}/edit', [NCRController::class, 'edit'])->name('ncr.edit');
    });

    Route::middleware(['permission:quality.ncr.create'])->post('/ncr', [NCRController::class, 'store'])->name('ncr.store');
    Route::middleware(['permission:quality.ncr.update'])->put('/ncr/{ncr}', [NCRController::class, 'update'])->name('ncr.update');
    Route::middleware(['permission:quality.ncr.delete'])->delete('/ncr/{ncr}', [NCRController::class, 'destroy'])->name('ncr.destroy');
});

// Analytics Routes
Route::middleware(['auth', 'verified'])->prefix('analytics')->name('analytics.')->group(function () {
    // Reports
    Route::middleware(['permission:analytics.reports.view'])->group(function () {
        Route::get('/reports', [AnalyticsReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/create', [AnalyticsReportController::class, 'create'])->name('reports.create');
        Route::get('/reports/{report}/edit', [AnalyticsReportController::class, 'edit'])->name('reports.edit');
        Route::get('/reports/{report}', [AnalyticsReportController::class, 'show'])->name('reports.show');
    });

    Route::middleware(['permission:analytics.reports.create'])->post('/reports', [AnalyticsReportController::class, 'store'])->name('reports.store');
    Route::middleware(['permission:analytics.reports.update'])->put('/reports/{report}', [AnalyticsReportController::class, 'update'])->name('reports.update');
    Route::middleware(['permission:analytics.reports.delete'])->delete('/reports/{report}', [AnalyticsReportController::class, 'destroy'])->name('reports.destroy');

    // Dashboards
    Route::middleware(['permission:analytics.dashboards.view'])->group(function () {
        Route::get('/dashboards', [AnalyticsDashboardController::class, 'index'])->name('dashboards.index');
        Route::get('/dashboards/create', [AnalyticsDashboardController::class, 'create'])->name('dashboards.create');
        Route::get('/dashboards/{dashboard}/edit', [AnalyticsDashboardController::class, 'edit'])->name('dashboards.edit');
        Route::get('/dashboards/{dashboard}', [AnalyticsDashboardController::class, 'show'])->name('dashboards.show');
    });

    Route::middleware(['permission:analytics.dashboards.create'])->post('/dashboards', [AnalyticsDashboardController::class, 'store'])->name('dashboards.store');
    Route::middleware(['permission:analytics.dashboards.update'])->put('/dashboards/{dashboard}', [AnalyticsDashboardController::class, 'update'])->name('dashboards.update');
    Route::middleware(['permission:analytics.dashboards.delete'])->delete('/dashboards/{dashboard}', [AnalyticsDashboardController::class, 'destroy'])->name('dashboards.destroy');

    // KPIs
    Route::middleware(['permission:analytics.kpi.view'])->group(function () {
        Route::get('/kpi', [KPIController::class, 'index'])->name('kpi.index');
        Route::get('/kpi/create', [KPIController::class, 'create'])->name('kpi.create');
        Route::get('/kpi/{kpi}/edit', [KPIController::class, 'edit'])->name('kpi.edit');
    });

    Route::middleware(['permission:analytics.kpi.create'])->post('/kpi', [KPIController::class, 'store'])->name('kpi.store');
    Route::middleware(['permission:analytics.kpi.update'])->put('/kpi/{kpi}', [KPIController::class, 'update'])->name('kpi.update');
    Route::middleware(['permission:analytics.kpi.delete'])->delete('/kpi/{kpi}', [KPIController::class, 'destroy'])->name('kpi.destroy');
});

// Settings Routes for New Modules
Route::middleware(['auth', 'verified', 'permission:settings.view'])->prefix('admin/settings')->name('admin.settings.')->group(function () {
    // CRM Settings
    Route::middleware(['permission:crm.settings'])->group(function () {
        Route::get('/crm', [CRMSettingController::class, 'index'])->name('crm');
        Route::post('/crm', [CRMSettingController::class, 'update'])->name('crm.update');
    });

    // FMS Settings
    Route::middleware(['permission:fms.settings'])->group(function () {
        Route::get('/finance', [FMSSettingController::class, 'index'])->name('finance');
        Route::post('/finance', [FMSSettingController::class, 'update'])->name('finance.update');
    });

    // POS Settings
    Route::middleware(['permission:pos.settings'])->group(function () {
        Route::get('/pos', [POSSettingController::class, 'index'])->name('pos');
        Route::post('/pos', [POSSettingController::class, 'update'])->name('pos.update');
    });

    // IMS Settings
    Route::middleware(['permission:ims.settings'])->group(function () {
        Route::get('/inventory', [IMSSettingController::class, 'index'])->name('inventory');
        Route::post('/inventory', [IMSSettingController::class, 'update'])->name('inventory.update');
    });

    // LMS Settings
    Route::middleware(['permission:lms.settings'])->group(function () {
        Route::get('/learning', [LMSSettingController::class, 'index'])->name('learning');
        Route::post('/learning', [LMSSettingController::class, 'update'])->name('learning.update');
    });

    // SCM Settings
    Route::middleware(['permission:scm.settings'])->group(function () {
        Route::get('/supply-chain', [SCMSettingController::class, 'index'])->name('supply-chain');
        Route::post('/supply-chain', [SCMSettingController::class, 'update'])->name('supply-chain.update');
    });

    // Sales Settings
    Route::middleware(['permission:sales.settings'])->group(function () {
        Route::get('/sales', [SalesSettingController::class, 'index'])->name('sales');
        Route::post('/sales', [SalesSettingController::class, 'update'])->name('sales.update');
    });

    // Helpdesk Settings
    Route::middleware(['permission:helpdesk.settings'])->group(function () {
        Route::get('/helpdesk', [HelpdeskSettingController::class, 'index'])->name('helpdesk');
        Route::post('/helpdesk', [HelpdeskSettingController::class, 'update'])->name('helpdesk.update');
    });

    // Asset Settings
    Route::middleware(['permission:assets.settings'])->group(function () {
        Route::get('/assets', [AssetSettingController::class, 'index'])->name('assets');
        Route::post('/assets', [AssetSettingController::class, 'update'])->name('assets.update');
    });

    // Compliance Settings
    Route::middleware(['permission:compliance.settings'])->group(function () {
        Route::get('/compliance', [ComplianceSettingController::class, 'index'])->name('compliance');
        Route::post('/compliance', [ComplianceSettingController::class, 'update'])->name('compliance.update');
    });

    // Quality Settings
    Route::middleware(['permission:quality.settings'])->group(function () {
        Route::get('/quality', [QualitySettingController::class, 'index'])->name('quality');
        Route::post('/quality', [QualitySettingController::class, 'update'])->name('quality.update');
    });

    // Analytics Settings
    Route::middleware(['permission:analytics.settings'])->group(function () {
        Route::get('/analytics', [AnalyticsSettingController::class, 'index'])->name('analytics');
        Route::post('/analytics', [AnalyticsSettingController::class, 'update'])->name('analytics.update');
    });
});

// Procurement Routes
Route::middleware(['auth', 'verified'])->prefix('procurement')->name('procurement.')->group(function () {
    // Procurement Dashboard
    Route::middleware(['permission:procurement.dashboard.view'])->get('/dashboard', [PurchaseOrderController::class, 'dashboard'])->name('dashboard');

    // Purchase Orders
    Route::middleware(['permission:procurement.purchase-orders.view'])->group(function () {
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::get('/purchase-orders/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
        Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
        Route::get('/purchase-orders/{purchaseOrder}/edit', [PurchaseOrderController::class, 'edit'])->name('purchase-orders.edit');
    });

    Route::middleware(['permission:procurement.purchase-orders.create'])->post('/purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
    Route::middleware(['permission:procurement.purchase-orders.update'])->put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
    Route::middleware(['permission:procurement.purchase-orders.delete'])->delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy');
    Route::middleware(['permission:procurement.purchase-orders.approve'])->post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');

    // Vendors
    Route::middleware(['permission:procurement.vendors.view'])->group(function () {
        Route::get('/vendors', [VendorController::class, 'index'])->name('vendors.index');
        Route::get('/vendors/create', [VendorController::class, 'create'])->name('vendors.create');
        Route::get('/vendors/{vendor}', [VendorController::class, 'show'])->name('vendors.show');
        Route::get('/vendors/{vendor}/edit', [VendorController::class, 'edit'])->name('vendors.edit');
    });

    Route::middleware(['permission:procurement.vendors.create'])->post('/vendors', [VendorController::class, 'store'])->name('vendors.store');
    Route::middleware(['permission:procurement.vendors.update'])->put('/vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update');
    Route::middleware(['permission:procurement.vendors.delete'])->delete('/vendors/{vendor}', [VendorController::class, 'destroy'])->name('vendors.delete');

    // RFQs (Request for Quotations)
    Route::middleware(['permission:procurement.rfq.view'])->group(function () {
        Route::get('/rfq', [RFQController::class, 'index'])->name('rfq.index');
        Route::get('/rfq/create', [RFQController::class, 'create'])->name('rfq.create');
        Route::get('/rfq/{rfq}', [RFQController::class, 'show'])->name('rfq.show');
        Route::get('/rfq/{rfq}/edit', [RFQController::class, 'edit'])->name('rfq.edit');
    });

    Route::middleware(['permission:procurement.rfq.create'])->post('/rfq', [RFQController::class, 'store'])->name('rfq.store');
    Route::middleware(['permission:procurement.rfq.update'])->put('/rfq/{rfq}', [RFQController::class, 'update'])->name('rfq.update');
    Route::middleware(['permission:procurement.rfq.delete'])->delete('/rfq/{rfq}', [RFQController::class, 'destroy'])->name('rfq.delete');
});
