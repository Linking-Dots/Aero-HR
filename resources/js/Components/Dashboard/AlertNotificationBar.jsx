import React, { useState } from 'react';

const AlertNotificationBar = ({ alerts = [] }) => {
    const [visibleAlerts, setVisibleAlerts] = useState(alerts.map(alert => alert.id));

    const hideAlert = (alertId) => {
        setVisibleAlerts(prev => prev.filter(id => id !== alertId));
    };

    const getAlertStyles = (type) => {
        const styles = {
            critical: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
            info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
            success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
        };
        return styles[type] || styles.info;
    };

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="space-y-3">
            {alerts
                .filter(alert => visibleAlerts.includes(alert.id))
                .map((alert) => (
                    <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border ${getAlertStyles(alert.type)} flex items-center justify-between transition-all duration-200 hover:shadow-sm`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{alert.icon}</span>
                            <span className="text-sm font-medium">{alert.message}</span>
                        </div>
                        <button 
                            onClick={() => hideAlert(alert.id)}
                            className="text-current opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                            aria-label="Dismiss alert"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
            
            <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                    View All Alerts
                </button>
                <button 
                    onClick={() => setVisibleAlerts([])}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                >
                    Dismiss All
                </button>
            </div>
        </div>
    );
};

export default AlertNotificationBar;
