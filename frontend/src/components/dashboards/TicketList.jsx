import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Clock, CheckCircle, AlertCircle, Plus, ChevronRight, X } from 'lucide-react'
import { getRequest, postRequest, putRequest } from '../../lib/apiService'

function TicketList({ role = 'USER' }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newTicket, setNewTicket] = useState({ subject: '', description: '' })

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const endpoint = role === 'INSTALLER' ? '/installer/tickets' : '/user/tickets'
            const response = await getRequest(endpoint)
            setTickets(response.data || [])
        } catch (error) {
            console.error('Failed to fetch tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [role])

    const handleCreateTicket = async (e) => {
        e.preventDefault()
        try {
            await postRequest('/user/tickets', newTicket)
            setShowCreateModal(false)
            setNewTicket({ subject: '', description: '' })
            fetchTickets()
        } catch (error) {
            console.error('Failed to create ticket:', error)
            alert("Failed to create ticket")
        }
    }

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            await putRequest(`/installer/tickets/${ticketId}/status`, { status: newStatus })
            fetchTickets()
        } catch (error) {
            console.error('Failed to update ticket status:', error)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-solar-orange border-solar-orange/30 bg-solar-orange/10'
            case 'IN_PROGRESS': return 'text-solar-yellow border-solar-yellow/30 bg-solar-yellow/10'
            case 'RESOLVED': return 'text-solar-success border-solar-success/30 bg-solar-success/10'
            case 'CLOSED': return 'text-solar-muted border-solar-border bg-solar-card'
            default: return 'text-solar-muted'
        }
    }

    return (
        <div className="bg-solar-card/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-solar-border/30">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-solar-primary flex items-center">
                    <Wrench className="w-5 h-5 text-solar-yellow mr-2" />
                    {role === 'INSTALLER' ? 'Assigned Jobs & Tickets' : 'Support Tickets'}
                </h3>
                {role === 'USER' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-solar-primary text-solar-dark text-sm font-semibold rounded-md hover:bg-solar-yellow transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Ticket
                    </button>
                )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <p className="text-solar-muted text-center py-4">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-8 text-solar-muted">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No tickets found.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-solar-bg/50 rounded-xl p-4 border border-solar-border hover:border-solar-primary/30 transition-colors group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-solar-primary group-hover:text-solar-yellow transition-colors">
                                        {ticket.subject}
                                    </h4>
                                    <p className="text-sm text-solar-muted mt-1 line-clamp-2">{ticket.description}</p>

                                    <div className="flex items-center gap-4 mt-3 text-xs text-solar-muted">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                        {role === 'INSTALLER' && (
                                            <span>User: {ticket.user_name || 'N/A'}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>

                                    {role === 'INSTALLER' && ticket.status !== 'CLOSED' && (
                                        <div className="flex gap-1 mt-2">
                                            <button
                                                onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                                                className="p-1 hover:bg-solar-yellow/20 rounded text-solar-yellow" title="Mark In Progress"
                                            >
                                                <Clock className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(ticket.id, 'RESOLVED')}
                                                className="p-1 hover:bg-solar-success/20 rounded text-solar-success" title="Mark Resolved"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-solar-card w-full max-w-md rounded-2xl p-6 border border-solar-border shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-solar-primary">Create Service Request</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 text-solar-muted hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-solar-muted mb-1">Subject</label>
                                    <input
                                        required
                                        type="text"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        className="w-full bg-solar-bg border border-solar-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-solar-yellow"
                                        placeholder="e.g., Inverter issue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-solar-muted mb-1">Description</label>
                                    <textarea
                                        required
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        rows={4}
                                        className="w-full bg-solar-bg border border-solar-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-solar-yellow"
                                        placeholder="Describe the problem..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-lg text-solar-muted hover:bg-solar-bg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-solar-primary text-solar-dark font-semibold rounded-lg hover:bg-solar-yellow transition-colors"
                                    >
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default TicketList
