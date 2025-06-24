import React from 'react';
import { EmailProvider } from '../contexts/EmailContext';
import EmailApp from './Emails';

const Emails = () => {
  return (
    <EmailProvider>
      <EmailApp />
    </EmailProvider>
  );
};

export default Emails;