import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEmail, setActiveEmail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [provider, setProvider] = useState(null);
  const queryClient = useQueryClient();

  // Fetch emails based on folder and search
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emails', activeFolder, searchQuery],
    queryFn: async () => {
      const { data } = await axios.get(`/api/emails`, {
        params: { folder: activeFolder, q: searchQuery }
      });
      return data;
    },
    enabled: !!provider, // Only fetch when provider is set
  });

  // Fetch single email
  const fetchEmail = async (id) => {
    const { data } = await axios.get(`/api/emails/${id}`);
    return data;
  };

  // Mark email as read
  const markAsRead = useMutation({
    mutationFn: async (id) => {
      await axios.patch(`/api/emails/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['emails']);
    },
  });

  // Send email
  const sendEmail = useMutation({
    mutationFn: async (emailData) => {
      await axios.post('/api/emails/send', emailData);
    },
    onSuccess: () => {
      setIsComposing(false);
      queryClient.invalidateQueries(['emails']);
    },
  });

  // Delete emails
  const deleteEmails = useMutation({
    mutationFn: async (emailIds) => {
      await axios.delete('/api/emails', { data: { ids: emailIds } });
    },
    onSuccess: () => {
      setSelectedEmails([]);
      queryClient.invalidateQueries(['emails']);
    },
  });

  // Connect to email provider
  const connectProvider = async (providerData) => {
    try {
      const { data } = await axios.post('/api/email-provider', providerData);
      setProvider(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to connect provider');
    }
  };

  const value = {
    emails,
    activeFolder,
    setActiveFolder,
    selectedEmails,
    setSelectedEmails,
    searchQuery,
    setSearchQuery,
    activeEmail,
    setActiveEmail,
    isComposing,
    setIsComposing,
    provider,
    connectProvider,
    isLoading,
    fetchEmail,
    markAsRead,
    sendEmail,
    deleteEmails,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};
