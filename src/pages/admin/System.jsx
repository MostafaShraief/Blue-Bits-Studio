import { useState, useEffect } from 'react';
import { authFetch } from '../../utils/api';
import { Settings2, Power, PowerOff, Loader2, AlertCircle } from 'lucide-react';

export default function AdminSystem() {
    const [workflows, setWorkflows] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [promptText, setPromptText] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wfData, pData, permData] = await Promise.all([
                authFetch('/admin/workflows'),
                authFetch('/admin/prompts'),
                authFetch('/admin/permissions')
            ]);
            setWorkflows(wfData);
            setPrompts(pData);
            setPermissions(permData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkflow = async (id, currentActive) => {
        try {
            await authFetch(`/admin/workflows/${id}/toggle`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !currentActive })
            });
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const startEditPrompt = (prompt) => {
        setEditingPrompt(prompt.promptId);
        setPromptText(prompt.promptText);
    };

    const savePrompt = async (id) => {
        try {
            await authFetch(`/admin/prompts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ promptText })
            });
            setEditingPrompt(null);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const getWorkflowName = (workflowId) => {
        const wf = workflows.find(w => w.workflowId === workflowId);
        return wf?.adminNote || `Workflow ${workflowId}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-text">إعدادات النظام</h1>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Workflows Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-text flex items-center gap-2">
                    <Settings2 size={20} />
                    الـسيرفرات (Workflows)
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map((wf) => (
                        <div key={wf.workflowId} className="bg-surface-card border border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-text">{wf.adminNote}</p>
                                    <p className="text-xs text-text-muted mt-1">{wf.systemCode}</p>
                                </div>
                                <button
                                    onClick={() => toggleWorkflow(wf.workflowId, wf.isActive === 1)}
                                    className={`p-2 rounded-lg transition-default ${
                                        wf.isActive === 1 
                                            ? 'bg-green-500/20 text-green-600' 
                                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                                    }`}
                                >
                                    {wf.isActive === 1 ? <Power size={18} /> : <PowerOff size={18} />}
                                </button>
                            </div>
                            <div className="mt-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                    wf.isActive === 1 
                                        ? 'bg-green-500/20 text-green-600' 
                                        : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                                }`}>
                                    {wf.isActive === 1 ? 'مفعّل' : 'معطّل'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Prompts Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-text">التعليمات (Prompts)</h2>
                <div className="space-y-4">
                    {prompts.map((prompt) => (
                        <div key={prompt.promptId} className="bg-surface-card border border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="font-bold text-text">{prompt.promptName}</p>
                                    <p className="text-xs text-text-muted">{prompt.systemCode}</p>
                                </div>
                                {editingPrompt !== prompt.promptId && (
                                    <button
                                        onClick={() => startEditPrompt(prompt)}
                                        className="text-primary text-sm font-bold"
                                    >
                                        تعديل
                                    </button>
                                )}
                            </div>
                            
                            {editingPrompt === prompt.promptId ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={promptText}
                                        onChange={(e) => setPromptText(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text"
                                        rows={4}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingPrompt(null)}
                                            className="px-3 py-1.5 rounded-lg border border-border text-text text-sm"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={() => savePrompt(prompt.promptId)}
                                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm"
                                        >
                                            حفظ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary line-clamp-2">
                                    {prompt.promptText}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Permissions Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-text">صلاحيات الأدوار</h2>
                <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-surface border-b border-border">
                            <tr>
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">الدور</th>
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">الـسيرفر</th>
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((perm) => (
                                <tr key={perm.permissionId} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                            perm.roleName === 'TechMember'
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-green-500/20 text-green-600'
                                        }`}>
                                            {perm.roleName === 'TechMember' ? 'تقني' : 'علمي'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text">
                                        {getWorkflowName(perm.workflowId)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-600">
                                            مفعل
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {permissions.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                                        لا توجد صلاحيات محددة.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}