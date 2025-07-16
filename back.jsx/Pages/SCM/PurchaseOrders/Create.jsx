import React, { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    Grid,
} from '@mui/material';
import { 
    Select, 
    SelectItem, 
    Card, 
    CardBody, 
    CardHeader,
    Divider,
    Button,
    Input,
    Textarea,
    Spacer,
    ButtonGroup,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip
} from "@heroui/react";
import { 
    ShoppingCartIcon,
    PlusIcon,
    TrashIcon,
    ArrowLeftIcon,
    CheckIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const PurchaseOrderCreate = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Form state
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        supplier_id: '',
        po_date: dayjs().format('YYYY-MM-DD'),
        expected_delivery_date: dayjs().add(7, 'days').format('YYYY-MM-DD'),
        priority: 'medium',
        status: 'draft',
        shipping_address: '',
        billing_address: '',
        terms_conditions: '',
        notes: '',
        tax_rate: 0,
        shipping_cost: 0,
        discount_amount: 0
    });

    const [items, setItems] = useState([
        {
            id: 1,
            product_name: '',
            description: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: 0,
            total: 0
        }
    ]);

    const [errors, setErrors] = useState({});

    // Fetch suppliers
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get('/api/scm/suppliers');
                if (response.data.success) {
                    setSuppliers(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };

        fetchSuppliers();
    }, []);

    // Handle form input changes
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    }, [errors]);

    // Handle item changes
    const handleItemChange = useCallback((index, field, value) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };

            // Calculate total for this item
            if (field === 'quantity' || field === 'unit_price' || field === 'tax_rate') {
                const item = newItems[index];
                const subtotal = item.quantity * item.unit_price;
                const taxAmount = subtotal * (item.tax_rate / 100);
                newItems[index].total = subtotal + taxAmount;
            }

            return newItems;
        });
    }, []);

    // Add new item
    const addItem = useCallback(() => {
        setItems(prev => [
            ...prev,
            {
                id: prev.length + 1,
                product_name: '',
                description: '',
                quantity: 1,
                unit_price: 0,
                tax_rate: 0,
                total: 0
            }
        ]);
    }, []);

    // Remove item
    const removeItem = useCallback((index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Calculate totals
    const calculations = React.useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const itemsTaxTotal = items.reduce((sum, item) => {
            const itemSubtotal = item.quantity * item.unit_price;
            return sum + (itemSubtotal * (item.tax_rate / 100));
        }, 0);
        const shippingCost = parseFloat(formData.shipping_cost) || 0;
        const discountAmount = parseFloat(formData.discount_amount) || 0;
        const orderTax = subtotal * (parseFloat(formData.tax_rate) / 100);
        const totalAmount = subtotal + itemsTaxTotal + orderTax + shippingCost - discountAmount;

        return {
            subtotal,
            itemsTaxTotal,
            orderTax,
            shippingCost,
            discountAmount,
            totalAmount
        };
    }, [items, formData.shipping_cost, formData.discount_amount, formData.tax_rate]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.supplier_id) {
            newErrors.supplier_id = 'Supplier is required';
        }

        if (!formData.po_date) {
            newErrors.po_date = 'PO date is required';
        }

        if (!formData.expected_delivery_date) {
            newErrors.expected_delivery_date = 'Expected delivery date is required';
        }

        if (items.length === 0) {
            newErrors.items = 'At least one item is required';
        }

        // Validate items
        items.forEach((item, index) => {
            if (!item.product_name) {
                newErrors[`item_${index}_product_name`] = 'Product name is required';
            }
            if (!item.quantity || item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
            }
            if (!item.unit_price || item.unit_price <= 0) {
                newErrors[`item_${index}_unit_price`] = 'Valid unit price is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (status = 'draft') => {
        if (!validateForm()) {
            toast.error('Please fix the form errors');
            return;
        }

        setLoading(true);
        try {
            const submitData = {
                ...formData,
                status,
                items,
                subtotal: calculations.subtotal,
                total_tax: calculations.itemsTaxTotal + calculations.orderTax,
                total_amount: calculations.totalAmount
            };

            const response = await axios.post('/api/scm/purchase-orders', submitData);

            if (response.data.success) {
                toast.success(`Purchase order ${status === 'draft' ? 'saved as draft' : 'created'} successfully`);
                router.visit('/scm/purchase-orders');
            }
        } catch (error) {
            console.error('Error creating purchase order:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error('Failed to create purchase order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <App>
            <Head title="Create Purchase Order - SCM" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Create Purchase Order"
                    subtitle="Create a new purchase order for procurement"
                    icon={ShoppingCartIcon}
                    actions={
                        <Button
                            color="secondary"
                            variant="flat"
                            startContent={<ArrowLeftIcon className="w-4 h-4" />}
                            onPress={() => router.visit('/scm/purchase-orders')}
                        >
                            Back to Purchase Orders
                        </Button>
                    }
                />

                <Box sx={{ p: 3 }}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* Basic Information */}
                        <GlassCard className="p-6 mb-6">
                            <Typography variant="h6" className="mb-4">
                                Basic Information
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Select
                                        label="Supplier"
                                        placeholder="Select a supplier"
                                        selectedKeys={formData.supplier_id ? [formData.supplier_id] : []}
                                        onSelectionChange={(keys) => handleInputChange('supplier_id', Array.from(keys)[0])}
                                        isInvalid={!!errors.supplier_id}
                                        errorMessage={errors.supplier_id}
                                        isRequired
                                    >
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Select
                                        label="Priority"
                                        selectedKeys={[formData.priority]}
                                        onSelectionChange={(keys) => handleInputChange('priority', Array.from(keys)[0])}
                                    >
                                        <SelectItem key="low">Low</SelectItem>
                                        <SelectItem key="medium">Medium</SelectItem>
                                        <SelectItem key="high">High</SelectItem>
                                        <SelectItem key="urgent">Urgent</SelectItem>
                                    </Select>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Input
                                        type="date"
                                        label="PO Date"
                                        value={formData.po_date}
                                        onChange={(e) => handleInputChange('po_date', e.target.value)}
                                        isInvalid={!!errors.po_date}
                                        errorMessage={errors.po_date}
                                        isRequired
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Input
                                        type="date"
                                        label="Expected Delivery Date"
                                        value={formData.expected_delivery_date}
                                        onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                                        isInvalid={!!errors.expected_delivery_date}
                                        errorMessage={errors.expected_delivery_date}
                                        isRequired
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Textarea
                                        label="Shipping Address"
                                        placeholder="Enter shipping address"
                                        value={formData.shipping_address}
                                        onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                                        minRows={3}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Textarea
                                        label="Billing Address"
                                        placeholder="Enter billing address"
                                        value={formData.billing_address}
                                        onChange={(e) => handleInputChange('billing_address', e.target.value)}
                                        minRows={3}
                                    />
                                </Grid>
                            </Grid>
                        </GlassCard>

                        {/* Line Items */}
                        <GlassCard className="p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <Typography variant="h6">
                                    Line Items
                                </Typography>
                                <Button
                                    color="primary"
                                    variant="flat"
                                    startContent={<PlusIcon className="w-4 h-4" />}
                                    onPress={addItem}
                                >
                                    Add Item
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableColumn>Product</TableColumn>
                                        <TableColumn>Description</TableColumn>
                                        <TableColumn>Qty</TableColumn>
                                        <TableColumn>Unit Price</TableColumn>
                                        <TableColumn>Tax %</TableColumn>
                                        <TableColumn>Total</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Product name"
                                                        value={item.product_name}
                                                        onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                                                        isInvalid={!!errors[`item_${index}_product_name`]}
                                                        size="sm"
                                                        className="min-w-32"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Description"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        size="sm"
                                                        className="min-w-32"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        isInvalid={!!errors[`item_${index}_quantity`]}
                                                        size="sm"
                                                        className="w-20"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        isInvalid={!!errors[`item_${index}_unit_price`]}
                                                        size="sm"
                                                        className="w-24"
                                                        startContent="$"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        value={item.tax_rate}
                                                        onChange={(e) => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                                        size="sm"
                                                        className="w-20"
                                                        endContent="%"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        ${item.total.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {items.length > 1 && (
                                                        <Button
                                                            isIconOnly
                                                            color="danger"
                                                            variant="light"
                                                            size="sm"
                                                            onPress={() => removeItem(index)}
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </GlassCard>

                        {/* Order Summary */}
                        <GlassCard className="p-6 mb-6">
                            <Typography variant="h6" className="mb-4">
                                Order Summary
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                label="Order Tax Rate (%)"
                                                value={formData.tax_rate}
                                                onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                                                endContent="%"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                label="Shipping Cost"
                                                value={formData.shipping_cost}
                                                onChange={(e) => handleInputChange('shipping_cost', parseFloat(e.target.value) || 0)}
                                                startContent="$"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                label="Discount Amount"
                                                value={formData.discount_amount}
                                                onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                                                startContent="$"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card className="bg-gray-50">
                                        <CardBody>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Subtotal:</span>
                                                    <span>${calculations.subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Items Tax:</span>
                                                    <span>${calculations.itemsTaxTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Order Tax:</span>
                                                    <span>${calculations.orderTax.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Shipping:</span>
                                                    <span>${calculations.shippingCost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Discount:</span>
                                                    <span>-${calculations.discountAmount.toFixed(2)}</span>
                                                </div>
                                                <Divider />
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total:</span>
                                                    <span>${calculations.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Grid>
                            </Grid>
                        </GlassCard>

                        {/* Additional Information */}
                        <GlassCard className="p-6 mb-6">
                            <Typography variant="h6" className="mb-4">
                                Additional Information
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Textarea
                                        label="Terms & Conditions"
                                        placeholder="Enter terms and conditions"
                                        value={formData.terms_conditions}
                                        onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                                        minRows={4}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Textarea
                                        label="Notes"
                                        placeholder="Enter any additional notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        minRows={4}
                                    />
                                </Grid>
                            </Grid>
                        </GlassCard>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <Button
                                color="secondary"
                                variant="flat"
                                onPress={() => router.visit('/scm/purchase-orders')}
                                isDisabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                onPress={() => handleSubmit('draft')}
                                isLoading={loading}
                                startContent={!loading && <DocumentTextIcon className="w-4 h-4" />}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                color="primary"
                                onPress={() => handleSubmit('pending')}
                                isLoading={loading}
                                startContent={!loading && <CheckIcon className="w-4 h-4" />}
                            >
                                Create Purchase Order
                            </Button>
                        </div>
                    </form>
                </Box>
            </Box>
        </App>
    );
};

export default PurchaseOrderCreate;
