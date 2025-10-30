import React, { useState, useRef, useEffect } from 'react';
import { ClockIcon } from './Icons';

const LucidDreamingTools: React.FC = () => {
    const [intervalMinutes, setIntervalMinutes] = useState<number>(30);
    const [isReminderActive, setIsReminderActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const showNotification = () => {
        new Notification("Reality Check", {
            body: "Are you dreaming right now? Look at your hands and try to push a finger through your palm.",
            icon: '/vite.svg',
        });
    };

    const handleStartReminders = async () => {
        if (Notification.permission === 'granted') {
            setIsReminderActive(true);
            const intervalMilliseconds = intervalMinutes * 60 * 1000;
            intervalRef.current = window.setInterval(showNotification, intervalMilliseconds);
            showNotification(); // Show one immediately
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setIsReminderActive(true);
                const intervalMilliseconds = intervalMinutes * 60 * 1000;
                intervalRef.current = window.setInterval(showNotification, intervalMilliseconds);
                showNotification();
            }
        }
    };
    
    const handleStopReminders = () => {
        setIsReminderActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Lucid Dreaming Tools
            </h3>
            <div className="bg-gray-800/50 p-4 rounded-lg">
                <label htmlFor="reality-check-interval" className="block text-sm font-medium text-gray-300 mb-2">Reality Check Reminder</label>
                <div className="flex items-center space-x-2 mb-3">
                    <input
                        type="number"
                        id="reality-check-interval"
                        value={intervalMinutes}
                        onChange={(e) => setIntervalMinutes(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-20 bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                        min="1"
                        disabled={isReminderActive}
                    />
                    <span className="text-gray-400">minutes</span>
                </div>
                 {!isReminderActive ? (
                    <button
                        onClick={handleStartReminders}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Start Reminders
                    </button>
                ) : (
                    <button
                        onClick={handleStopReminders}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Stop Reminders
                    </button>
                )}
            </div>
        </div>
    );
};

export default LucidDreamingTools;
