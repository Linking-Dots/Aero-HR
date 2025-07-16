import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Search,
    Scan,
    CreditCard,
    DollarSign,
    User,
    Calculator,
    Receipt,
    X,
    Check,
    Package,
    Tag,
    Percent
} from 'lucide-react';

const POSTerminal = ({ auth }) => {
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState(0);
    const [showPayment, setShowPayment] = useState(false);

    // Mock data
    const categories = [
        { id: 'all', name: 'All Products', count: 45 },
        { id: 'beverages', name: 'Beverages', count: 12 },
        { id: 'food', name: 'Food', count: 18 },
        { id: 'snacks', name: 'Snacks', count: 8 },
        { id: 'desserts', name: 'Desserts', count: 7 }
    ];

    const products = [
        {
            id: 1,
            name: 'Premium Coffee',
            price: 4.50,
            category: 'beverages',
            stock: 25,
            image: '/api/placeholder/80/80',
            barcode: '1234567890'
        },
        {
            id: 2,
            name: 'Croissant',
            price: 3.25,
            category: 'food',
            stock: 15,
            image: '/api/placeholder/80/80',
            barcode: '1234567891'
        },
        {
            id: 3,
            name: 'Green Tea',
            price: 3.00,
            category: 'beverages',
            stock: 30,
            image: '/api/placeholder/80/80',
            barcode: '1234567892'
        },
        {
            id: 4,
            name: 'Chocolate Muffin',
            price: 5.00,
            category: 'desserts',
            stock: 12,
            image: '/api/placeholder/80/80',
            barcode: '1234567893'
        },
        {
            id: 5,
            name: 'Sandwich',
            price: 8.50,
            category: 'food',
            stock: 20,
            image: '/api/placeholder/80/80',
            barcode: '1234567894'
        },
        {
            id: 6,
            name: 'Potato Chips',
            price: 2.75,
            category: 'snacks',
            stock: 35,
            image: '/api/placeholder/80/80',
            barcode: '1234567895'
        }
    ];

    const customers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', points: 150 },
        { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', points: 200 },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', points: 75 }
    ];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.barcode.includes(searchQuery);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setSelectedCustomer(null);
        setDiscount(0);
        setShowPayment(false);
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const tax = (subtotal - discountAmount) * 0.08; // 8% tax
    const total = subtotal - discountAmount + tax;

    const processSale = () => {
        // Mock API call
        console.log('Processing sale:', {
            cart,
            customer: selectedCustomer,
            subtotal,
            discount: discountAmount,
            tax,
            total,
            paymentMethod
        });
        
        // Clear cart after successful sale
        clearCart();
        alert('Sale processed successfully!');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        POS Terminal
                    </h2>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Customer
                        </button>
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Scan className="h-4 w-4" />
                            Scan
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="POS - Terminal" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Products Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Search and Categories */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search products or scan barcode..."
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select 
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} ({category.count})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => addToCart(product)}
                                        >
                                            <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                                <Package className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                                            <p className="text-lg font-bold text-gray-900">${product.price}</p>
                                            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                        </div>
                                    ))}
                                </div>
                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-8">
                                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No products found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Section */}
                        <div className="space-y-6">
                            {/* Cart Items */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Cart</h3>
                                    {cart.length > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="text-red-600 hover:text-red-700 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-600">${item.price} each</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 text-gray-600 hover:text-gray-800"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 text-gray-600 hover:text-gray-800"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-1 text-red-600 hover:text-red-700 ml-2"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {cart.length === 0 && (
                                    <div className="text-center py-8">
                                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Cart is empty</p>
                                    </div>
                                )}
                            </div>

                            {/* Cart Totals */}
                            {cart.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                    
                                    {/* Customer Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                                        <select 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={selectedCustomer?.id || ''}
                                            onChange={(e) => {
                                                const customer = customers.find(c => c.id == e.target.value);
                                                setSelectedCustomer(customer || null);
                                            }}
                                        >
                                            <option value="">Walk-in Customer</option>
                                            {customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name} ({customer.points} pts)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Discount */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="space-y-2 border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Discount ({discount}%):</span>
                                                <span className="font-medium text-red-600">-${discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tax (8%):</span>
                                            <span className="font-medium">${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                            <span>Total:</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setPaymentMethod('cash')}
                                                className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                                                    paymentMethod === 'cash'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <DollarSign className="h-4 w-4" />
                                                Cash
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('card')}
                                                className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                                                    paymentMethod === 'card'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <CreditCard className="h-4 w-4" />
                                                Card
                                            </button>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        onClick={processSale}
                                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Receipt className="h-5 w-5" />
                                        Process Sale
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default POSTerminal;
