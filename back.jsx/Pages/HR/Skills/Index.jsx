import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ChartBarIcon,
    StarIcon,
    BookOpenIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    UserIcon,
    CogIcon,
    CheckBadgeIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdminManagementTemplate from '@/Components/Templates/AdminManagementTemplate';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { formatDate } from '@/utils/dateUtils';
import { hasPermission } from '@/utils/permissionUtils';

const SkillsIndex = ({ skills = [], competencies = [], employeeSkills = [], categories = [], stats = {}, auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompetencyModalOpen, setIsCompetencyModalOpen] = useState(false);
    const [isEmployeeSkillModalOpen, setIsEmployeeSkillModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [editingCompetency, setEditingCompetency] = useState(null);
    const [selectedTab, setSelectedTab] = useState('skills');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
        category: '',
        proficiency_levels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        is_required: false,
        skill_id: '',
        competency_name: '',
        competency_description: '',
        employee_id: '',
        skill_level: 'Beginner',
        certification_date: '',
        notes: ''
    });

    const mockSkills = skills.length === 0 ? [
        {
            id: 1,
            name: 'JavaScript',
            description: 'Programming language for web development',
            category: 'Technical',
            proficiency_levels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            employees_count: 15,
            avg_proficiency: 'Intermediate',
            is_required: true,
            created_at: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            name: 'Project Management',
            description: 'Ability to manage projects effectively',
            category: 'Soft Skills',
            proficiency_levels: ['Basic', 'Intermediate', 'Advanced'],
            employees_count: 8,
            avg_proficiency: 'Advanced',
            is_required: false,
            created_at: '2024-01-20T14:30:00Z'
        },
        {
            id: 3,
            name: 'Customer Service',
            description: 'Providing excellent customer support',
            category: 'Soft Skills',
            proficiency_levels: ['Beginner', 'Intermediate', 'Advanced'],
            employees_count: 12,
            avg_proficiency: 'Intermediate',
            is_required: true,
            created_at: '2024-02-01T09:15:00Z'
        }
    ] : skills;

    const mockCompetencies = competencies.length === 0 ? [
        {
            id: 1,
            name: 'Frontend Development',
            description: 'Comprehensive frontend development skills',
            required_skills: ['JavaScript', 'React', 'CSS', 'HTML'],
            employees_count: 10,
            completion_rate: 75,
            created_at: '2024-01-10T08:00:00Z'
        },
        {
            id: 2,
            name: 'Leadership',
            description: 'Team leadership and management capabilities',
            required_skills: ['Project Management', 'Communication', 'Decision Making'],
            employees_count: 5,
            completion_rate: 60,
            created_at: '2024-01-25T11:00:00Z'
        }
    ] : competencies;

    const mockStats = Object.keys(stats).length === 0 ? {
        total_skills: 45,
        total_competencies: 12,
        employees_with_skills: 28,
        avg_skill_coverage: 68,
        skill_gaps: 8,
        certifications_this_month: 15
    } : stats;

    const filteredSkills = mockSkills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            skill.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || skill.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSkill) {
            put(route('hr.skills.update', editingSkill.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingSkill(null);
                    reset();
                }
            });
        } else {
            post(route('hr.skills.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (skill) => {
        setEditingSkill(skill);
        setData({
            name: skill.name,
            description: skill.description,
            category: skill.category,
            proficiency_levels: skill.proficiency_levels,
            is_required: skill.is_required
        });
        setIsModalOpen(true);
    };

    const handleDelete = (skill) => {
        if (confirm('Are you sure you want to delete this skill?')) {
            destroy(route('hr.skills.destroy', skill.id));
        }
    };

    const tabs = [
        { id: 'skills', name: 'Skills Database', icon: BookOpenIcon },
        { id: 'competencies', name: 'Competencies', icon: CheckBadgeIcon },
        { id: 'employee-skills', name: 'Employee Skills', icon: UserIcon },
        { id: 'analytics', name: 'Skills Analytics', icon: ChartBarIcon }
    ];

    const renderSkillsTab = () => (
        <div className="space-y-6">
            {/* Skills Management Header */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Skills Database</h3>
                        <p className="text-sm text-gray-600">Manage organizational skills and proficiency levels</p>
                    </div>
                    {hasPermission(auth.user, 'hr.skills.create') && (
                        <PrimaryButton
                            onClick={() => {
                                setEditingSkill(null);
                                reset();
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Skill
                        </PrimaryButton>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <TextInput
                                placeholder="Search skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <SelectInput
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-48"
                    >
                        <option value="">All Categories</option>
                        <option value="Technical">Technical</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Management">Management</option>
                        <option value="Language">Language</option>
                    </SelectInput>
                </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((skill) => (
                    <div key={skill.id} className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{skill.name}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {skill.category}
                                </span>
                            </div>
                            {skill.is_required && (
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" title="Required Skill" />
                            )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Employees</span>
                                <span className="font-medium">{skill.employees_count}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Avg Level</span>
                                <span className="font-medium">{skill.avg_proficiency}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Created</span>
                                <span className="font-medium">{formatDate(skill.created_at)}</span>
                            </div>
                        </div>

                        {(hasPermission(auth.user, 'hr.skills.update') || hasPermission(auth.user, 'hr.skills.delete')) && (
                            <div className="mt-6 flex items-center gap-2">
                                {hasPermission(auth.user, 'hr.skills.update') && (
                                    <SecondaryButton
                                        onClick={() => handleEdit(skill)}
                                        className="flex-1 justify-center"
                                    >
                                        <PencilIcon className="w-4 h-4 mr-2" />
                                        Edit
                                    </SecondaryButton>
                                )}
                                {hasPermission(auth.user, 'hr.skills.delete') && (
                                    <DangerButton
                                        onClick={() => handleDelete(skill)}
                                        className="flex-1 justify-center"
                                    >
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Delete
                                    </DangerButton>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCompetenciesTab = () => (
        <div className="space-y-6">
            {/* Competencies Header */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Competencies</h3>
                        <p className="text-sm text-gray-600">Define skill combinations for roles and positions</p>
                    </div>
                    {hasPermission(auth.user, 'hr.competencies.create') && (
                        <PrimaryButton
                            onClick={() => setIsCompetencyModalOpen(true)}
                            className="inline-flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Competency
                        </PrimaryButton>
                    )}
                </div>
            </div>

            {/* Competencies Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockCompetencies.map((competency) => (
                    <div key={competency.id} className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{competency.name}</h4>
                                <p className="text-sm text-gray-600">{competency.description}</p>
                            </div>
                            <CheckBadgeIcon className="w-6 h-6 text-green-500" />
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Required Skills</label>
                            <div className="flex flex-wrap gap-2">
                                {competency.required_skills.map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Employees</span>
                                <span className="font-medium">{competency.employees_count}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Completion Rate</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${competency.completion_rate}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-medium">{competency.completion_rate}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            <SecondaryButton className="flex-1 justify-center">
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View Details
                            </SecondaryButton>
                            {hasPermission(auth.user, 'hr.competencies.update') && (
                                <SecondaryButton className="flex-1 justify-center">
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    Edit
                                </SecondaryButton>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AdminManagementTemplate>
            <Head title="Skills & Competency Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Skills & Competency Management</h1>
                            <p className="text-blue-100">Manage organizational skills, competencies, and employee skill tracking</p>
                        </div>
                        <BookOpenIcon className="w-12 h-12 text-blue-200" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpenIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Skills</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.total_skills}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Competencies</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.total_competencies}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <UserGroupIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Skilled Employees</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.employees_with_skills}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Skill Coverage</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.avg_skill_coverage}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Skill Gaps</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.skill_gaps}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <StarIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">New Certifications</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.certifications_this_month}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                                            selectedTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {selectedTab === 'skills' && renderSkillsTab()}
                        {selectedTab === 'competencies' && renderCompetenciesTab()}
                        {selectedTab === 'employee-skills' && (
                            <div className="text-center py-12">
                                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Employee Skills</h3>
                                <p className="mt-1 text-sm text-gray-500">Manage individual employee skills and certifications</p>
                            </div>
                        )}
                        {selectedTab === 'analytics' && (
                            <div className="text-center py-12">
                                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Skills Analytics</h3>
                                <p className="mt-1 text-sm text-gray-500">Analyze skill gaps and competency trends</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Skill Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="name" value="Skill Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="category" value="Category" />
                            <SelectInput
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Technical">Technical</option>
                                <option value="Soft Skills">Soft Skills</option>
                                <option value="Management">Management</option>
                                <option value="Language">Language</option>
                            </SelectInput>
                            {errors.category && <div className="text-red-600 text-sm mt-1">{errors.category}</div>}
                        </div>
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="description" value="Description" />
                        <TextareaInput
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full"
                            rows={3}
                        />
                        {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_required}
                                onChange={(e) => setData('is_required', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">This is a required skill</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {editingSkill ? 'Update Skill' : 'Create Skill'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminManagementTemplate>
    );
};

export default SkillsIndex;
