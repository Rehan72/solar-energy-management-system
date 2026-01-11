import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Settings, Filter } from 'lucide-react';
import { getRequest, putRequest, deleteRequest } from '../../lib/apiService';
import { notify } from '../../lib/toast';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await getRequest('/user/notifications?limit=50');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            notify.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await putRequest(`/user/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            notify.success('Marked as read');
        } catch (error) {
            notify.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await putRequest('/user/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
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
            case 'CRITICAL': return 'border-l-red-600 bg-red-50 dark:bg-red-900/20';
            case 'HIGH': return 'border-l-orange-600 bg-orange-50 dark:bg-orange-900/20';
            case 'MEDIUM': return 'border-l-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            case 'LOW': return 'border-l-green-600 bg-green-50 dark:bg-green-900/20';
            default: return 'border-l-blue-600 bg-blue-50 dark:bg-blue-900/20';
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
        return date.toLocaleString();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread' && n.read) return false;
        if (filter === 'read' && !n.read) return false;
        if (typeFilter !== 'all' && n.type !== typeFilter) return false;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-solar-bg p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Bell size={32} className="text-solar-yellow" />
                            <div>
                                <h1 className="text-3xl font-bold text-solar-primary">Notifications</h1>
                                <p className="text-solar-muted">
                                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-2 px-4 py-2 bg-solar-yellow text-solar-dark rounded-lg hover:bg-solar-orange transition-colors font-medium"
                                >
                                    <CheckCheck size={18} />
                                    Mark all read
                                </button>
                            )}
                            <a
                                href="/notification-settings"
                                className="flex items-center gap-2 px-4 py-2 bg-solar-card border border-solar-border text-solar-primary rounded-lg hover:bg-solar-panel/10 transition-colors"
                            >
                                <Settings size={18} />
                                Settings
                            </a>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-solar-muted" />
                            <span className="text-sm text-solar-muted">Filter:</span>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'unread', 'read'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                        ? 'bg-solar-yellow text-solar-dark'
                                        : 'bg-solar-card text-solar-muted hover:bg-solar-panel/10'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-solar-card border border-solar-border text-solar-primary focus:ring-2 focus:ring-solar-yellow"
                        >
                            <option value="all">All Types</option>
                            <option value="ALERT">Alerts</option>
                            <option value="WARNING">Warnings</option>
                            <option value="INFO">Info</option>
                            <option value="SUCCESS">Success</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="SYSTEM">System</option>
                        </select>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-yellow"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center p-12 bg-solar-card rounded-lg border border-solar-border">
                        <Bell size={64} className="mx-auto mb-4 text-solar-muted opacity-30" />
                        <h3 className="text-xl font-semibold text-solar-primary mb-2">No notifications</h3>
                        <p className="text-solar-muted">
                            {filter === 'unread' ? "You're all caught up!" : 'No notifications to display'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-solar-card border-l-4 rounded-lg p-5 shadow-sm transition-all hover:shadow-md ${getSeverityColor(notification.severity)
                                    } ${!notification.read ? 'ring-2 ring-solar-yellow/30' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl flex-shrink-0">
                                        {getTypeIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-solar-primary text-lg">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.read && (
                                                        <span className="inline-block w-2 h-2 bg-solar-yellow rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-solar-muted">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs px-3 py-1 rounded-full bg-solar-panel/20 text-solar-primary font-medium">
                                                    {notification.severity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-sm text-solar-muted">
                                                {formatTime(notification.created_at)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="flex items-center gap-1 px-3 py-1 text-sm text-solar-yellow hover:text-solar-orange transition-colors font-medium"
                                                    >
                                                        <Check size={16} />
                                                        Mark read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
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
        </div>
    );
}

export default NotificationsPage;
