/**
 * AttendanceForm - Molecule Component
 * Clock in/out form with current status display
 * Phase 6: Complete frontend migration
 */

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@atoms/button';
import { Alert } from '@atoms/alert';

const AttendanceForm = ({ 
    canClockIn = false,
    canClockOut = false,
    currentStatus = null,
    lastAction = null
}) => {
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    // Update time every second
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { post } = useForm();

    const handleClockIn = async () => {
        setProcessing(true);
        try {
            post(route('attendance.clock-in'), {
                onSuccess: () => {
                    setMessage('Successfully clocked in!');
                },
                onError: () => {
                    setMessage('Failed to clock in. Please try again.');
                },
                onFinish: () => setProcessing(false)
            });
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            setProcessing(false);
        }
    };

    const handleClockOut = async () => {
        setProcessing(true);
        try {
            post(route('attendance.clock-out'), {
                onSuccess: () => {
                    setMessage('Successfully clocked out!');
                },
                onError: () => {
                    setMessage('Failed to clock out. Please try again.');
                },
                onFinish: () => setProcessing(false)
            });
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'clocked_in':
                return 'text-green-600 bg-green-100';
            case 'clocked_out':
                return 'text-gray-600 bg-gray-100';
            case 'late':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Current Time Display */}
            <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                    {currentTime}
                </div>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Current Status */}
            {currentStatus && (
                <div className="text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                        {currentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                </div>
            )}

            {/* Last Action Display */}
            {lastAction && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Last Action</h4>
                    <div className="text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Action:</span>
                            <span className="font-medium">{lastAction.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-medium">{lastAction.time}</span>
                        </div>
                        {lastAction.location && (
                            <div className="flex justify-between">
                                <span>Location:</span>
                                <span className="font-medium">{lastAction.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Message Display */}
            {message && (
                <Alert
                    type={message.includes('Successfully') ? 'success' : 'error'}
                    message={message}
                    dismissible
                    onDismiss={() => setMessage('')}
                />
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
                {canClockIn && (
                    <Button
                        onClick={handleClockIn}
                        disabled={processing}
                        loading={processing}
                        variant="primary"
                        size="lg"
                        className="w-full"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Clock In
                    </Button>
                )}
                
                {canClockOut && (
                    <Button
                        onClick={handleClockOut}
                        disabled={processing}
                        loading={processing}
                        variant="secondary"
                        size="lg"
                        className="w-full"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Clock Out
                    </Button>
                )}

                {!canClockIn && !canClockOut && (
                    <div className="text-center py-4">
                        <p className="text-gray-500">
                            No attendance actions available at this time.
                        </p>
                    </div>
                )}
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-500">
                <p>
                    {canClockIn && "Click 'Clock In' to start your work day."}
                    {canClockOut && "Click 'Clock Out' to end your work day."}
                    {!canClockIn && !canClockOut && "Please check with your supervisor for attendance options."}
                </p>
            </div>
        </div>
    );
};

export { AttendanceForm };
