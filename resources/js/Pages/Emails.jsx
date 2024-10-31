// src/components/EmailClient.js
import React, { useEffect, useState } from 'react';

const CLIENT_ID = '551140686722-ngg3290imab1ru0slcljlourvuvrd7t5.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCwfSbrgNYCrhdmFIlU7pS7bVVT__lwOgo';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

const Emails = () => {
    const [authToken, setAuthToken] = useState(null);
    const [emails, setEmails] = useState([]);

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
        }
    };

    console.log(emails)

    const getHeader = (headers, name) => {
        const header = headers.find((header) => header.name === name);
        return header ? header.value : 'No Information';
    };

    return (
        <div className="card-body">
            {/* Authentication buttons */}
            <div className="auth-buttons">
                <button onClick={handleAuthClick}>Authorize</button>
                <button onClick={handleSignoutClick}>Sign Out</button>
            </div>

            {/* Email Header */}
            <div className="email-header">
                <div className="top-action-left">
                    <button className="btn btn-white">Select</button>
                    <button className="btn btn-white">Actions</button>
                    <button className="btn btn-white">Folders</button>
                    <button className="btn btn-white">Tags</button>
                    <input type="text" placeholder="Search Messages" className="form-control search-message" />
                </div>
                <div className="top-action-right">
                    <button className="btn btn-white" aria-label="Refresh" onClick={listEmails}>Refresh</button>
                    <span className="text-muted">Showing 10 of {emails.length}</span>
                </div>
            </div>

            {/* Email Content */}
            <div className="email-content">
                <table className="table table-inbox table-hover">
                    <thead>
                    <tr>
                        <th><input type="checkbox" className="checkbox-all" /></th>
                        <th>From</th>
                        <th>Subject</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {emails.map((email, index) => (
                        <tr key={index} className="clickable-row">
                            <td><input type="checkbox" className="checkmail" /></td>
                            <td className="name">{email.from}</td>
                            <td className="subject">{email.subject}</td>
                            <td className="mail-date">{email.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Emails;
