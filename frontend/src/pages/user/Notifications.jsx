import { Bell, Check, CheckCheck, Trash2, Settings, Filter, AlertTriangle, Info, ShieldAlert, BadgeCheck, Wrench, Cpu, MessageSquare } from 'lucide-react';
import { getRequest, putRequest, deleteRequest } from '../../lib/apiService';
import { useState, useEffect } from "react";
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
        } catch (err) {
            console.error(err);
            notify.error("Protocol failure: Unable to retrieve incoming transmissions.");
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
        } catch (err) {
            console.error(err);
            notify.error("Signal corruption: Unable to update signal status.");
        }
    };
    const markAllAsRead = async () => {
        try {
            await putRequest('/user/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            notify.success('All notifications marked as read');
        } catch (err) {
            console.error(err);
            notify.error('Failed to mark all as read');
        }
    };
    const deleteNotification = async (id) => {
        try {
            await deleteRequest(`/user/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
            notify.success('Notification deleted');
        } catch (err) {
            console.error(err);
            notify.error("Command rejected: Unable to purge transmission record.");
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'border-l-solar-danger bg-solar-danger/10';
            case 'HIGH': return 'border-l-solar-orange bg-solar-orange/10';
            case 'MEDIUM': return 'border-l-solar-yellow bg-solar-yellow/10';
            case 'LOW': return 'border-l-solar-success bg-solar-success/10';
            default: return 'border-l-solar-primary bg-solar-primary/10';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'ALERT': return <AlertTriangle className="w-6 h-6 text-solar-danger" />;
            case 'SUCCESS': return <BadgeCheck className="w-6 h-6 text-solar-success" />;
            case 'WARNING': return <ShieldAlert className="w-6 h-6 text-solar-orange" />;
            case 'INFO': return <Info className="w-6 h-6 text-solar-primary" />;
            case 'MAINTENANCE': return <Wrench className="w-6 h-6 text-solar-yellow" />;
            case 'SYSTEM': return <Cpu className="w-6 h-6 text-solar-muted" />;
            default: return <MessageSquare className="w-6 h-6 text-solar-muted" />;
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
        <div className="space-y-8 animate-fadeIn">
            <div className="max-w-4xl">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 solar-glass rounded-2xl flex items-center justify-center border border-solar-border/30">
                                <Bell size={32} className="text-solar-yellow" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Registry Comms</h1>
                                <p className="text-solar-muted mt-1 font-medium italic">
                                    {unreadCount > 0 ? `${unreadCount} unread system intercept${unreadCount > 1 ? 's' : ''}` : 'Protocol synchronized. No pending alerts.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="sun-button px-6 py-2.5"
                                >
                                    <div className="flex items-center gap-2 font-black uppercase tracking-tight text-xs">
                                        <CheckCheck size={18} />
                                        Sync All Read
                                    </div>
                                </button>
                            )}
                            <button
                                onClick={() => notify.info('Redirecting to Protocol Config...')}
                                className="p-2.5 solar-glass rounded-xl hover:bg-solar-panel/20 transition-all border border-solar-border/30 group"
                                title="System Settings"
                            >
                                <Settings size={20} className="text-solar-primary group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-6 solar-glass p-2 rounded-2xl border-solar-border/10">
                        <div className="flex items-center gap-3 px-4">
                            <Filter size={16} className="text-solar-yellow" />
                            <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Sieve:</span>
                        </div>
                        <div className="flex gap-1 p-1 bg-solar-night/30 rounded-xl">
                            {['all', 'unread', 'read'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                        ? 'bg-linear-to-br from-solar-panel to-solar-yellow text-solar-dark shadow-lg'
                                        : 'text-solar-muted hover:text-solar-primary'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="solar-input h-11 min-w-[180px] py-0 bg-transparent border-0 ring-0 focus:ring-0"
                        >
                            <option value="all">Universe: All Types</option>
                            <option value="ALERT">Type: Critical Alerts</option>
                            <option value="WARNING">Type: System Warnings</option>
                            <option value="INFO">Type: Data Info</option>
                            <option value="SUCCESS">Type: Protocol Success</option>
                            <option value="MAINTENANCE">Type: Hardware Maintenance</option>
                            <option value="SYSTEM">Type: Core System</option>
                        </select>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex items-center justify-center p-24 solar-glass rounded-3xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-yellow"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center p-20 solar-glass rounded-3xl border border-solar-border/10 group">
                        <div className="w-20 h-20 bg-solar-panel/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-solar-border/30 group-hover:scale-110 transition-transform duration-500">
                            <Bell size={48} className="text-solar-muted opacity-30 group-hover:opacity-60 transition-opacity" />
                        </div>
                        <h3 className="text-2xl font-black text-solar-primary mb-2 uppercase tracking-tight">Static Silence</h3>
                        <p className="text-solar-muted font-medium italic">
                            {filter === 'unread' ? "System status remains optimal. No pending intercepts." : 'The registry is currently void of telemetry logs.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`solar-glass rounded-2xl p-6 border-l-4 shadow-xl transition-all duration-300 hover:!bg-solar-yellow hover:!text-solar-dark hover:!shadow-solar-glow-yellow hover:!font-bold group ${getSeverityColor(notification.severity)
                                    } ${!notification.read ? 'border-solar-yellow shadow-solar-yellow/5' : 'border-transparent opacity-80'}`}
                            >
                                <div className="flex items-start gap-6">
                                    <div className="p-3 bg-solar-night/40 rounded-xl border border-white/5">
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-black text-solar-primary text-lg uppercase tracking-tight">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-solar-yellow rounded-full animate-pulse shadow-[0_0_8px_#ffd166]"></div>
                                                    )}
                                                </div>
                                                <p className="text-solar-muted font-medium italic leading-relaxed">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="shrink-0">
                                                <span className={`text-[10px] font-black px-4 py-1 rounded-lg border uppercase tracking-[0.2em] ${notification.severity === 'CRITICAL' ? 'bg-solar-danger/20 text-solar-danger border-solar-danger/30' :
                                                    notification.severity === 'HIGH' ? 'bg-solar-orange/20 text-solar-orange border-solar-orange/30' :
                                                        notification.severity === 'MEDIUM' ? 'bg-solar-yellow/20 text-solar-yellow border-solar-yellow/30' :
                                                            'bg-solar-success/20 text-solar-success border-solar-success/30'
                                                    }`}>
                                                    {notification.severity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                            <div className="flex items-center text-[10px] font-black text-solar-muted uppercase tracking-widest italic opacity-60">
                                                {formatTime(notification.created_at)}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black text-solar-yellow hover:text-solar-orange transition-all uppercase tracking-widest bg-solar-yellow/5 hover:bg-solar-yellow/10 rounded-lg"
                                                    >
                                                        <Check size={14} />
                                                        Mark Sync
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black text-solar-danger hover:text-red-500 transition-all uppercase tracking-widest bg-solar-danger/5 hover:bg-solar-danger/10 rounded-lg"
                                                >
                                                    <Trash2 size={14} />
                                                    Wipe
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
