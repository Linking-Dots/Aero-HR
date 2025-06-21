import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  Box,
  Typography,
  CircularProgress,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Divider,
  Button,
  Input,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox
} from "@heroui/react";
import { 
  EnvelopeIcon, 
  InboxIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';

const CLIENT_ID = '551140686722-ngg3290imab1ru0slcljlourvuvrd7t5.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCwfSbrgNYCrhdmFIlU7pS7bVVT__lwOgo';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

const Emails = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const [authToken, setAuthToken] = useState(null);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmails, setSelectedEmails] = useState(new Set());

    // Stats for the dashboard
    const statsData = [
        {
            title: 'Total Emails',
            value: emails.length,
            icon: <InboxIcon className="w-5 h-5" />,
            color: 'text-blue-600',
            description: 'Emails loaded'
        },
        {
            title: 'Selected',
            value: selectedEmails.size,
            icon: <CheckCircleIcon className="w-5 h-5" />,
            color: 'text-green-600',
            description: 'Emails selected'
        },
        {
            title: 'Status',
            value: authToken ? 'Connected' : 'Disconnected',
            icon: authToken ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />,
            color: authToken ? 'text-green-600' : 'text-orange-600',
            description: 'Gmail connection'
        }
    ];

    useEffect(() => {
        const loadScripts = () => {
            const script1 = document.createElement('script');
            script1.src = 'https://apis.google.com/js/api.js';
            script1.async = true;
            script1.defer = true;
            script1.onload = () => {
                window.gapi.load('client', initializeGapiClient);
            };

            const script2 = document.createElement('script');
            script2.src = 'https://accounts.google.com/gsi/client';
            script2.async = true;
            script2.defer = true;
            script2.onload = initializeTokenClient;

            document.body.appendChild(script1);
            document.body.appendChild(script2);
        };

        loadScripts();
    }, []);

    const initializeGapiClient = async () => {
        await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
    };

    const initializeTokenClient = () => {
        window.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '',
        });
    };

    const handleAuthClick = () => {
        window.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) throw resp;
            setAuthToken(window.gapi.client.getToken().access_token);
            await listEmails();
        };
        window.tokenClient.requestAccessToken({ prompt: authToken ? '' : 'consent' });
    };

    const handleSignoutClick = () => {
        if (authToken) {
            window.google.accounts.oauth2.revoke(authToken);
            window.gapi.client.setToken('');
            setAuthToken(null);
            setEmails([]);
        }
    };

    const listEmails = async () => {
        setLoading(true);
        try {
            const response = await window.gapi.client.gmail.users.messages.list({
                userId: 'me',
                maxResults: 10,
            });

            const messageIds = response.result.messages || [];

            const emailPromises = messageIds.map(async (message) => {
                const email = await window.gapi.client.gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                });

                return {
                    id: email.result.id,
                    subject: getHeader(email.result.payload.headers, 'Subject'),
                    from: getHeader(email.result.payload.headers, 'From'),
                    date: getHeader(email.result.payload.headers, 'Date'),
                };
            });

            const emailDetails = await Promise.all(emailPromises);
            setEmails(emailDetails);
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedEmails(new Set(emails.map(email => email.id)));
        } else {
            setSelectedEmails(new Set());
        }
    };

    const handleSelectEmail = (emailId, isSelected) => {
        const newSelection = new Set(selectedEmails);
        if (isSelected) {
            newSelection.add(emailId);
        } else {
            newSelection.delete(emailId);
        }
        setSelectedEmails(newSelection);
    };

    const filteredEmails = emails.filter(email => 
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.from.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getHeader = (headers, name) => {
        const header = headers.find((header) => header.name === name);
        return header ? header.value : 'No Information';
    };

    return (
        <>
            <Head title="Gmail Integration" />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <div className="overflow-hidden">
                            {/* Header Section - Matching LeavesAdmin */}
                            <div className="bg-gradient-to-br from-slate-50/50 to-white/30 backdrop-blur-sm border-b border-white/20">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                                                <EnvelopeIcon className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                                >
                                                    Gmail Integration
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Connect and manage your Gmail messages
                                                </Typography>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2 flex-wrap">
                                            {!authToken ? (
                                                <Button
                                                    color="primary"
                                                    startContent={<PaperAirplaneIcon className="w-4 h-4" />}
                                                    onPress={handleAuthClick}
                                                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
                                                >
                                                    Connect Gmail
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        color="success"
                                                        variant="bordered"
                                                        startContent={<ArrowPathIcon className="w-4 h-4" />}
                                                        onPress={listEmails}
                                                        isLoading={loading}
                                                        className="border-white/20 bg-white/5 hover:bg-white/10"
                                                    >
                                                        Refresh
                                                    </Button>
                                                    
                                                    <Button
                                                        color="danger"
                                                        variant="bordered"
                                                        onPress={handleSignoutClick}
                                                        className="border-white/20 bg-white/5 hover:bg-white/10"
                                                    >
                                                        Disconnect
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Divider className="border-white/10" />

                            <div className="p-6">
                                {/* Quick Stats - Matching LeavesAdmin pattern */}
                                <div className="mb-6">
                                    <div className={`grid gap-4 ${
                                        isMobile 
                                            ? 'grid-cols-1' 
                                            : isTablet 
                                                ? 'grid-cols-2' 
                                                : 'grid-cols-3'
                                    }`}>
                                        {statsData.map((stat, index) => (
                                            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center gap-2">
                                                        {stat.icon}
                                                        <Typography 
                                                            variant={isMobile ? "subtitle1" : "h6"} 
                                                            className={`font-semibold ${stat.color}`}
                                                        >
                                                            {stat.title}
                                                        </Typography>
                                                    </div>
                                                </CardHeader>
                                                <CardBody className="pt-0">
                                                    <Typography 
                                                        variant={isMobile ? "h4" : "h3"} 
                                                        className={`font-bold ${stat.color}`}
                                                    >
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {stat.description}
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {authToken && (
                                    <>
                                        {/* Filters Section - Matching LeavesAdmin */}
                                        <div className="mb-6">
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                                <div className="w-full sm:w-auto sm:min-w-[300px]">
                                                    <Input
                                                        label="Search Messages"
                                                        placeholder="Search by subject or sender..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                                        variant="bordered"
                                                        classNames={{
                                                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                        }}
                                                        size={isMobile ? "sm" : "md"}
                                                    />
                                                </div>
                                                
                                                <div className="flex gap-2 flex-wrap">
                                                    <Chip
                                                        startContent={<InboxIcon className="w-4 h-4" />}
                                                        variant="flat"
                                                        color="primary"
                                                        size={isMobile ? "sm" : "md"}
                                                        className="bg-white/10 backdrop-blur-md border-white/20"
                                                    >
                                                        {filteredEmails.length} messages
                                                    </Chip>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email Table Section */}
                                        <div className="min-h-96">
                                            <Typography variant="h6" className="mb-4 flex items-center gap-2">
                                                <InboxIcon className="w-5 h-5" />
                                                Gmail Messages
                                            </Typography>
                                            
                                            {loading ? (
                                                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                    <CardBody className="text-center py-12">
                                                        <CircularProgress size={40} />
                                                        <Typography className="mt-4" color="textSecondary">
                                                            Loading emails...
                                                        </Typography>
                                                    </CardBody>
                                                </Card>
                                            ) : filteredEmails.length > 0 ? (
                                                <div className="overflow-hidden rounded-lg">
                                                    <Table 
                                                        aria-label="Gmail messages table"
                                                        classNames={{
                                                            wrapper: "bg-white/10 backdrop-blur-md border-white/20",
                                                            th: "bg-white/20 text-default-foreground",
                                                            td: "border-white/10"
                                                        }}
                                                        selectionMode="multiple"
                                                        selectedKeys={selectedEmails}
                                                        onSelectionChange={setSelectedEmails}
                                                    >
                                                        <TableHeader>
                                                            <TableColumn>FROM</TableColumn>
                                                            <TableColumn>SUBJECT</TableColumn>
                                                            <TableColumn>DATE</TableColumn>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {filteredEmails.map((email) => (
                                                                <TableRow key={email.id}>
                                                                    <TableCell>
                                                                        <Typography variant="body2" className="font-medium truncate max-w-[200px]">
                                                                            {email.from}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Typography variant="body2" className="truncate max-w-[300px]">
                                                                            {email.subject}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Typography variant="body2" color="textSecondary" className="text-xs">
                                                                            {new Date(email.date).toLocaleDateString()}
                                                                        </Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                    <CardBody className="text-center py-12">
                                                        <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                                        <Typography variant="h6" className="mb-2">
                                                            No Emails Found
                                                        </Typography>
                                                        <Typography color="textSecondary">
                                                            {searchTerm ? 'No emails match your search criteria.' : 'Connect to Gmail to view your messages.'}
                                                        </Typography>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* No connection state */}
                                {!authToken && (
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardBody className="text-center py-12">
                                            <PaperAirplaneIcon className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                                            <Typography variant="h6" className="mb-2">
                                                Connect Your Gmail Account
                                            </Typography>
                                            <Typography color="textSecondary" className="mb-4">
                                                Click "Connect Gmail" to authorize access to your Gmail messages.
                                            </Typography>
                                            <Button
                                                color="primary"
                                                startContent={<PaperAirplaneIcon className="w-4 h-4" />}
                                                onPress={handleAuthClick}
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
                                            >
                                                Connect Gmail
                                            </Button>
                                        </CardBody>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};

Emails.layout = (page) => <App>{page}</App>;

export default Emails;
