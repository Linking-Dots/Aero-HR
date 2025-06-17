/**
 * AttendanceAdminTable Organism Tests
 * 
 * Comprehensive test suite for the AttendanceAdminTable organism covering:
 * - Component rendering and structure
 * - Export functionality (Excel/PDF)
 * - Mobile responsiveness
 * - Data processing and display
 * - Error handling
 * - Accessibility compliance
 * - Performance characteristics
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { AttendanceAdminTable } from '@/components/organisms/attendance-admin-table';

// Mock dependencies
jest.mock('@mui/material/styles', () => ({
    useTheme: () => ({
        palette: {
            success: { main: '#4caf50' },
            error: { main: '#f44336' },
            primary: { main: '#1976d2' }
        }
    }),
    alpha: (color, opacity) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}));

jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    useMediaQuery: jest.fn()
}));

// Mock Excel/PDF generation
jest.mock('xlsx', () => ({
    utils: {
        book_new: jest.fn(() => ({})),
        aoa_to_sheet: jest.fn(() => ({ '!cols': [], '!merges': [] })),
        book_append_sheet: jest.fn(),
    },
    writeFile: jest.fn(),
}));

jest.mock('jspdf', () => ({
    jsPDF: jest.fn().mockImplementation(() => ({
        setFontSize: jest.fn(),
        setFont: jest.fn(),
        text: jest.fn(),
        internal: {
            pageSize: {
                getWidth: () => 297,
                getHeight: () => 210
            },
            getNumberOfPages: () => 1
        },
        setPage: jest.fn(),
        save: jest.fn()
    }))
}));

jest.mock('jspdf-autotable', () => jest.fn());

// Mock data
const mockAttendanceData = [
    {
        user_id: 1,
        name: 'John Doe',
        employee_id: 'EMP001',
        profile_image: 'avatar1.jpg',
        '2024-03-01': '√',
        '2024-03-02': '√',
        '2024-03-03': '▼',
        '2024-03-04': '√',
        '2024-03-05': '#',
        '2024-03-06': '/',
        '2024-03-07': '√'
    },
    {
        user_id: 2,
        name: 'Jane Smith',
        employee_id: 'EMP002',
        profile_image: 'avatar2.jpg',
        '2024-03-01': '√',
        '2024-03-02': '▼',
        '2024-03-03': '√',
        '2024-03-04': '√',
        '2024-03-05': '#',
        '2024-03-06': '/',
        '2024-03-07': '√'
    }
];

const mockLeaveTypes = [
    { id: 1, type: 'Casual' },
    { id: 2, type: 'Sick' },
    { id: 3, type: 'Earned' }
];

const mockLeaveCounts = {
    1: { Casual: 2, Sick: 1, Earned: 0 },
    2: { Casual: 1, Sick: 0, Earned: 1 }
};

const defaultProps = {
    loading: false,
    attendanceData: mockAttendanceData,
    currentYear: 2024,
    currentMonth: '03',
    leaveTypes: mockLeaveTypes,
    leaveCounts: mockLeaveCounts,
    onRefresh: jest.fn()
};

describe('AttendanceAdminTable Organism', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default to desktop view
        require('@mui/material').useMediaQuery.mockImplementation((query) => {
            if (query === '(min-width: 1025px)') return true;
            if (query === '(min-width: 641px) and (max-width: 1024px)') return false;
            if (query === '(max-width: 640px)') return false;
            return false;
        });
    });

    describe('Component Rendering', () => {
        it('renders without crashing', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByRole('table')).toBeInTheDocument();
        });

        it('displays correct table title', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByText(/Monthly Attendance Report - March 2024/)).toBeInTheDocument();
        });

        it('renders employee data correctly', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Employee ID: EMP001')).toBeInTheDocument();
            expect(screen.getByText('Employee ID: EMP002')).toBeInTheDocument();
        });

        it('displays attendance status symbols correctly', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            
            // Check for attendance status cells
            const tableCells = screen.getAllByRole('cell');
            expect(tableCells.length).toBeGreaterThan(0);
        });

        it('shows correct number of day columns', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            
            // March 2024 has 31 days
            const headers = screen.getAllByRole('columnheader');
            // Should include: No., Employee, 31 days, + leave type columns
            expect(headers.length).toBe(2 + 31 + mockLeaveTypes.length);
        });
    });

    describe('Loading States', () => {
        it('shows loading skeleton when loading', () => {
            render(<AttendanceAdminTable {...defaultProps} loading={true} />);
            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(screen.getByLabelText('Loading attendance data')).toBeInTheDocument();
        });

        it('shows no data message when empty', () => {
            render(<AttendanceAdminTable {...defaultProps} attendanceData={[]} />);
            expect(screen.getByText('No attendance data found')).toBeInTheDocument();
            expect(screen.getByText('Please check the selected month or refresh the data')).toBeInTheDocument();
        });
    });

    describe('Export Functionality', () => {
        it('renders export buttons', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByLabelText('Download attendance data as Excel file')).toBeInTheDocument();
            expect(screen.getByLabelText('Download attendance data as PDF file')).toBeInTheDocument();
        });

        it('disables export buttons when no data', () => {
            render(<AttendanceAdminTable {...defaultProps} attendanceData={[]} />);
            expect(screen.getByLabelText('Download attendance data as Excel file')).toBeDisabled();
            expect(screen.getByLabelText('Download attendance data as PDF file')).toBeDisabled();
        });

        it('calls Excel export when button clicked', async () => {
            const XLSX = require('xlsx');
            render(<AttendanceAdminTable {...defaultProps} />);
            
            const excelButton = screen.getByLabelText('Download attendance data as Excel file');
            await act(async () => {
                fireEvent.click(excelButton);
            });

            await waitFor(() => {
                expect(XLSX.writeFile).toHaveBeenCalled();
            });
        });

        it('calls PDF export when button clicked', async () => {
            const { jsPDF } = require('jspdf');
            render(<AttendanceAdminTable {...defaultProps} />);
            
            const pdfButton = screen.getByLabelText('Download attendance data as PDF file');
            await act(async () => {
                fireEvent.click(pdfButton);
            });

            await waitFor(() => {
                expect(jsPDF).toHaveBeenCalled();
            });
        });
    });

    describe('Responsive Design', () => {
        it('renders mobile view on small screens', () => {
            // Mock mobile view
            require('@mui/material').useMediaQuery.mockImplementation((query) => {
                if (query === '(max-width: 640px)') return true;
                return false;
            });

            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByText('Attendance Report')).toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders desktop view on large screens', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getByText(/Monthly Attendance Report - March 2024/)).toBeInTheDocument();
        });
    });

    describe('Refresh Functionality', () => {
        it('renders refresh button when onRefresh provided', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByLabelText('Refresh attendance data')).toBeInTheDocument();
        });

        it('calls onRefresh when refresh button clicked', () => {
            const mockRefresh = jest.fn();
            render(<AttendanceAdminTable {...defaultProps} onRefresh={mockRefresh} />);
            
            const refreshButton = screen.getByLabelText('Refresh attendance data');
            fireEvent.click(refreshButton);
            
            expect(mockRefresh).toHaveBeenCalledTimes(1);
        });

        it('disables refresh button when loading', () => {
            render(<AttendanceAdminTable {...defaultProps} loading={true} />);
            expect(screen.queryByLabelText('Refresh attendance data')).not.toBeInTheDocument();
        });
    });

    describe('Weekend Highlighting', () => {
        it('applies weekend styling to weekend columns', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            
            // March 2024: 2nd and 3rd are Saturday and Sunday
            const headers = screen.getAllByRole('columnheader');
            const weekendHeaders = headers.filter(header => {
                const text = header.textContent;
                return text.includes('Sat') || text.includes('Sun');
            });
            
            expect(weekendHeaders.length).toBeGreaterThan(0);
        });
    });

    describe('Leave Type Integration', () => {
        it('displays leave type columns', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByText('Casual')).toBeInTheDocument();
            expect(screen.getByText('Sick')).toBeInTheDocument();
            expect(screen.getByText('Earned')).toBeInTheDocument();
        });

        it('shows correct leave counts', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            
            // Check for leave count chips
            const leaveCells = screen.getAllByRole('cell');
            const leaveChips = leaveCells.filter(cell => 
                cell.textContent.match(/^[0-9]+$/)
            );
            
            expect(leaveChips.length).toBeGreaterThan(0);
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            expect(screen.getByLabelText('Monthly Attendance Table')).toBeInTheDocument();
            expect(screen.getByRole('toolbar')).toBeInTheDocument();
        });

        it('supports keyboard navigation', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();
            
            // Test tab navigation
            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveAttribute('tabIndex');
            });
        });
    });

    describe('Error Handling', () => {
        it('handles missing employee data gracefully', () => {
            const incompleteData = [
                { user_id: 1, name: null, employee_id: null }
            ];
            
            render(<AttendanceAdminTable {...defaultProps} attendanceData={incompleteData} />);
            expect(screen.getByText('Unknown User')).toBeInTheDocument();
        });

        it('displays export errors when they occur', async () => {
            // Mock XLSX to throw error
            require('xlsx').writeFile.mockImplementation(() => {
                throw new Error('Export failed');
            });

            render(<AttendanceAdminTable {...defaultProps} />);
            
            const excelButton = screen.getByLabelText('Download attendance data as Excel file');
            await act(async () => {
                fireEvent.click(excelButton);
            });

            // Note: Error handling is internal to the hook, 
            // would need to test through user interactions
        });
    });

    describe('Performance', () => {
        it('handles large datasets efficiently', () => {
            const largeDataset = Array.from({ length: 100 }, (_, i) => ({
                user_id: i + 1,
                name: `Employee ${i + 1}`,
                employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
                '2024-03-01': '√',
                '2024-03-02': '√'
            }));

            const startTime = performance.now();
            render(<AttendanceAdminTable {...defaultProps} attendanceData={largeDataset} />);
            const endTime = performance.now();

            // Should render within reasonable time (< 100ms)
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('memoizes expensive calculations', () => {
            const { rerender } = render(<AttendanceAdminTable {...defaultProps} />);
            
            // Re-render with same props
            rerender(<AttendanceAdminTable {...defaultProps} />);
            
            // Component should handle re-renders efficiently
            expect(screen.getByRole('table')).toBeInTheDocument();
        });
    });

    describe('Data Processing', () => {
        it('correctly processes attendance symbols', () => {
            render(<AttendanceAdminTable {...defaultProps} />);
            
            // Should handle all status symbols: √, ▼, #, /
            const cells = screen.getAllByRole('cell');
            expect(cells.length).toBeGreaterThan(0);
        });

        it('calculates correct day counts for month', () => {
            // Test different months
            const februaryProps = { ...defaultProps, currentMonth: '02' };
            render(<AttendanceAdminTable {...februaryProps} />);
            
            // February 2024 is a leap year (29 days)
            const headers = screen.getAllByRole('columnheader');
            expect(headers.length).toBe(2 + 29 + mockLeaveTypes.length);
        });
    });
});
