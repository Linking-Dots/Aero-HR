<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create RFQs table
        Schema::create('rfqs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->datetime('deadline');
            $table->enum('status', ['draft', 'published', 'closed', 'awarded', 'cancelled'])->default('draft');
            $table->text('specifications')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->datetime('published_at')->nullable();
            $table->datetime('closed_at')->nullable();
            $table->datetime('awarded_at')->nullable();
            $table->datetime('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Create RFQ Items table
        Schema::create('rfq_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->string('unit')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Create RFQ Suppliers table (pivot)
        Schema::create('rfq_suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->boolean('invited')->default(true);
            $table->datetime('invitation_sent_at')->nullable();
            $table->timestamps();
        });

        // Create RFQ Quotes table
        Schema::create('rfq_quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->decimal('total_amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('delivery_time')->nullable();
            $table->string('delivery_terms')->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('validity_period')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->datetime('submitted_at')->nullable();
            $table->datetime('approved_at')->nullable();
            $table->datetime('rejected_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Create RFQ Quote Items table
        Schema::create('rfq_quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_quote_id')->constrained()->onDelete('cascade');
            $table->foreignId('rfq_item_id')->constrained()->onDelete('cascade');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('quantity', 10, 2);
            $table->decimal('subtotal', 15, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Add RFQ reference to Purchase Orders
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignId('rfq_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('rfq_quote_id')->nullable()->after('rfq_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rfq_quote_id');
            $table->dropConstrainedForeignId('rfq_id');
        });

        Schema::dropIfExists('rfq_quote_items');
        Schema::dropIfExists('rfq_quotes');
        Schema::dropIfExists('rfq_suppliers');
        Schema::dropIfExists('rfq_items');
        Schema::dropIfExists('rfqs');
    }
};
