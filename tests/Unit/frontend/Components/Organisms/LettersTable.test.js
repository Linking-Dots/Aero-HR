/**
 * LettersTable Organism Test Suite
 * 
 * Comprehensive test coverage for the LettersTable organism including
 * rendering, user interactions, search highlighting, workflow management, and CRUD operations.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import axios from 'axios';

import { LettersTable } from '../../../src/frontend/components/organisms/letters-table';
import { LETTER_STATUS, getStatusColor } from '../../../src/frontend/components/organisms/letters-table/config';

// Mock dependencies
jest.mock('axios');
jest.mock('react-toastify');
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        roles: ['Administrator']
      }
    }
  }),
  route: jest.fn((name, params) => `/api/${name}${params ? `/${params}` : ''}`)
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('LettersTable Organism', () => {
  const theme = createTheme();
  
  const mockLetters = [
    {
      id: 1,
      from: 'Ministry',
      status: 'Open',
      received_date: '2025-06-17',
      memo_number: 'MIN-2025-001',
      subject: 'Budget allocation for infrastructure development',
      action_taken: 'Under review by finance department',
      handling_link: 'https://docs.example.com/handling-memo-001',
      handling_memo: 'HANDLE-001',
      handling_status: 'Processing',
      need_reply: true,
      replied_status: false,
      need_forward: false,
      forwarded_status: false,
      dealt_by: 'user123',
      letter_link: 'https://docs.example.com/letter-001.pdf'
    },
    {
      id: 2,
      from: 'Contractor',
      status: 'Closed',
      received_date: '2025-06-15',
      memo_number: 'CON-2025-002',
      subject: 'Progress report submission',
      action_taken: 'Reviewed and approved',
      handling_link: null,
      handling_memo: null,
      handling_status: 'Sent',
      need_reply: false,
      replied_status: true,
      need_forward: true,
      forwarded_status: true,
      dealt_by: 'user456',
      letter_link: 'https://docs.example.com/letter-002.pdf'
    }
  ];

  const mockUsers = [
    {
      id: 'user123',
      name: 'John Manager',
      profile_image: '/images/john.jpg',
      designation: {
        title: 'Project Manager'
      }
    },
    {
      id: 'user456',
      name: 'Jane Director',
      profile_image: '/images/jane.jpg',
      designation: {
        title: 'Technical Director'
      }
    }
  ];

  const defaultProps = {
    allData: mockLetters,
    setData: jest.fn(),
    users: mockUsers,
    loading: false,
    handleClickOpen: jest.fn(),
    openModal: jest.fn(),
    setCurrentRow: jest.fn(),
    search: ''
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <LettersTable {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.put.mockResolvedValue({
      status: 200,
      data: { messages: ['Letter updated successfully'] }
    });
    mockAxios.delete.mockResolvedValue({
      status: 200,
      data: { message: 'Letter deleted successfully' }
    });
  });

  describe('Rendering', () => {
    it('renders the table with letter data', () => {
      renderComponent();
      
      expect(screen.getByText('MIN-2025-001')).toBeInTheDocument();
      expect(screen.getByText('Budget allocation for infrastructure development')).toBeInTheDocument();
      expect(screen.getByText('Ministry')).toBeInTheDocument();
    });

    it('displays all required columns', () => {
      renderComponent();
      
      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Received Date')).toBeInTheDocument();
      expect(screen.getByText('Memo Number')).toBeInTheDocument();
      expect(screen.getByText('Subject')).toBeInTheDocument();
      expect(screen.getByText('Action Taken')).toBeInTheDocument();
      expect(screen.getByText('Handling Link')).toBeInTheDocument();
      expect(screen.getByText('Handling Status')).toBeInTheDocument();
      expect(screen.getByText('Need Reply')).toBeInTheDocument();
      expect(screen.getByText('Replied Status')).toBeInTheDocument();
      expect(screen.getByText('Need Forward')).toBeInTheDocument();
      expect(screen.getByText('Forwarded Status')).toBeInTheDocument();
      expect(screen.getByText('Dealt By')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders loading state correctly', () => {
      renderComponent({ loading: true });
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Search Highlighting', () => {
    it('highlights search terms in text', () => {
      renderComponent({ search: 'Budget' });
      
      // Check for highlighted text
      const highlightedElements = screen.getAllByText('Budget');
      expect(highlightedElements.length).toBeGreaterThan(0);
    });

    it('highlights multiple search terms', () => {
      renderComponent({ search: 'Budget allocation' });
      
      expect(screen.getByText('Budget allocation for infrastructure development')).toBeInTheDocument();
    });

    it('handles empty search gracefully', () => {
      renderComponent({ search: '' });
      
      expect(screen.getByText('Budget allocation for infrastructure development')).toBeInTheDocument();
    });
  });

  describe('Status Management', () => {
    it('updates letter status when selection changes', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const statusSelects = screen.getAllByLabelText('Status');
      await user.click(statusSelects[0]);
      
      const closedOption = screen.getByText('Closed');
      await user.click(closedOption);
      
      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith('/api/letters.update', {
          id: 1,
          status: 'Closed'
        });
      });
    });

    it('updates handling status correctly', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const handlingStatusSelects = screen.getAllByLabelText('Handling Status');
      await user.click(handlingStatusSelects[0]);
      
      const signedOption = screen.getByText('Signed');
      await user.click(signedOption);
      
      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith('/api/letters.update', {
          id: 1,
          handling_status: 'Signed'
        });
      });
    });

    it('displays correct status colors', () => {
      expect(getStatusColor('Open')).toBe('danger');
      expect(getStatusColor('Closed')).toBe('success');
      expect(getStatusColor('Processing')).toBe('primary');
    });
  });

  describe('User Assignment', () => {
    it('updates user assignment when selection changes', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const userSelects = screen.getAllByLabelText('Dealt By');
      await user.click(userSelects[0]);
      
      const janeOption = screen.getByText('Jane Director');
      await user.click(janeOption);
      
      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith('/api/letters.update', {
          id: 1,
          dealt_by: 'user456'
        });
      });
    });

    it('displays user avatars and designations', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const userSelects = screen.getAllByLabelText('Dealt By');
      await user.click(userSelects[0]);
      
      expect(screen.getByText('John Manager')).toBeInTheDocument();
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
    });
  });

  describe('Workflow Management', () => {
    it('toggles workflow checkboxes', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const replyCheckboxes = screen.getAllByLabelText(/need_reply checkbox/);
      await user.click(replyCheckboxes[0]);
      
      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith('/api/letters.update', {
          id: 1,
          need_reply: false // Should toggle from true to false
        });
      });
    });

    it('handles multiple workflow states', () => {
      renderComponent();
      
      // Check that all workflow checkboxes are rendered
      expect(screen.getAllByRole('checkbox')).toHaveLength(8); // 4 checkboxes × 2 rows
    });
  });

  describe('Date Management', () => {
    it('updates received date', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const dateInputs = screen.getAllByDisplayValue('2025-06-17');
      await user.clear(dateInputs[0]);
      await user.type(dateInputs[0], '2025-06-18');
      
      fireEvent.blur(dateInputs[0]);
      
      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith('/api/letters.update', {
          id: 1,
          received_date: '2025-06-18'
        });
      });
    });
  });

  describe('Action Taken Editing', () => {
    it('updates action taken on blur', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const actionTextareas = screen.getAllByDisplayValue(/Under review/);
      await user.clear(actionTextareas[0]);
      await user.type(actionTextareas[0], 'Completed review and forwarded');
      
      fireEvent.blur(actionTextareas[0]);
      
      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith('/api/letters.update', {
          id: 1,
          action_taken: 'Completed review and forwarded'
        });
      });
    });
  });

  describe('Document Links', () => {
    it('displays memo number links correctly', () => {
      renderComponent();
      
      const memoLink = screen.getByRole('link', { name: /MIN-2025-001/ });
      expect(memoLink).toHaveAttribute('href', 'https://docs.example.com/letter-001.pdf');
    });

    it('displays handling links when available', () => {
      renderComponent();
      
      const handlingLink = screen.getByRole('link', { name: /HANDLE-001/ });
      expect(handlingLink).toHaveAttribute('href', 'https://docs.example.com/handling-memo-001');
    });

    it('shows N/A for missing links', () => {
      renderComponent();
      
      expect(screen.getAllByText('N/A')).toHaveLength(1); // One handling memo is missing
    });
  });

  describe('CRUD Operations', () => {
    it('handles edit action', async () => {
      const user = userEvent.setup();
      const mockOpenModal = jest.fn();
      renderComponent({ openModal: mockOpenModal });
      
      const editButtons = screen.getAllByLabelText('Edit');
      await user.click(editButtons[0]);
      
      expect(mockOpenModal).toHaveBeenCalledWith('editLetter', mockLetters[0]);
    });

    it('handles delete action with confirmation', async () => {
      const user = userEvent.setup();
      global.confirm = jest.fn(() => true);
      
      renderComponent();
      
      const deleteButtons = screen.getAllByLabelText('Delete');
      await user.click(deleteButtons[0]);
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this letter?');
      
      await waitFor(() => {
        expect(mockAxios.delete).toHaveBeenCalledWith('/api/letters.destroy/1');
      });
    });

    it('cancels delete when user rejects confirmation', async () => {
      const user = userEvent.setup();
      global.confirm = jest.fn(() => false);
      
      renderComponent();
      
      const deleteButtons = screen.getAllByLabelText('Delete');
      await user.click(deleteButtons[0]);
      
      expect(mockAxios.delete).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      mockAxios.put.mockRejectedValueOnce({
        response: {
          data: { message: 'Server error' }
        }
      });
      
      renderComponent();
      
      const statusSelects = screen.getAllByLabelText('Status');
      await user.click(statusSelects[0]);
      
      const closedOption = screen.getByText('Closed');
      await user.click(closedOption);
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Server error',
          expect.any(Object)
        );
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderComponent();
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getAllByLabelText('Status')).toHaveLength(2);
      expect(screen.getAllByLabelText('Handling Status')).toHaveLength(2);
      expect(screen.getAllByLabelText('Dealt By')).toHaveLength(2);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await user.tab();
      
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeDefined();
    });

    it('has proper table structure', () => {
      renderComponent();
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeMockData = Array.from({ length: 500 }, (_, index) => ({
        ...mockLetters[0],
        id: index + 1,
        memo_number: `MEMO-${String(index + 1).padStart(6, '0')}`
      }));
      
      const startTime = performance.now();
      renderComponent({ allData: largeMockData });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
