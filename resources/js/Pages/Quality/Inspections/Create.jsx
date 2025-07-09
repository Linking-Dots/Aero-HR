import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Save, 
    X, 
    Calendar, 
    User, 
    Building2, 
    Package, 
    FileText,
    AlertCircle,
    Plus,
    Trash2
} from 'lucide-react';

const Create = ({ auth, inspectionTypes, departments, inspectors }) => {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        inspection_number: '',
        type: '',
        inspection_date: '',
        inspector_id: '',
        department_id: '',
        product_batch: '',
        description: '',
        checkpoints: [
            {
                checkpoint: '',
                requirement: '',
                measurement_method: '',
                acceptable_range: '',
                is_critical: false
            }
        ],
        notes: ''
    });

    const [checkpoints, setCheckpoints] = useState([
        {
            checkpoint: '',
            requirement: '',
            measurement_method: '',
            acceptable_range: '',
            is_critical: false
        }
    ]);

    const addCheckpoint = () => {
        const newCheckpoint = {
            checkpoint: '',
            requirement: '',
            measurement_method: '',
            acceptable_range: '',
            is_critical: false
        };
        setCheckpoints([...checkpoints, newCheckpoint]);
        setData('checkpoints', [...checkpoints, newCheckpoint]);
    };

    const removeCheckpoint = (index) => {
        const updatedCheckpoints = checkpoints.filter((_, i) => i !== index);
        setCheckpoints(updatedCheckpoints);
        setData('checkpoints', updatedCheckpoints);
    };

    const updateCheckpoint = (index, field, value) => {
        const updatedCheckpoints = checkpoints.map((checkpoint, i) => {
            if (i === index) {
                return { ...checkpoint, [field]: value };
            }
            return checkpoint;
        });
        setCheckpoints(updatedCheckpoints);
        setData('checkpoints', updatedCheckpoints);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('quality.inspections.store'));
    };

    // Generate inspection number
    const generateInspectionNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const inspectionNumber = `INS-${year}${month}${day}-${random}`;
        setData('inspection_number', inspectionNumber);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create New Inspection
                    </h2>
                    <Link
                        href={route('quality.inspections.index')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Link>
                </div>
            }
        >
            <Head title="Create New Inspection" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FileText className="inline w-4 h-4 mr-1" />
                                            Inspection Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter inspection title"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Inspection Number *
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={data.inspection_number}
                                                onChange={(e) => setData('inspection_number', e.target.value)}
                                                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="INS-YYYYMMDD-XXX"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={generateInspectionNumber}
                                                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        {errors.inspection_number && (
                                            <p className="mt-1 text-sm text-red-600">{errors.inspection_number}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Inspection Type *
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select type</option>
                                            {inspectionTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="inline w-4 h-4 mr-1" />
                                            Inspection Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.inspection_date}
                                            onChange={(e) => setData('inspection_date', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.inspection_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.inspection_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="inline w-4 h-4 mr-1" />
                                            Inspector *
                                        </label>
                                        <select
                                            value={data.inspector_id}
                                            onChange={(e) => setData('inspector_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select inspector</option>
                                            {inspectors.map((inspector) => (
                                                <option key={inspector.id} value={inspector.id}>
                                                    {inspector.name} ({inspector.email})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.inspector_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.inspector_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Building2 className="inline w-4 h-4 mr-1" />
                                            Department
                                        </label>
                                        <select
                                            value={data.department_id}
                                            onChange={(e) => setData('department_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select department</option>
                                            {departments.map((department) => (
                                                <option key={department.id} value={department.id}>
                                                    {department.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.department_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Package className="inline w-4 h-4 mr-1" />
                                        Product/Batch Information
                                    </label>
                                    <input
                                        type="text"
                                        value={data.product_batch}
                                        onChange={(e) => setData('product_batch', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter product or batch information"
                                    />
                                    {errors.product_batch && (
                                        <p className="mt-1 text-sm text-red-600">{errors.product_batch}</p>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter inspection description"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Inspection Checkpoints */}
                            <div className="border-b border-gray-200 pb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Inspection Checkpoints</h3>
                                    <button
                                        type="button"
                                        onClick={addCheckpoint}
                                        className="bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center text-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Checkpoint
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {checkpoints.map((checkpoint, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-md font-medium text-gray-800">
                                                    Checkpoint {index + 1}
                                                </h4>
                                                {checkpoints.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCheckpoint(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Checkpoint Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={checkpoint.checkpoint}
                                                        onChange={(e) => updateCheckpoint(index, 'checkpoint', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="e.g., Dimensional Check"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Requirement *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={checkpoint.requirement}
                                                        onChange={(e) => updateCheckpoint(index, 'requirement', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="e.g., Length: 100mm ±0.5mm"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Measurement Method
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={checkpoint.measurement_method}
                                                        onChange={(e) => updateCheckpoint(index, 'measurement_method', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="e.g., Digital caliper"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Acceptable Range
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={checkpoint.acceptable_range}
                                                        onChange={(e) => updateCheckpoint(index, 'acceptable_range', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="e.g., 99.5mm - 100.5mm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkpoint.is_critical}
                                                        onChange={(e) => updateCheckpoint(index, 'is_critical', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                                                        Critical Control Point
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter any additional notes or special instructions"
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <Link
                                    href={route('quality.inspections.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Creating...' : 'Create Inspection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Create;
