/**
 * AddUserForm - Molecule Component
 * Modern user creation form with validation
 * Phase 6: Complete frontend migration
 */

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@atoms/button';
import { Input } from '@atoms/input';
import { Alert } from '@atoms/alert';
import { Modal } from '@shared/components/ui';

const AddUserForm = ({ 
    open = false,
    onClose,
    onSuccess = null,
    departments = [],
    designations = [],
    roles = []
}) => {
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const { data, setData, post, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        employee_id: '',
        phone: '',
        department: '',
        designation: '',
        role: 'employee',
        join_date: '',
        salary: '',
        address: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        
        post(route('users.store'), {
            onSuccess: (response) => {
                setMessage('User created successfully!');
                reset();
                if (onSuccess) onSuccess(response);
                setTimeout(() => {
                    onClose();
                    setMessage('');
                }, 2000);
            },
            onError: () => {
                setMessage('Failed to create user. Please check the form and try again.');
            },
            onFinish: () => setProcessing(false)
        });
    };

    const handleClose = () => {
        reset();
        setMessage('');
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Add New User"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Message Display */}
                {message && (
                    <Alert
                        type={message.includes('successfully') ? 'success' : 'error'}
                        message={message}
                        dismissible
                        onDismiss={() => setMessage('')}
                    />
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                            placeholder="Enter full name"
                        />
                        
                        <Input
                            label="Email Address"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                            placeholder="Enter email address"
                        />
                        
                        <Input
                            label="Employee ID"
                            type="text"
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            error={errors.employee_id}
                            required
                            placeholder="Enter employee ID"
                        />
                        
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            error={errors.phone}
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                            placeholder="Enter password"
                        />
                        
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            required
                            placeholder="Confirm password"
                        />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="employee">Employee</option>
                                <option value="hr">HR</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.display_name || role.name}
                                    </option>
                                ))}
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Department</option>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Operations">Operations</option>
                                {departments.map((dept) => (
                                    <option key={dept.id || dept} value={dept.name || dept}>
                                        {dept.name || dept}
                                    </option>
                                ))}
                            </select>
                            {errors.department && (
                                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Designation
                            </label>
                            <select
                                value={data.designation}
                                onChange={(e) => setData('designation', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Designation</option>
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Senior Software Engineer">Senior Software Engineer</option>
                                <option value="Team Lead">Team Lead</option>
                                <option value="Project Manager">Project Manager</option>
                                <option value="HR Manager">HR Manager</option>
                                {designations.map((designation) => (
                                    <option key={designation.id || designation} value={designation.name || designation}>
                                        {designation.name || designation}
                                    </option>
                                ))}
                            </select>
                            {errors.designation && (
                                <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                            )}
                        </div>
                        
                        <Input
                            label="Join Date"
                            type="date"
                            value={data.join_date}
                            onChange={(e) => setData('join_date', e.target.value)}
                            error={errors.join_date}
                            required
                        />
                        
                        <Input
                            label="Salary"
                            type="number"
                            value={data.salary}
                            onChange={(e) => setData('salary', e.target.value)}
                            error={errors.salary}
                            placeholder="Enter salary"
                            min="0"
                            step="1000"
                        />
                    </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter complete address"
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                        loading={processing}
                    >
                        {processing ? 'Creating User...' : 'Create User'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export { AddUserForm };
