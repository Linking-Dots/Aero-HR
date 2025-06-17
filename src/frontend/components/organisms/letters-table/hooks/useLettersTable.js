/**
 * Letters Table Custom Hook
 * 
 * Manages state, API calls, and business logic for the LettersTable organism.
 * Handles CRUD operations, search highlighting, and user interactions.
 */

import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Input } from '@heroui/react';

import { 
  LetterStatusSelector,
  UserAssignmentSelector,
  LetterLinkCell,
  WorkflowCheckbox,
  ActionTakenEditor,
  HighlightedTextCell,
  LetterActionsCell
} from '../components';
import { LETTERS_CONFIG, getStatusColor } from '../config';

export const useLettersTable = ({ 
  allData, 
  setData, 
  users, 
  openModal, 
  search, 
  theme 
}) => {
  const { auth } = usePage().props;
  
  const userIsAdmin = auth.roles.includes('Administrator');

  // Text highlighting function
  const highlightText = (text) => {
    if (!search || !text) return text;

    const searchTerms = search.split(' ').filter(Boolean);
    const regex = new RegExp(`(${searchTerms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      searchTerms.some(term => part.toLowerCase() === term.toLowerCase()) ? (
        <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span>
      ) : (
        part
      )
    );
  };

  // Handle field changes
  const handleChange = async (letterId, key, value) => {
    try {
      const response = await axios.put(route('letters.update'), {
        id: letterId,
        [key]: value,
      });

      if (response.status === 200) {
        setData(prevLetters =>
          prevLetters.map(letter =>
            letter.id === letterId ? { ...letter, [key]: value } : letter
          )
        );

        toast.success(response.data.messages || 'Letter updated successfully', {
          icon: '🟢',
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            color: theme.palette.text.primary,
          }
        });
      } else {
        throw new Error(response.data.error || `Failed to update letter ${key}.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred.', {
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary,
        }
      });
    }
  };

  // Handle delete operation
  const handleDelete = async (letterId) => {
    if (!confirm('Are you sure you want to delete this letter?')) {
      return;
    }

    try {
      const response = await axios.delete(route('letters.destroy', letterId));

      if (response.status === 200) {
        setData(prevLetters => prevLetters.filter(letter => letter.id !== letterId));
        
        toast.success('Letter deleted successfully', {
          icon: '🟢',
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            color: theme.palette.text.primary,
          }
        });
      }
    } catch (error) {
      toast.error('Failed to delete letter', {
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary,
        }
      });
    }
  };

  // Define table columns
  const columns = useMemo(() => [
    {
      name: 'From',
      selector: row => row.from,
      sortable: true,
      center: true,
      width: LETTERS_CONFIG.columns.from.width,
      cell: row => (
        <HighlightedTextCell 
          text={row.from} 
          searchTerm={search} 
        />
      ),
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      center: true,
      width: LETTERS_CONFIG.columns.status.width,
      cell: row => (
        <LetterStatusSelector
          value={row.status}
          onChange={handleChange}
          rowId={row.id}
          type="status"
        />
      ),
    },
    {
      name: 'Received Date',
      selector: row => row.received_date,
      sortable: true,
      center: true,
      width: LETTERS_CONFIG.columns.receivedDate.width,
      cell: row => (
        <Input
          variant="underlined"
          type="date"
          fullWidth
          value={row.received_date}
          onChange={(e) => handleChange(row.id, 'received_date', e.target.value)}
        />
      ),
    },
    {
      name: 'Memo Number',
      selector: row => row.memo_number,
      sortable: true,
      center: true,
      width: LETTERS_CONFIG.columns.memoNumber.width,
      cell: row => (
        <LetterLinkCell
          href={row.letter_link || `/letters/${row.memo_number}.pdf`}
          text={row.memo_number || 'N/A'}
          type="memo"
        />
      ),
    },
    {
      name: 'Subject',
      selector: row => row.subject,
      sortable: true,
      left: true,
      width: LETTERS_CONFIG.columns.subject.width,
      cell: row => (
        <HighlightedTextCell 
          text={row.subject} 
          searchTerm={search}
          showTooltip={true}
          maxLines={2}
        />
      ),
    },
    {
      name: 'Action Taken',
      selector: row => row.action_taken,
      sortable: true,
      left: true,
      width: LETTERS_CONFIG.columns.actionTaken.width,
      cell: row => (
        <ActionTakenEditor
          initialValue={row.action_taken}
          onChange={handleChange}
          rowId={row.id}
        />
      ),
    },
    {
      name: 'Handling Link',
      selector: row => row.handling_link,
      sortable: true,
      center: true,
      width: LETTERS_CONFIG.columns.handlingLink.width,
      cell: row => (
        <LetterLinkCell
          href={row.handling_link}
          text={row.handling_memo || 'N/A'}
          type="handling"
        />
      ),
    },
    {
      name: 'Handling Status',
      selector: row => row.handling_status,
      sortable: true,
      center: true,
      width: LETTERS_CONFIG.columns.handlingStatus.width,
      cell: row => (
        <LetterStatusSelector
          value={row.handling_status}
          onChange={handleChange}
          rowId={row.id}
          type="handling_status"
        />
      ),
    },
    {
      name: 'Need Reply',
      selector: row => row.need_reply,
      center: true,
      width: LETTERS_CONFIG.columns.needReply.width,
      cell: row => (
        <WorkflowCheckbox
          isSelected={row.need_reply}
          onChange={handleChange}
          rowId={row.id}
          field="need_reply"
          letterStatus={row.status}
        />
      ),
    },
    {
      name: 'Replied Status',
      selector: row => row.replied_status,
      center: true,
      width: LETTERS_CONFIG.columns.repliedStatus.width,
      cell: row => (
        <WorkflowCheckbox
          isSelected={row.replied_status}
          onChange={handleChange}
          rowId={row.id}
          field="replied_status"
          letterStatus={row.status}
        />
      ),
    },
    {
      name: 'Need Forward',
      selector: row => row.need_forward,
      center: true,
      width: LETTERS_CONFIG.columns.needForward.width,
      cell: row => (
        <WorkflowCheckbox
          isSelected={row.need_forward}
          onChange={handleChange}
          rowId={row.id}
          field="need_forward"
          letterStatus={row.status}
        />
      ),
    },
    {
      name: 'Forwarded Status',
      selector: row => row.forwarded_status,
      center: true,
      width: LETTERS_CONFIG.columns.forwardedStatus.width,
      cell: row => (
        <WorkflowCheckbox
          isSelected={row.forwarded_status}
          onChange={handleChange}
          rowId={row.id}
          field="forwarded_status"
          letterStatus={row.status}
        />
      ),
    },
    {
      name: 'Dealt By',
      selector: row => row.dealt_by,
      sortable: true,
      center: true,
      width: LETTERS_CONFIG.columns.dealtBy.width,
      cell: row => (
        <UserAssignmentSelector
          value={row.dealt_by}
          onChange={handleChange}
          rowId={row.id}
          users={users}
        />
      ),
    },
    {
      name: 'Actions',
      center: true,
      width: LETTERS_CONFIG.columns.actions.width,
      cell: row => (
        <LetterActionsCell
          row={row}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      ),
    }
  ], [search, users, theme, openModal]);

  return {
    columns,
    handleChange,
    handleDelete,
    highlightText,
    getStatusColor,
    userIsAdmin
  };
};
