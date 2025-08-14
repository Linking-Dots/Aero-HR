import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Box, 
    Grid, 
    Typography,
    IconButton,
    Rating
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Input, Select, SelectItem, Textarea, DatePicker } from '@heroui/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';

const AddEditPerformanceReviewForm = ({ open, onClose, performanceReview = null, fetchData, currentPage, perPage, filterData }) => {
    const isEditing = !!performanceReview;
    const [formData, setFormData] = useState({
        employee_id: '',
        reviewer_id: '',
        review_period_start: '',
        review_period_end: '',
        review_date: '',
        status: 'draft',
        overall_rating: 0,
        goals_achieved: '',
        strengths: '',
        areas_for_improvement: '',
        comments: '',
        next_review_date: '',
        template_id: '',
        department_id: ''
    });
    const [employees, setEmployees] = useState([]);
    const [reviewers, setReviewers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        // Fetch required data
        const fetchRequiredData = async () => {
            try {
                const [
                    employeesResponse, 
                    departmentsResponse, 
                    templatesResponse
                ] = await Promise.all([
                    axios.get(route('users.list')),
                    axios.get(route('departments.list')),
                    axios.get(route('hr.performance.templates.list'))
                ]);
                
                setEmployees(employeesResponse.data);
                setReviewers(employeesResponse.data);
                setDepartments(departmentsResponse.data);
                setTemplates(templatesResponse.data);
            } catch (error) {
                console.error('Failed to fetch required data:', error);
                toast.error('Failed to load required data for the form.');
            }
        };
        
        fetchRequiredData();
        
        // Set form data if editing
        if (isEditing && performanceReview) {
            setFormData({
                employee_id: performanceReview.employee_id || '',
                reviewer_id: performanceReview.reviewer_id || '',
                review_period_start: performanceReview.review_period_start || '',
                review_period_end: performanceReview.review_period_end || '',
                review_date: performanceReview.review_date || '',
                status: performanceReview.status || 'draft',
                overall_rating: performanceReview.overall_rating || 0,
                goals_achieved: performanceReview.goals_achieved || '',
                strengths: performanceReview.strengths || '',
                areas_for_improvement: performanceReview.areas_for_improvement || '',
                comments: performanceReview.comments || '',
                next_review_date: performanceReview.next_review_date || '',
                template_id: performanceReview.template_id || '',
                department_id: performanceReview.department_id || ''
            });
        }
    }, [isEditing, performanceReview]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            [name]: date ? dayjs(date).format('YYYY-MM-DD') : ''
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    const handleRatingChange = (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            overall_rating: newValue
        }));
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.employee_id) newErrors.employee_id = 'Employee is required';
        if (!formData.reviewer_id) newErrors.reviewer_id = 'Reviewer is required';
        if (!formData.review_period_start) newErrors.review_period_start = 'Review period start date is required';
        if (!formData.review_period_end) newErrors.review_period_end = 'Review period end date is required';
        if (!formData.status) newErrors.status = 'Status is required';
        if (!formData.template_id) newErrors.template_id = 'Review template is required';
        
        // Check if end date is after start date
        if (formData.review_period_start && formData.review_period_end) {
            const startDate = new Date(formData.review_period_start);
            const endDate = new Date(formData.review_period_end);
            
            if (endDate < startDate) {
                newErrors.review_period_end = 'End date must be after start date';
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
                await axios.put(route('hr.performance.reviews.update', performanceReview.id), formData);
                toast.success('Performance review updated successfully');
            } else {
                await axios.post(route('hr.performance.reviews.store'), formData);
                toast.success('Performance review created successfully');
            }
            
            fetchData({ page: currentPage, perPage, ...filterData });
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('An error occurred while saving the performance review');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
    ];
    
    return (
        <>
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                    {isEditing ? 'Edit Performance Review' : 'Add New Performance Review'}
                </Typography>
                <IconButton onClick={onClose} aria-label="close">
                    <XMarkIcon className="w-5 h-5" />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                <Box component="form" id="performance-review-form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        {/* Employee Selection */}
                        <Grid item xs={12} md={6}>
                            <Select
                                name="employee_id"
                                label="Employee"
                                placeholder="Select an employee"
                                selectedKeys={formData.employee_id ? [formData.employee_id.toString()] : []}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0];
                                    handleChange({ target: { name: 'employee_id', value }});
                                }}
                                isInvalid={!!errors.employee_id}
                                errorMessage={errors.employee_id}
                                isRequired
                                variant="bordered"
                                classNames={{
                                    trigger: "h-unit-12",
                                }}
                            >
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        {employee.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </Grid>
                        
                        {/* Reviewer Selection */}
                        <Grid item xs={12} md={6}>
                            <Select
                                name="reviewer_id"
                                label="Reviewer"
                                placeholder="Select a reviewer"
                                selectedKeys={formData.reviewer_id ? [formData.reviewer_id.toString()] : []}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0];
                                    handleChange({ target: { name: 'reviewer_id', value }});
                                }}
                                isInvalid={!!errors.reviewer_id}
                                errorMessage={errors.reviewer_id}
                                isRequired
                                variant="bordered"
                                classNames={{
                                    trigger: "h-unit-12",
                                }}
                            >
                                {reviewers.map((reviewer) => (
                                    <SelectItem key={reviewer.id} value={reviewer.id}>
                                        {reviewer.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </Grid>
                        
                        {/* Department Selection */}
                        <Grid item xs={12} md={6}>
                            <Select
                                name="department_id"
                                label="Department"
                                placeholder="Select a department"
                                selectedKeys={formData.department_id ? [formData.department_id.toString()] : []}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0];
                                    handleChange({ target: { name: 'department_id', value }});
                                }}
                                isInvalid={!!errors.department_id}
                                errorMessage={errors.department_id}
                                variant="bordered"
                                classNames={{
                                    trigger: "h-unit-12",
                                }}
                            >
                                {departments.map((department) => (
                                    <SelectItem key={department.id} value={department.id}>
                                        {department.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </Grid>
                        
                        {/* Template Selection */}
                        <Grid item xs={12} md={6}>
                            <Select
                                name="template_id"
                                label="Review Template"
                                placeholder="Select a template"
                                selectedKeys={formData.template_id ? [formData.template_id.toString()] : []}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0];
                                    handleChange({ target: { name: 'template_id', value }});
                                }}
                                isInvalid={!!errors.template_id}
                                errorMessage={errors.template_id}
                                isRequired
                                variant="bordered"
                                classNames={{
                                    trigger: "h-unit-12",
                                }}
                            >
                                {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </Grid>
                        
                        {/* Review Period Start */}
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                name="review_period_start"
                                label="Review Period Start"
                                value={formData.review_period_start}
                                onChange={(date) => handleDateChange('review_period_start', date)}
                                isInvalid={!!errors.review_period_start}
                                errorMessage={errors.review_period_start}
                                isRequired
                                variant="bordered"
                                showMonthAndYearPickers
                                classNames={{
                                    base: "w-full",
                                    input: "text-small",
                                    inputWrapper: "h-unit-12",
                                }}
                            />
                        </Grid>
                        
                        {/* Review Period End */}
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                name="review_period_end"
                                label="Review Period End"
                                value={formData.review_period_end}
                                onChange={(date) => handleDateChange('review_period_end', date)}
                                isInvalid={!!errors.review_period_end}
                                errorMessage={errors.review_period_end}
                                isRequired
                                variant="bordered"
                                showMonthAndYearPickers
                                classNames={{
                                    base: "w-full",
                                    input: "text-small",
                                    inputWrapper: "h-unit-12",
                                }}
                            />
                        </Grid>
                        
                        {/* Review Date */}
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                name="review_date"
                                label="Review Date"
                                value={formData.review_date}
                                onChange={(date) => handleDateChange('review_date', date)}
                                isInvalid={!!errors.review_date}
                                errorMessage={errors.review_date}
                                variant="bordered"
                                showMonthAndYearPickers
                                classNames={{
                                    base: "w-full",
                                    input: "text-small",
                                    inputWrapper: "h-unit-12",
                                }}
                            />
                        </Grid>
                        
                        {/* Next Review Date */}
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                name="next_review_date"
                                label="Next Review Date"
                                value={formData.next_review_date}
                                onChange={(date) => handleDateChange('next_review_date', date)}
                                isInvalid={!!errors.next_review_date}
                                errorMessage={errors.next_review_date}
                                variant="bordered"
                                showMonthAndYearPickers
                                classNames={{
                                    base: "w-full",
                                    input: "text-small",
                                    inputWrapper: "h-unit-12",
                                }}
                            />
                        </Grid>
                        
                        {/* Status */}
                        <Grid item xs={12} md={6}>
                            <Select
                                name="status"
                                label="Status"
                                placeholder="Select status"
                                selectedKeys={[formData.status]}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0];
                                    handleChange({ target: { name: 'status', value }});
                                }}
                                isInvalid={!!errors.status}
                                errorMessage={errors.status}
                                isRequired
                                variant="bordered"
                                classNames={{
                                    trigger: "h-unit-12",
                                }}
                            >
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </Grid>
                        
                        {/* Overall Rating */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="legend">Overall Rating</Typography>
                                <Rating
                                    name="overall_rating"
                                    value={formData.overall_rating}
                                    onChange={handleRatingChange}
                                    precision={0.5}
                                    max={5}
                                />
                                {errors.overall_rating && (
                                    <Typography variant="caption" color="error">
                                        {errors.overall_rating}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        
                        {/* Goals Achieved */}
                        <Grid item xs={12}>
                            <Textarea
                                name="goals_achieved"
                                label="Goals Achieved"
                                placeholder="Describe the goals achieved during this review period"
                                value={formData.goals_achieved}
                                onChange={(e) => handleChange({ target: { name: 'goals_achieved', value: e.target.value }})}
                                isInvalid={!!errors.goals_achieved}
                                errorMessage={errors.goals_achieved}
                                variant="bordered"
                                minRows={3}
                                classNames={{
                                    input: "text-small",
                                }}
                            />
                        </Grid>
                        
                        {/* Strengths */}
                        <Grid item xs={12}>
                            <Textarea
                                name="strengths"
                                label="Strengths"
                                placeholder="List the employee's strengths and positive attributes"
                                value={formData.strengths}
                                onChange={(e) => handleChange({ target: { name: 'strengths', value: e.target.value }})}
                                isInvalid={!!errors.strengths}
                                errorMessage={errors.strengths}
                                variant="bordered"
                                minRows={3}
                                classNames={{
                                    input: "text-small",
                                }}
                            />
                        </Grid>
                        
                        {/* Areas for Improvement */}
                        <Grid item xs={12}>
                            <Textarea
                                name="areas_for_improvement"
                                label="Areas for Improvement"
                                placeholder="Identify areas where the employee can improve"
                                value={formData.areas_for_improvement}
                                onChange={(e) => handleChange({ target: { name: 'areas_for_improvement', value: e.target.value }})}
                                isInvalid={!!errors.areas_for_improvement}
                                errorMessage={errors.areas_for_improvement}
                                variant="bordered"
                                minRows={3}
                                classNames={{
                                    input: "text-small",
                                }}
                            />
                        </Grid>
                        
                        {/* Comments */}
                        <Grid item xs={12}>
                            <Textarea
                                name="comments"
                                label="Additional Comments"
                                placeholder="Add any additional comments or notes"
                                value={formData.comments}
                                onChange={(e) => handleChange({ target: { name: 'comments', value: e.target.value }})}
                                isInvalid={!!errors.comments}
                                errorMessage={errors.comments}
                                variant="bordered"
                                minRows={3}
                                classNames={{
                                    input: "text-small",
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <Button 
                    onClick={onClose} 
                    variant="text"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    form="performance-review-form"
                    variant="primary"
                    loading={loading}
                >
                    {isEditing ? 'Update Review' : 'Create Review'}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default AddEditPerformanceReviewForm;
