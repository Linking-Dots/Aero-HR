import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    BuildingOfficeIcon,
    UserIcon,
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    KeyIcon,
    CogIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { 
    Card, 
    CardBody, 
    Button, 
    Input, 
    Textarea, 
    Switch, 
    Select, 
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Avatar,
    Divider,
    Chip
} from '@heroui/react';
import App from "@/Layouts/App.jsx";

export default function TenantSettings({ 
    auth, 
    tenant, 
    timezones, 
    currencies,
    integrations,
    apiKeys
}) {
    const [activeTab, setActiveTab] = useState('general');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(tenant?.logo_url);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: tenant?.name || '',
        domain: tenant?.domain || '',
        description: tenant?.description || '',
        website: tenant?.website || '',
        phone: tenant?.phone || '',
        address: tenant?.address || '',
        timezone: tenant?.timezone || 'UTC',
        currency: tenant?.currency || 'USD',
        date_format: tenant?.date_format || 'Y-m-d',
        time_format: tenant?.time_format || '24',
        language: tenant?.language || 'en',
        logo: null,
        // Notification settings
        email_notifications: tenant?.settings?.email_notifications ?? true,
        browser_notifications: tenant?.settings?.browser_notifications ?? true,
        marketing_emails: tenant?.settings?.marketing_emails ?? false,
        // Security settings
        two_factor_required: tenant?.settings?.two_factor_required ?? false,
        session_timeout: tenant?.settings?.session_timeout || '120',
        allowed_domains: tenant?.settings?.allowed_domains || '',
        // Integration settings
        slack_webhook: tenant?.settings?.slack_webhook || '',
        webhook_url: tenant?.settings?.webhook_url || ''
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    const tabs = [
        { id: 'general', name: 'General', icon: CogIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
        { id: 'api', name: 'API Keys', icon: KeyIcon }
    ];

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setData('logo', file);
            
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        router.post(route('tenant.settings.update'), formData, {
            forceFormData: true,
            onSuccess: () => {
                // Show success message
            }
        });
    };

    const handleDeleteTenant = () => {
        router.delete(route('tenant.destroy'), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    const generateApiKey = () => {
        router.post(route('api-keys.generate'), {
            name: 'Default API Key',
            permissions: ['read', 'write']
        });
    };

    const revokeApiKey = (keyId) => {
        router.delete(route('api-keys.revoke', keyId));
    };

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            {/* Organization Details */}
            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Organization Details
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Organization Logo
                            </label>
                            <div className="flex items-center space-x-4">
                                <Avatar
                                    src={logoPreview}
                                    fallback={<BuildingOfficeIcon className="w-8 h-8" />}
                                    size="lg"
                                    className="w-16 h-16"
                                />
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Upload Logo
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Recommended: 256x256px, PNG or JPG
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Input
                            label="Organization Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            errorMessage={errors.name}
                            isInvalid={!!errors.name}
                            isRequired
                        />

                        <Input
                            label="Subdomain"
                            value={data.domain}
                            onChange={(e) => setData('domain', e.target.value)}
                            errorMessage={errors.domain}
                            isInvalid={!!errors.domain}
                            description="Your organization's subdomain (e.g., company.aero-hr.com)"
                            endContent={<span className="text-gray-500">.aero-hr.com</span>}
                        />

                        <Input
                            label="Website"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            errorMessage={errors.website}
                            isInvalid={!!errors.website}
                            placeholder="https://example.com"
                        />

                        <Input
                            label="Phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            errorMessage={errors.phone}
                            isInvalid={!!errors.phone}
                        />

                        <Textarea
                            label="Description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            errorMessage={errors.description}
                            isInvalid={!!errors.description}
                            className="md:col-span-2"
                            maxRows={3}
                        />

                        <Textarea
                            label="Address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            errorMessage={errors.address}
                            isInvalid={!!errors.address}
                            className="md:col-span-2"
                            maxRows={3}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Regional Settings */}
            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Regional Settings
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <Select
                            label="Timezone"
                            selectedKeys={[data.timezone]}
                            onSelectionChange={(keys) => setData('timezone', Array.from(keys)[0])}
                        >
                            {timezones?.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Currency"
                            selectedKeys={[data.currency]}
                            onSelectionChange={(keys) => setData('currency', Array.from(keys)[0])}
                        >
                            {currencies?.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                    {currency.name} ({currency.symbol})
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Date Format"
                            selectedKeys={[data.date_format]}
                            onSelectionChange={(keys) => setData('date_format', Array.from(keys)[0])}
                        >
                            <SelectItem key="Y-m-d" value="Y-m-d">YYYY-MM-DD</SelectItem>
                            <SelectItem key="m/d/Y" value="m/d/Y">MM/DD/YYYY</SelectItem>
                            <SelectItem key="d/m/Y" value="d/m/Y">DD/MM/YYYY</SelectItem>
                            <SelectItem key="d-m-Y" value="d-m-Y">DD-MM-YYYY</SelectItem>
                        </Select>

                        <Select
                            label="Time Format"
                            selectedKeys={[data.time_format]}
                            onSelectionChange={(keys) => setData('time_format', Array.from(keys)[0])}
                        >
                            <SelectItem key="24" value="24">24 Hour</SelectItem>
                            <SelectItem key="12" value="12">12 Hour (AM/PM)</SelectItem>
                        </Select>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const renderNotificationSettings = () => (
        <Card>
            <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                </h3>
                
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                            isSelected={data.email_notifications}
                            onValueChange={(checked) => setData('email_notifications', checked)}
                        />
                    </div>

                    <Divider />

                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Browser Notifications</h4>
                            <p className="text-sm text-gray-500">Show desktop notifications in your browser</p>
                        </div>
                        <Switch
                            isSelected={data.browser_notifications}
                            onValueChange={(checked) => setData('browser_notifications', checked)}
                        />
                    </div>

                    <Divider />

                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Marketing Emails</h4>
                            <p className="text-sm text-gray-500">Receive product updates and tips</p>
                        </div>
                        <Switch
                            isSelected={data.marketing_emails}
                            onValueChange={(checked) => setData('marketing_emails', checked)}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Security Settings
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Require Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
                            </div>
                            <Switch
                                isSelected={data.two_factor_required}
                                onValueChange={(checked) => setData('two_factor_required', checked)}
                            />
                        </div>

                        <Divider />

                        <div className="grid md:grid-cols-2 gap-6">
                            <Select
                                label="Session Timeout (minutes)"
                                selectedKeys={[data.session_timeout]}
                                onSelectionChange={(keys) => setData('session_timeout', Array.from(keys)[0])}
                            >
                                <SelectItem key="30" value="30">30 minutes</SelectItem>
                                <SelectItem key="60" value="60">1 hour</SelectItem>
                                <SelectItem key="120" value="120">2 hours</SelectItem>
                                <SelectItem key="240" value="240">4 hours</SelectItem>
                                <SelectItem key="480" value="480">8 hours</SelectItem>
                            </Select>

                            <Input
                                label="Allowed Email Domains"
                                value={data.allowed_domains}
                                onChange={(e) => setData('allowed_domains', e.target.value)}
                                placeholder="example.com, company.org"
                                description="Comma-separated list of allowed email domains for user registration"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const renderIntegrationsSettings = () => (
        <div className="space-y-6">
            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        External Integrations
                    </h3>
                    
                    <div className="space-y-6">
                        <Input
                            label="Slack Webhook URL"
                            value={data.slack_webhook}
                            onChange={(e) => setData('slack_webhook', e.target.value)}
                            placeholder="https://hooks.slack.com/services/..."
                            description="Send notifications to Slack"
                        />

                        <Input
                            label="Generic Webhook URL"
                            value={data.webhook_url}
                            onChange={(e) => setData('webhook_url', e.target.value)}
                            placeholder="https://your-app.com/webhook"
                            description="Receive event notifications via webhook"
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Available Integrations */}
            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Available Integrations
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        {integrations?.map((integration) => (
                            <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        <GlobeAltIcon className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {integration.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {integration.description}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    color={integration.connected ? "success" : "primary"}
                                    variant={integration.connected ? "bordered" : "solid"}
                                >
                                    {integration.connected ? 'Connected' : 'Connect'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const renderApiSettings = () => (
        <div className="space-y-6">
            <Card>
                <CardBody className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            API Keys
                        </h3>
                        <Button
                            color="primary"
                            startContent={<KeyIcon className="w-4 h-4" />}
                            onPress={generateApiKey}
                        >
                            Generate New Key
                        </Button>
                    </div>
                    
                    {apiKeys && apiKeys.length > 0 ? (
                        <div className="space-y-4">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {key.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 font-mono">
                                            {key.key.substring(0, 20)}...
                                        </p>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Chip size="sm" color="primary">
                                                {key.permissions?.join(', ')}
                                            </Chip>
                                            <span className="text-xs text-gray-500">
                                                Created {new Date(key.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        color="danger"
                                        variant="light"
                                        startContent={<TrashIcon className="w-4 h-4" />}
                                        onPress={() => revokeApiKey(key.id)}
                                    >
                                        Revoke
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <KeyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No API keys generated yet</p>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* API Documentation */}
            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        API Documentation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Learn how to integrate with our API to manage your HR data programmatically.
                    </p>
                    <Button variant="bordered">
                        View API Docs
                    </Button>
                </CardBody>
            </Card>
        </div>
    );

    return (
        <App>
            <Head title="Organization Settings" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Organization Settings
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Manage your organization's configuration and preferences
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Navigation */}
                <motion.div variants={itemVariants}>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <tab.icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </motion.div>

                {/* Settings Content */}
                <motion.form variants={itemVariants} onSubmit={handleSubmit}>
                    {activeTab === 'general' && renderGeneralSettings()}
                    {activeTab === 'notifications' && renderNotificationSettings()}
                    {activeTab === 'security' && renderSecuritySettings()}
                    {activeTab === 'integrations' && renderIntegrationsSettings()}
                    {activeTab === 'api' && renderApiSettings()}

                    {/* Save Button - Don't show for API tab */}
                    {activeTab !== 'api' && (
                        <div className="flex justify-between items-center pt-6">
                            <Button
                                color="danger"
                                variant="bordered"
                                startContent={<TrashIcon className="w-4 h-4" />}
                                onPress={() => setIsDeleteModalOpen(true)}
                            >
                                Delete Organization
                            </Button>
                            
                            <div className="flex space-x-3">
                                <Button variant="bordered" onPress={() => reset()}>
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    isLoading={processing}
                                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.form>
            </motion.div>

            {/* Delete Organization Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <ModalContent>
                    <ModalHeader className="text-red-600">Delete Organization</ModalHeader>
                    <ModalBody>
                        <div className="flex items-start space-x-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium mb-2">
                                    This action cannot be undone!
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Deleting your organization will permanently remove all data, including:
                                </p>
                                <ul className="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-4 list-disc">
                                    <li>All employee records</li>
                                    <li>Time tracking data</li>
                                    <li>Projects and tasks</li>
                                    <li>Documents and files</li>
                                    <li>All other organization data</li>
                                </ul>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            color="danger" 
                            onPress={handleDeleteTenant}
                            isLoading={processing}
                        >
                            Yes, Delete Organization
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </App>
    );
}
