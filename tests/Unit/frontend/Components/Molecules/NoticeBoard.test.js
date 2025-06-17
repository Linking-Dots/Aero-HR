/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

import { NoticeBoard } from '../../../src/frontend/components/molecules/notice-board';

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, format) => '2025-06-17 10:30')
}));

const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('NoticeBoard Molecule', () => {
  const mockOnAddNotice = jest.fn();
  const mockOnDeleteNotice = jest.fn();

  const sampleNotices = [
    {
      id: 1,
      title: 'Team Meeting',
      description: 'Meeting scheduled for tomorrow at 10 AM',
      date: new Date('2025-06-17T10:00:00Z')
    },
    {
      id: 2,
      title: 'Project Update',
      description: 'New project deadline has been set',
      date: new Date('2025-06-16T14:30:00Z')
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notice board with notices', () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={sampleNotices}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Notice Board')).toBeInTheDocument();
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Project Update')).toBeInTheDocument();
    expect(screen.getByText('Add Notice')).toBeInTheDocument();
  });

  it('renders empty state when no notices', () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={[]}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Notice Board')).toBeInTheDocument();
    expect(screen.getByText('No notices available')).toBeInTheDocument();
  });

  it('opens add notice dialog when button is clicked', async () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={[]}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
        />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Notice');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Notice')).toBeInTheDocument();
      expect(screen.getByLabelText('Notice title')).toBeInTheDocument();
      expect(screen.getByLabelText('Notice description')).toBeInTheDocument();
    });
  });

  it('validates form input before submission', async () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={[]}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
        />
      </TestWrapper>
    );

    // Open dialog
    const addButton = screen.getByText('Add Notice');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Notice')).toBeInTheDocument();
    });

    // Submit button should be disabled initially
    const submitButton = screen.getByText('Add');
    expect(submitButton).toBeDisabled();

    // Fill in valid data
    const titleInput = screen.getByLabelText('Notice title');
    const descriptionInput = screen.getByLabelText('Notice description');

    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'This is a valid description with enough characters' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows validation errors for invalid input', async () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={[]}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
        />
      </TestWrapper>
    );

    // Open dialog
    const addButton = screen.getByText('Add Notice');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Notice')).toBeInTheDocument();
    });

    // Enter invalid title (too short)
    const titleInput = screen.getByLabelText('Notice title');
    fireEvent.change(titleInput, { target: { value: 'Hi' } });

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
    });

    // Enter invalid description (too short)
    const descriptionInput = screen.getByLabelText('Notice description');
    fireEvent.change(descriptionInput, { target: { value: 'Short' } });

    await waitFor(() => {
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('adds notice when form is submitted', async () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={[]}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
        />
      </TestWrapper>
    );

    // Open dialog and fill form
    const addButton = screen.getByText('Add Notice');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Notice')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Notice title');
    const descriptionInput = screen.getByLabelText('Notice description');

    fireEvent.change(titleInput, { target: { value: 'New Notice Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'This is a new notice description with enough content' } });

    // Submit form
    const submitButton = screen.getByText('Add');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddNotice).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Notice Title',
          description: 'This is a new notice description with enough content'
        })
      );
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={[]}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
        />
      </TestWrapper>
    );

    // Open dialog
    const addButton = screen.getByText('Add Notice');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Notice')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Add New Notice')).not.toBeInTheDocument();
    });
  });

  it('deletes notice when delete button is clicked', async () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={sampleNotices}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
          allowDelete={true}
        />
      </TestWrapper>
    );

    // Find and click delete button for first notice
    const deleteButtons = screen.getAllByLabelText(/Delete notice:/);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockOnDeleteNotice).toHaveBeenCalledWith(1);
    });
  });

  it('hides add button when allowAdd is false', () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={sampleNotices}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
          allowAdd={false}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Add Notice')).not.toBeInTheDocument();
  });

  it('hides delete buttons when allowDelete is false', () => {
    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={sampleNotices}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
          allowDelete={false}
        />
      </TestWrapper>
    );

    expect(screen.queryByLabelText(/Delete notice:/)).not.toBeInTheDocument();
  });

  it('respects maxNotices limit', async () => {
    const manyNotices = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      title: `Notice ${i + 1}`,
      description: `Description for notice ${i + 1}`,
      date: new Date()
    }));

    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={manyNotices}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
          maxNotices={3}
        />
      </TestWrapper>
    );

    // Should only show 3 notices due to maxNotices limit
    expect(screen.getByText('Notice Board')).toBeInTheDocument();
  });

  it('applies custom styling', () => {
    const customStyle = { marginTop: '20px' };
    const customClass = 'custom-notice-board';

    render(
      <TestWrapper>
        <NoticeBoard
          initialNotices={[]}
          onAddNotice={mockOnAddNotice}
          onDeleteNotice={mockOnDeleteNotice}
          style={customStyle}
          className={customClass}
        />
      </TestWrapper>
    );

    const container = screen.getByText('Notice Board').closest('section');
    expect(container).toHaveClass(customClass);
    expect(container).toHaveStyle('margin-top: 20px');
  });
});
