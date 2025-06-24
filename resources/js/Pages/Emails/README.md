# Email Module

A modern, responsive email client with a glassy UI built with React, Material-UI, and Tailwind CSS.

## Features

- **Multiple Provider Support**:
  - OAuth2 authentication for Gmail, Outlook, and iCloud
  - Manual IMAP/SMTP configuration for any email provider
  - Secure credential storage

- **Modern UI/UX**:
  - Glassmorphism design with smooth animations
  - Responsive layout that works on all devices
  - Dark/light theme support
  - Intuitive email management interface

- **Email Management**:
  - View emails in a threaded conversation view
  - Compose rich-text emails with attachments
  - Organize emails with labels and folders
  - Search functionality with filters
  - Mark as read/unread, star important emails

- **Security**:
  - Secure OAuth2 flow
  - Encrypted credential storage
  - Safe HTML email rendering

## Components

- `EmailApp`: Main component that orchestrates the email interface
- `EmailList`: Displays a list of emails with sorting and filtering
- `EmailViewer`: Shows the full content of a selected email
- `EmailComposer`: Rich text editor for composing new emails
- `ProviderConnect`: Handles email provider authentication
- `EmailContext`: Manages global email state and actions

## Setup

1. Install dependencies:
   ```bash
   npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @tanstack/react-query axios dompurify react-dropzone react-draggable
   ```

2. Add the EmailProvider to your app's root:
   ```jsx
   import { EmailProvider } from './contexts/EmailContext';
   
   function App() {
     return (
       <EmailProvider>
         <YourApp />
       </EmailProvider>
     );
   }
   ```

3. Use the EmailApp component:
   ```jsx
   import EmailApp from './components/EmailApp';
   
   function YourComponent() {
     return <EmailApp />;
   }
   ```

## API Integration

The email module requires the following API endpoints:

- `GET /api/emails` - List emails with pagination and filtering
- `GET /api/emails/:id` - Get a single email by ID
- `POST /api/emails/send` - Send a new email
- `PATCH /api/emails/:id` - Update email (e.g., mark as read)
- `DELETE /api/emails` - Delete multiple emails
- `POST /api/email-provider` - Connect an email provider

## Styling

The module uses a combination of:
- Material-UI components with custom theming
- Tailwind CSS for utility classes
- Custom glassmorphism effects using the `GlassCard` and `GlassDialog` components

## State Management

The application uses React Context API with useReducer for state management, with the following state structure:

```typescript
interface EmailState {
  emails: Email[];
  activeFolder: string;
  selectedEmails: string[];
  searchQuery: string;
  activeEmail: Email | null;
  isComposing: boolean;
  provider: EmailProvider | null;
  isLoading: boolean;
  error: string | null;
}
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
