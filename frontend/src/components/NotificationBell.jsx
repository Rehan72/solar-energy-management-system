import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { getRequest, putRequest, deleteRequest } from '../lib/apiService';
import { notify } from '../lib/toast';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await getRequest('/user/notifications/unread-count');
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await getRequest('/user/notifications?limit=10');
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            notify.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            fetchNotifications();
        }
    };

    const markAsRead = async (id) => {
        try {
            await putRequest(`/user/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            notify.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await putRequest('/user/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            notify.success('All notifications marked as read');
        } catch (error) {
            notify.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await deleteRequest(`/user/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
            notify.success('Notification deleted');
        } catch (error) {
            notify.error('Failed to delete notification');
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-600 bg-red-50';
            case 'HIGH': return 'text-orange-600 bg-orange-50';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
            case 'LOW': return 'text-green-600 bg-green-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'ALERT': return '⚠️';
            case 'SUCCESS': return '✅';
            case 'WARNING': return '⚡';
            case 'INFO': return 'ℹ️';
            case 'MAINTENANCE': return '🔧';
            case 'SYSTEM': return '⚙️';
            default: return '📢';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={handleBellClick}
                className={`
                    relative p-2 rounded-xl transition-all duration-300 group
                    ${showDropdown 
                        ? "bg-solar-yellow/20 ring-2 ring-solar-yellow/50" 
                        : "bg-solar-night/30 hover:bg-solar-night/50 border border-solar-yellow/30"}
                `}
            >
                <Bell size={20} className={`transition-colors ${showDropdown ? 'text-solar-yellow' : 'text-solar-muted group-hover:text-solar-yellow'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full border-2 border-solar-bg shadow-lg">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="
                    absolute right-0 mt-3 w-80 md:w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-200
                    bg-solar-surface/95 dark:bg-solar-night/95 backdrop-blur-xl
                    rounded-2xl overflow-hidden border border-solar-border/50 shadow-2xl flex flex-col
                ">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-linear-to-br from-solar-yellow/5 to-transparent border-b border-solar-border/50">
                        <h3 className="text-sm font-bold text-solar-primary flex items-center">
                            <Bell size={16} className="mr-2 text-solar-yellow" />
                            Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-solar-yellow hover:text-solar-orange transition-colors flex items-center gap-1"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                    <span className="hidden sm:inline">Mark all read</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowDropdown(false)}
                                className="text-solar-muted hover:text-solar-primary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-yellow"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center p-8 text-solar-muted">
                                <Bell size={48} className="mx-auto mb-4 opacity-30" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-solar-border">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-solar-panel/5 transition-colors ${!notification.read ? 'bg-solar-yellow/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl shrink-0">
                                                {getTypeIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-medium text-solar-primary text-sm">
                                                        {notification.title}
                                                    </h4>
                                                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getSeverityColor(notification.severity)}`}>
                                                        {notification.severity}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-solar-muted mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-solar-muted">
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-xs text-solar-yellow hover:text-solar-orange transition-colors flex items-center gap-1"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-solar-border text-center">
                            <a
                                href="/notifications"
                                className="text-sm text-solar-yellow hover:text-solar-orange transition-colors font-medium"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all notifications
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
