import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Typography,
    useTheme,
    useMediaQuery,
    Grid,
} from '@mui/material';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Divider,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Switch
} from "@heroui/react";
import { 
    BuildingOfficeIcon,
    ArrowLeftIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';

const CreateSupplier = ({ categories = [] }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        tax_id: '',
        website: '',
        payment_terms: '',
        credit_limit: '',
        status: 'active',
        category_id: '',
        rating: '',
        notes: ''
    });

    const statusOptions = [
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
        { key: 'pending', label: 'Pending' }
    ];

    const ratingOptions = [
        { key: '1', label: '1 Star' },
        { key: '2', label: '2 Stars' },
        { key: '3', label: '3 Stars' },
        { key: '4', label: '4 Stars' },
        { key: '5', label: '5 Stars' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('scm.suppliers.store'), {
            onSuccess: () => {
                toast.success('Supplier created successfully!');
                reset();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Please check the form for errors.');
            }
        });
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            window.history.back();
        }
    };

    return (
        <App title="Create Supplier">
            <Head title="Create Supplier" />

            <PageHeader
                title="Create New Supplier"
                description="Add a new supplier to your supply chain network"
                icon={BuildingOfficeIcon}
                breadcrumbs={[
                    { label: 'Dashboard', href: route('dashboard') },
                    { label: 'SCM', href: route('scm.dashboard') },
                    { label: 'Suppliers', href: route('scm.suppliers.index') },
                    { label: 'Create', current: true }
                ]}
                actions={
                    <Button
                        variant="bordered"
                        startContent={<ArrowLeftIcon className="w-4 h-4" />}
                        as={Link}
                        href={route('scm.suppliers.index')}
                    >
                        Back to Suppliers
                    </Button>
                }
            />

            <div className="space-y-6 pb-6">
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12} lg={8}>
                            <GlassCard>
                                <CardHeader>
                                    <Typography variant="h6">Basic Information</Typography>
                                </CardHeader>
                                <Divider />
                                <CardBody className="space-y-6">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="Supplier Name"
                                                placeholder="Enter supplier name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                isInvalid={!!errors.name}
                                                errorMessage={errors.name}
                                                isRequired
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="Contact Person"
                                                placeholder="Enter contact person name"
                                                value={data.contact_person}
                                                onChange={(e) => setData('contact_person', e.target.value)}
                                                isInvalid={!!errors.contact_person}
                                                errorMessage={errors.contact_person}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                type="email"
                                                label="Email Address"
                                                placeholder="Enter email address"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                isInvalid={!!errors.email}
                                                errorMessage={errors.email}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="Phone Number"
                                                placeholder="Enter phone number"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                isInvalid={!!errors.phone}
                                                errorMessage={errors.phone}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Textarea
                                                label="Address"
                                                placeholder="Enter full address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                isInvalid={!!errors.address}
                                                errorMessage={errors.address}
                                                variant="bordered"
                                                minRows={3}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="City"
                                                placeholder="Enter city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                isInvalid={!!errors.city}
                                                errorMessage={errors.city}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="State/Province"
                                                placeholder="Enter state or province"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                isInvalid={!!errors.state}
                                                errorMessage={errors.state}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="ZIP/Postal Code"
                                                placeholder="Enter ZIP or postal code"
                                                value={data.zip}
                                                onChange={(e) => setData('zip', e.target.value)}
                                                isInvalid={!!errors.zip}
                                                errorMessage={errors.zip}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="Country"
                                                placeholder="Enter country"
                                                value={data.country}
                                                onChange={(e) => setData('country', e.target.value)}
                                                isInvalid={!!errors.country}
                                                errorMessage={errors.country}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardBody>
                            </GlassCard>
                        </Grid>

                        {/* Additional Details */}
                        <Grid item xs={12} lg={4}>
                            <GlassCard>
                                <CardHeader>
                                    <Typography variant="h6">Additional Details</Typography>
                                </CardHeader>
                                <Divider />
                                <CardBody className="space-y-6">
                                    <Input
                                        label="Tax ID"
                                        placeholder="Enter tax identification number"
                                        value={data.tax_id}
                                        onChange={(e) => setData('tax_id', e.target.value)}
                                        isInvalid={!!errors.tax_id}
                                        errorMessage={errors.tax_id}
                                        variant="bordered"
                                        size="lg"
                                    />
                                    
                                    <Input
                                        label="Website"
                                        placeholder="Enter website URL"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        isInvalid={!!errors.website}
                                        errorMessage={errors.website}
                                        variant="bordered"
                                        size="lg"
                                    />

                                    <Select
                                        label="Status"
                                        placeholder="Select status"
                                        selectedKeys={data.status ? [data.status] : []}
                                        onSelectionChange={(keys) => setData('status', Array.from(keys)[0])}
                                        isInvalid={!!errors.status}
                                        errorMessage={errors.status}
                                        variant="bordered"
                                        size="lg"
                                        isRequired
                                    >
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.key} value={option.key}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    {categories.length > 0 && (
                                        <Select
                                            label="Category"
                                            placeholder="Select category"
                                            selectedKeys={data.category_id ? [data.category_id] : []}
                                            onSelectionChange={(keys) => setData('category_id', Array.from(keys)[0])}
                                            isInvalid={!!errors.category_id}
                                            errorMessage={errors.category_id}
                                            variant="bordered"
                                            size="lg"
                                        >
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}

                                    <Select
                                        label="Rating"
                                        placeholder="Select supplier rating"
                                        selectedKeys={data.rating ? [data.rating] : []}
                                        onSelectionChange={(keys) => setData('rating', Array.from(keys)[0])}
                                        isInvalid={!!errors.rating}
                                        errorMessage={errors.rating}
                                        variant="bordered"
                                        size="lg"
                                    >
                                        {ratingOptions.map((option) => (
                                            <SelectItem key={option.key} value={option.key}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </CardBody>
                            </GlassCard>
                        </Grid>

                        {/* Financial Information */}
                        <Grid item xs={12} lg={8}>
                            <GlassCard>
                                <CardHeader>
                                    <Typography variant="h6">Financial Information</Typography>
                                </CardHeader>
                                <Divider />
                                <CardBody className="space-y-6">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                label="Payment Terms"
                                                placeholder="e.g., Net 30, 2/10 Net 30"
                                                value={data.payment_terms}
                                                onChange={(e) => setData('payment_terms', e.target.value)}
                                                isInvalid={!!errors.payment_terms}
                                                errorMessage={errors.payment_terms}
                                                variant="bordered"
                                                size="lg"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Input
                                                type="number"
                                                label="Credit Limit"
                                                placeholder="Enter credit limit"
                                                value={data.credit_limit}
                                                onChange={(e) => setData('credit_limit', e.target.value)}
                                                isInvalid={!!errors.credit_limit}
                                                errorMessage={errors.credit_limit}
                                                variant="bordered"
                                                size="lg"
                                                startContent={
                                                    <div className="pointer-events-none flex items-center">
                                                        <span className="text-default-400 text-small">$</span>
                                                    </div>
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Textarea
                                                label="Notes"
                                                placeholder="Additional notes about the supplier"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                isInvalid={!!errors.notes}
                                                errorMessage={errors.notes}
                                                variant="bordered"
                                                minRows={4}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardBody>
                            </GlassCard>
                        </Grid>
                    </Grid>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 mt-8">
                        <Button
                            variant="bordered"
                            onPress={handleCancel}
                            startContent={<XMarkIcon className="w-4 h-4" />}
                            size="lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={processing}
                            startContent={!processing && <CheckIcon className="w-4 h-4" />}
                            size="lg"
                        >
                            {processing ? 'Creating...' : 'Create Supplier'}
                        </Button>
                    </div>
                </form>
            </div>
        </App>
    );
};

export default CreateSupplier;
