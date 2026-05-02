import { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

const SEVERITIES = ['', 'info', 'warn', 'critical'];

const AdminAudit = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (severity) params.severity = severity;
      const r = await api.get('/admin/audit', { params });
      setLogs(r.data.logs);
      setTotal(r.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, severity]);

  const totalPages = Math.ceil(total / limit);

  const severityColor = (s: string) =>
    s === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
    s === 'warn' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
    'bg-gray-100 text-gray-600 border border-gray-200';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#16191f]">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total events</p>
        </div>
        <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(1); }}
          className="bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30">
          {SEVERITIES.map(s => <option key={s} value={s}>{s || 'All severities'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-[10px] uppercase tracking-widest">
                <tr>
                  {['Time', 'User', 'Action', 'IP', 'Severity', 'Metadata'].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-[#16191f] text-xs">{l.user?.email ?? l.userId}</td>
                    <td className="px-5 py-3 font-mono text-xs text-blue-600">{l.action}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs font-mono">{l.ipAddress ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${severityColor(l.severity)}`}>
                        {l.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs max-w-xs truncate">{l.metadata ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <div className="py-16 text-center text-gray-400">No logs found.</div>}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-gray-500 text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:text-[#16191f] hover:bg-white disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:text-[#16191f] hover:bg-white disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAudit;
