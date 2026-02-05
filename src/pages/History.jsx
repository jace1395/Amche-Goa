import { useEffect, useState } from 'react';
import { Clock, MapPin, CheckCircle, X, AlertTriangle } from 'lucide-react';

const History = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const loadHistory = () => {
            try {
                const stored = JSON.parse(localStorage.getItem('reports') || '[]');
                if (Array.isArray(stored)) {
                    // Filter out invalid entries and reverse
                    const validReports = stored.filter(r => r && typeof r === 'object');
                    setReports([...validReports].reverse());
                } else {
                    setReports([]);
                }
            } catch (e) {
                console.error("Failed to load history", e);
                setReports([]);
            }
        };
        loadHistory();
    }, []);

    const formatDate = (timestamp) => {
        try {
            if (!timestamp) return "Date unavailable";
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return "Date unavailable";
            return date.toLocaleDateString();
        } catch (e) {
            return "Date unavailable";
        }
    };

    return (
        <div className="p-4 pt-10 pb-28">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">History</span>
            </h1>

            {reports.length === 0 ? (
                <div className="glass-card p-10 text-center">
                    <div className="text-white/30 text-6xl mb-4">📋</div>
                    <p className="text-white/40">No reports filed yet.</p>
                    <p className="text-white/20 text-sm mt-1">Your submitted reports will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report, index) => (
                        <div key={index} className={`glass-card p-4 transition-colors border-l-4 ${report.status === 'rejected' ? 'border-red-500/50 bg-red-500/5' :
                            report.status === 'emergency' ? 'border-orange-500/50 bg-orange-500/5' :
                                'border-green-500/50 hover:bg-white/10'
                            }`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 ${report.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                    report.status === 'emergency' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>
                                    {report.status === 'rejected' ? <X size={14} /> :
                                        report.status === 'emergency' ? <AlertTriangle size={14} /> :
                                            <CheckCircle size={14} />}
                                    {report.category || 'General'}
                                </span>
                                <span className="text-xs text-white/30">
                                    {formatDate(report.timestamp)}
                                </span>
                            </div>

                            <p className="font-medium text-white/80 mb-3">{report.description || 'No description provided'}</p>

                            <div className="flex items-center gap-4 text-sm text-white/40">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{report.authority || 'Unknown Authority'}</span>
                                </div>
                                <div className={`flex items-center gap-1 font-medium ${report.status === 'rejected' ? 'text-red-400' :
                                    report.status === 'emergency' ? 'text-orange-400' :
                                        'text-green-400'
                                    }`}>
                                    {report.status === 'rejected' ? 'Rejected' :
                                        report.status === 'emergency' ? 'Emergency Sent' :
                                            'Submitted'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
