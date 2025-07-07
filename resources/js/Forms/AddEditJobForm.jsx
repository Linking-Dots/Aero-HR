import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
    Button, 
    Input, 
    Select, 
    SelectItem, 
    Textarea,
    DatePicker,
    Switch,
    Chip
} from '@heroui/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { parseDate } from '@internationalized/date';
import { format } from 'date-fns';
import GlassDialog from '../Components/GlassDialog';

const AddEditJobForm = ({ open, onClose, job = null, fetchData, currentPage, perPage, filterData }) => {
    const isEditing = !!job;
    const [formData, setFormData] = useState({
        title: '',
        designation_id: '',
        department_id: '',
        job_type: 'full_time',
        location: '',
        is_remote: false,
        description: '',
        responsibilities: [],
        requirements: [],
        qualifications: [],
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        benefits: [],
        posted_date: format(new Date(), 'yyyy-MM-dd'),
        closing_date: '',
        status: 'draft',
        hiring_manager_id: '',
        positions_count: 1,
        is_internal: false,
        is_featured: false
    });
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [managers, setManagers] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [itemType, setItemType] = useState('responsibilities');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        // Fetch required data
        const fetchRequiredData = async () => {
            try {
                const [
                    designationsResponse, 
                    departmentsResponse, 
                    managersResponse
                ] = await Promise.all([
                    axios.get(route('designations.list')),
                    axios.get(route('departments.list')),
                    axios.get(route('users.managers.list'))
                ]);
                
                setDesignations(designationsResponse.data);
                setDepartments(departmentsResponse.data);
                setManagers(managersResponse.data);
            } catch (error) {
                console.error('Failed to fetch required data:', error);
                toast.error('Failed to load required data for the form.');
            }
        };
        
        fetchRequiredData();
        
        // Set form data if editing
        if (isEditing && job) {
            setFormData({
                title: job.title || '',
                designation_id: job.designation_id || '',
                department_id: job.department_id || '',
                job_type: job.job_type || 'full_time',
                location: job.location || '',
                is_remote: job.is_remote || false,
                description: job.description || '',
                responsibilities: job.responsibilities || [],
                requirements: job.requirements || [],
                qualifications: job.qualifications || [],
                salary_min: job.salary_min || '',
                salary_max: job.salary_max || '',
                salary_currency: job.salary_currency || 'USD',
                benefits: job.benefits || [],
                posted_date: job.posted_date || format(new Date(), 'yyyy-MM-dd'),
                closing_date: job.closing_date || '',
                status: job.status || 'draft',
                hiring_manager_id: job.hiring_manager_id || '',
                positions_count: job.positions_count || 1,
                is_internal: job.is_internal || false,
                is_featured: job.is_featured || false
            });
        }
    }, [isEditing, job]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    const handleDateChange = (name, date) => {
        setFormData(prev => ({
            ...prev,
            [name]: date ? format(new Date(date), 'yyyy-MM-dd') : ''
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    const handleAddItem = () => {
        if (!newItem.trim()) return;
        
        setFormData(prev => ({
            ...prev,
            [itemType]: [...prev[itemType], newItem.trim()]
        }));
        
        setNewItem('');
    };
    
    const handleDeleteItem = (item, type) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(i => i !== item)
        }));
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.designation_id) newErrors.designation_id = 'Designation is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (!formData.job_type) newErrors.job_type = 'Job type is required';
        if (!formData.location && !formData.is_remote) newErrors.location = 'Location is required for non-remote jobs';
        if (!formData.description) newErrors.description = 'Description is required';
        if (formData.responsibilities.length === 0) newErrors.responsibilities = 'At least one responsibility is required';
        if (formData.requirements.length === 0) newErrors.requirements = 'At least one requirement is required';
        if (!formData.hiring_manager_id) newErrors.hiring_manager_id = 'Hiring manager is required';
        if (!formData.positions_count || formData.positions_count < 1) newErrors.positions_count = 'Positions count must be at least 1';
        
        // Check salary range
        if (formData.salary_min && formData.salary_max) {
            if (parseFloat(formData.salary_min) > parseFloat(formData.salary_max)) {
                newErrors.salary_max = 'Maximum salary must be greater than or equal to minimum salary';
            }
        }
        
        // Check dates
        if (formData.posted_date && formData.closing_date) {
            const postedDate = new Date(formData.posted_date);
            const closingDate = new Date(formData.closing_date);
            
            if (closingDate < postedDate) {
                newErrors.closing_date = 'Closing date must be after posted date';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        try {
            if (isEditing) {
                await axios.put(route('hr.recruitment.jobs.update', job.id), formData);
                toast.success('Job posting updated successfully');
            } else {
                await axios.post(route('hr.recruitment.jobs.store'), formData);
                toast.success('Job posting created successfully');
            }
            
            fetchData({ page: currentPage, perPage, ...filterData });
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('An error occurred while saving the job posting');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const jobTypeOptions = [
        { value: 'full_time', label: 'Full Time' },
        { value: 'part_time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'temporary', label: 'Temporary' },
        { value: 'internship', label: 'Internship' }
    ];
    
    const currencyOptions = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'INR', label: 'INR (₹)' },
        { value: 'JPY', label: 'JPY (¥)' },
        { value: 'CAD', label: 'CAD ($)' },
        { value: 'AUD', label: 'AUD ($)' }
    ];
    
    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending Approval' },
        { value: 'published', label: 'Published' },
        { value: 'closed', label: 'Closed' },
        { value: 'on_hold', label: 'On Hold' }
    ];
    
    return (
        <GlassDialog
            open={open}
            onClose={onClose}
            title={isEditing ? 'Edit Job Posting' : 'Add New Job Posting'}
            maxWidth="4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Job Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        isRequired
                        isInvalid={!!errors.title}
                        errorMessage={errors.title}
                    />
                    
                    <Select
                        label="Designation"
                        name="designation_id"
                        selectedKeys={formData.designation_id ? [formData.designation_id.toString()] : []}
                        onSelectionChange={(keys) => handleChange({ target: { name: 'designation_id', value: Array.from(keys)[0] } })}
                        isRequired
                        isInvalid={!!errors.designation_id}
                        errorMessage={errors.designation_id}
                    >
                        {designations.map((designation) => (
                            <SelectItem key={designation.id} value={designation.id}>
                                {designation.name}
                            </SelectItem>
                        ))}
                    </Select>
                    
                    <Select
                        label="Department"
                        name="department_id"
                        selectedKeys={formData.department_id ? [formData.department_id.toString()] : []}
                        onSelectionChange={(keys) => handleChange({ target: { name: 'department_id', value: Array.from(keys)[0] } })}
                        isRequired
                        isInvalid={!!errors.department_id}
                        errorMessage={errors.department_id}
                    >
                        {departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                                {department.name}
                            </SelectItem>
                        ))}
                    </Select>
                    
                    <Select
                        label="Job Type"
                        name="job_type"
                        selectedKeys={[formData.job_type]}
                        onSelectionChange={(keys) => handleChange({ target: { name: 'job_type', value: Array.from(keys)[0] } })}
                        isRequired
                        isInvalid={!!errors.job_type}
                        errorMessage={errors.job_type}
                    >
                        {jobTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Location and Remote */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4">
                        <Switch
                            isSelected={formData.is_remote}
                            onValueChange={(value) => handleChange({ target: { name: 'is_remote', value, type: 'checkbox' } })}
                            aria-label="Remote Job"
                        >
                            Remote Job
                        </Switch>
                    </div>
                    
                    <Input
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        isDisabled={formData.is_remote}
                        isRequired={!formData.is_remote}
                        isInvalid={!!errors.location}
                        errorMessage={errors.location}
                        placeholder={formData.is_remote ? "Not applicable for remote jobs" : "Enter job location"}
                    />
                </div>

                {/* Management and Counts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Hiring Manager"
                        name="hiring_manager_id"
                        selectedKeys={formData.hiring_manager_id ? [formData.hiring_manager_id.toString()] : []}
                        onSelectionChange={(keys) => handleChange({ target: { name: 'hiring_manager_id', value: Array.from(keys)[0] } })}
                        isRequired
                        isInvalid={!!errors.hiring_manager_id}
                        errorMessage={errors.hiring_manager_id}
                    >
                        {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                                {manager.name}
                            </SelectItem>
                        ))}
                    </Select>
                    
                    <Input
                        label="Number of Positions"
                        name="positions_count"
                        type="number"
                        value={formData.positions_count.toString()}
                        onChange={handleChange}
                        isRequired
                        isInvalid={!!errors.positions_count}
                        errorMessage={errors.positions_count}
                        min={1}
                    />
                </div>

                {/* Status and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="Status"
                        name="status"
                        selectedKeys={[formData.status]}
                        onSelectionChange={(keys) => handleChange({ target: { name: 'status', value: Array.from(keys)[0] } })}
                        isRequired
                        isInvalid={!!errors.status}
                        errorMessage={errors.status}
                    >
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                    
                    <DatePicker
                        label="Posted Date"
                        value={formData.posted_date ? parseDate(formData.posted_date) : null}
                        onChange={(date) => handleDateChange('posted_date', date)}
                        isRequired
                        isInvalid={!!errors.posted_date}
                        errorMessage={errors.posted_date}
                    />
                    
                    <DatePicker
                        label="Closing Date"
                        value={formData.closing_date ? parseDate(formData.closing_date) : null}
                        onChange={(date) => handleDateChange('closing_date', date)}
                        isInvalid={!!errors.closing_date}
                        errorMessage={errors.closing_date}
                    />
                </div>

                {/* Description */}
                <Textarea
                    label="Job Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    isRequired
                    isInvalid={!!errors.description}
                    errorMessage={errors.description}
                    minRows={4}
                    placeholder="Describe the job role, company culture, and what makes this position attractive..."
                />

                {/* Responsibilities */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Responsibilities</h3>
                        <div className="flex items-center space-x-2">
                            <Input
                                label="Add Responsibility"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (itemType === 'responsibilities') handleAddItem();
                                    }
                                }}
                                size="sm"
                                className="w-64"
                            />
                            <Button
                                size="sm"
                                color="primary"
                                onPress={() => {
                                    setItemType('responsibilities');
                                    handleAddItem();
                                }}
                                isDisabled={!newItem.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.responsibilities.map((item, index) => (
                            <Chip
                                key={index}
                                onClose={() => handleDeleteItem(item, 'responsibilities')}
                                variant="flat"
                                color="primary"
                            >
                                {item}
                            </Chip>
                        ))}
                    </div>
                    {errors.responsibilities && (
                        <p className="text-danger text-sm">{errors.responsibilities}</p>
                    )}
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Requirements</h3>
                        <div className="flex items-center space-x-2">
                            <Input
                                label="Add Requirement"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (itemType === 'requirements') handleAddItem();
                                    }
                                }}
                                size="sm"
                                className="w-64"
                            />
                            <Button
                                size="sm"
                                color="secondary"
                                onPress={() => {
                                    setItemType('requirements');
                                    handleAddItem();
                                }}
                                isDisabled={!newItem.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.requirements.map((item, index) => (
                            <Chip
                                key={index}
                                onClose={() => handleDeleteItem(item, 'requirements')}
                                variant="flat"
                                color="secondary"
                            >
                                {item}
                            </Chip>
                        ))}
                    </div>
                    {errors.requirements && (
                        <p className="text-danger text-sm">{errors.requirements}</p>
                    )}
                </div>

                {/* Qualifications */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Qualifications</h3>
                        <div className="flex items-center space-x-2">
                            <Input
                                label="Add Qualification"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (itemType === 'qualifications') handleAddItem();
                                    }
                                }}
                                size="sm"
                                className="w-64"
                            />
                            <Button
                                size="sm"
                                color="success"
                                onPress={() => {
                                    setItemType('qualifications');
                                    handleAddItem();
                                }}
                                isDisabled={!newItem.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.qualifications.map((item, index) => (
                            <Chip
                                key={index}
                                onClose={() => handleDeleteItem(item, 'qualifications')}
                                variant="flat"
                                color="success"
                            >
                                {item}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Salary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Minimum Salary"
                        name="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={handleChange}
                        startContent={currencyOptions.find(c => c.value === formData.salary_currency)?.label.split(' ')[1] || '$'}
                    />
                    
                    <Input
                        label="Maximum Salary"
                        name="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={handleChange}
                        isInvalid={!!errors.salary_max}
                        errorMessage={errors.salary_max}
                        startContent={currencyOptions.find(c => c.value === formData.salary_currency)?.label.split(' ')[1] || '$'}
                    />
                    
                    <Select
                        label="Currency"
                        name="salary_currency"
                        selectedKeys={[formData.salary_currency]}
                        onSelectionChange={(keys) => handleChange({ target: { name: 'salary_currency', value: Array.from(keys)[0] } })}
                    >
                        {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Benefits</h3>
                        <div className="flex items-center space-x-2">
                            <Input
                                label="Add Benefit"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (itemType === 'benefits') handleAddItem();
                                    }
                                }}
                                size="sm"
                                className="w-64"
                            />
                            <Button
                                size="sm"
                                color="warning"
                                onPress={() => {
                                    setItemType('benefits');
                                    handleAddItem();
                                }}
                                isDisabled={!newItem.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.benefits.map((item, index) => (
                            <Chip
                                key={index}
                                onClose={() => handleDeleteItem(item, 'benefits')}
                                variant="flat"
                                color="warning"
                            >
                                {item}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4">
                        <Switch
                            isSelected={formData.is_internal}
                            onValueChange={(value) => handleChange({ target: { name: 'is_internal', value, type: 'checkbox' } })}
                            aria-label="Internal Job Posting"
                        >
                            Internal Job Posting
                        </Switch>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <Switch
                            isSelected={formData.is_featured}
                            onValueChange={(value) => handleChange({ target: { name: 'is_featured', value, type: 'checkbox' } })}
                            aria-label="Featured Job"
                        >
                            Featured Job
                        </Switch>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button
                        variant="light"
                        onPress={onClose}
                        isDisabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        isLoading={loading}
                        loadingText={isEditing ? "Updating..." : "Creating..."}
                    >
                        {isEditing ? 'Update Job Posting' : 'Create Job Posting'}
                    </Button>
                </div>
            </form>
        </GlassDialog>
    );
};

export default AddEditJobForm;
