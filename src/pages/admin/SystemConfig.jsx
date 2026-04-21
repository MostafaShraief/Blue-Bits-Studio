import { useState, useEffect, useMemo } from 'react';
import {
    fetchAdminWorkflows,
    fetchAdminPrompts,
    fetchAdminPermissions,
    toggleAdminWorkflow,
    updateAdminPrompt,
    createAdminPermission,
    deleteAdminPermission
} from '../../utils/api';
import {
    Settings2,
    Power,
    PowerOff,
    Loader2,
    AlertCircle,
    X,
    Plus,
    Trash2,
    FileText,
    ChevronDown,
    ChevronUp,
    Save,
    RefreshCw
} from 'lucide-react';

export default function SystemConfig() {
    const [activeTab, setActiveTab] = useState('workflows');
    const [workflows, setWorkflows] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState({});

    // Form states
    const [editingPromptId, setEditingPromptId] = useState(null);
    const [promptText, setPromptText] = useState('');
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [newPermissionRole, setNewPermissionRole] = useState('TechMember');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [wfData, pData, permData] = await Promise.all([
                fetchAdminWorkflows(),
                fetchAdminPrompts(),
                fetchAdminPermissions()
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

    const handleToggleWorkflow = async (id, currentActive) => {
        try {
            await toggleAdminWorkflow(id, !currentActive);
            setWorkflows(prev => prev.map(w => 
                w.workflowId === id ? { ...w, isActive: !currentActive ? 1 : 0 } : w
            ));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSavePrompt = async (id) => {
        try {
            setSaving(prev => ({ ...prev, [id]: true }));
            await updateAdminPrompt(id, promptText);
            setPrompts(prev => prev.map(p => 
                p.promptId === id ? { ...p, promptText } : p
            ));
            setEditingPromptId(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleAddPermission = async () => {
        if (!selectedWorkflowId) return;
        
        try {
            await createAdminPermission({
                roleName: newPermissionRole,
                workflowId: selectedWorkflowId
            });
            setShowPermissionModal(false);
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeletePermission = async (id) => {
        if (!confirm('هل أنت متأكد من إزالة هذه الصلاحية؟')) return;
        
        try {
            await deleteAdminPermission(id);
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    // Build a map of workflowId -> permissions
    const permissionsByWorkflow = useMemo(() => {
        const map = {};
        permissions.forEach(p => {
            if (!map[p.workflowId]) map[p.workflowId] = [];
            map[p.workflowId].push(p);
        });
        return map;
    }, [permissions]);

    const getWorkflowName = (id) => {
        const wf = workflows.find(w => w.workflowId === id);
        return wf?.adminNote || `Workflow ${id}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber/10 flex items-center justify-center">
                    <Settings2 size={24} className="text-amber" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text">إعدادات النظام</h1>
                    <p className="text-sm text-text-muted">إدارة السيرفرات والتعليمات</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-surface rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('workflows')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-default ${
                        activeTab === 'workflows'
                            ? 'bg-primary text-white'
                            : 'text-text-muted hover:text-text'
                    }`}
                >
                    الـسيرفرات والصلاحيات
                </button>
                <button
                    onClick={() => setActiveTab('prompts')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-default ${
                        activeTab === 'prompts'
                            ? 'bg-primary text-white'
                            : 'text-text-muted hover:text-text'
                    }`}
                >
                    التعليمات (Prompts)
                </button>
            </div>

            {/* Workflows & Permissions Tab */}
            {activeTab === 'workflows' && (
                <div className="space-y-4">
                    <div className="text-sm text-text-muted">
                       قم بتفعيل أو تعطيل السيرفرات وإدارة صلاحيات الأدوار
                    </div>

                    {workflows.map((wf) => {
                        const workflowPerms = permissionsByWorkflow[wf.workflowId] || [];
                        
                        return (
                            <div
                                key={wf.workflowId}
                                className="bg-surface-card border border-border rounded-2xl p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            wf.isActive === 1 
                                                ? 'bg-green-500/10' 
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }`}>
                                            {wf.isActive === 1 ? (
                                                <Power size={20} className="text-green-600" />
                                            ) : (
                                                <PowerOff size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text">{wf.adminNote}</h3>
                                            <p className="text-xs text-text-muted">{wf.systemCode}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            wf.isActive === 1 
                                                ? 'bg-green-500/20 text-green-600' 
                                                : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                                        }`}>
                                            {wf.isActive === 1 ? 'مفعّل' : 'معطّل'}
                                        </span>
                                        
                                        <button
                                            onClick={() => handleToggleWorkflow(wf.workflowId, wf.isActive === 1)}
                                            className={`p-2 rounded-lg transition-default ${
                                                wf.isActive === 1 
                                                    ? 'text-gray-400 hover:text-danger hover:bg-danger/10' 
                                                    : 'text-green-600 hover:bg-green-500/10'
                                            }`}
                                            title={wf.isActive === 1 ? 'تعطيل' : 'تفعيل'}
                                        >
                                            {wf.isActive === 1 ? <PowerOff size={18} /> : <Power size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Permissions for this workflow */}
                                <div className="mt-4 pt-4 border-t border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-text">الصلاحيات:</span>
                                        <button
                                            onClick={() => {
                                                setSelectedWorkflowId(wf.workflowId);
                                                setShowPermissionModal(true);
                                            }}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-primary hover:bg-primary/10 transition-default"
                                        >
                                            <Plus size={14} />
                                            إضافة دور
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {workflowPerms.length === 0 ? (
                                            <span className="text-xs text-text-muted">لا توجد صلاحيات</span>
                                        ) : (
                                            workflowPerms.map(perm => (
                                                <div
                                                    key={perm.permissionId}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                                        perm.roleName === 'TechMember'
                                                            ? 'bg-primary/20 text-primary'
                                                            : 'bg-green-500/20 text-green-600'
                                                    }`}
                                                >
                                                    <span>
                                                        {perm.roleName === 'TechMember' ? 'تقني' : 'علمي'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeletePermission(perm.permissionId)}
                                                        className="hover:text-danger transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Prompts Tab */}
            {activeTab === 'prompts' && (
                <div className="space-y-4">
                    <div className="text-sm text-text-muted">
                        قم بتعديل التعليمات (Prompts) المستخدمة من قبل كل سيرفر
                    </div>

                    {prompts.map((prompt) => {
                        const isEditing = editingPromptId === prompt.promptId;
                        const isSaving = saving[prompt.promptId];

                        return (
                            <div
                                key={prompt.promptId}
                                className="bg-surface-card border border-border rounded-2xl overflow-hidden"
                            >
                                {/* Header */}
                                <button
                                    onClick={() => {
                                        if (isEditing) {
                                            setEditingPromptId(null);
                                        } else {
                                            setEditingPromptId(prompt.promptId);
                                            setPromptText(prompt.promptText);
                                        }
                                    }}
                                    className="w-full flex items-center justify-between p-5 text-start hover:bg-surface/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <FileText size={20} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text">{prompt.promptName}</h3>
                                            <p className="text-xs text-text-muted">{prompt.systemCode}</p>
                                        </div>
                                    </div>
                                    {isEditing ? (
                                        <ChevronUp size={20} className="text-text-muted" />
                                    ) : (
                                        <ChevronDown size={20} className="text-text-muted" />
                                    )}
                                </button>

                                {/* Expanded content */}
                                {isEditing && (
                                    <div className="px-5 pb-5 space-y-4 animate-fade-slide-in">
                                        <textarea
                                            value={promptText}
                                            onChange={(e) => setPromptText(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                                            rows={8}
                                            placeholder="قم بإدخال التعليمات..."
                                        />
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setEditingPromptId(null)}
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface transition-default"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                onClick={() => handleSavePrompt(prompt.promptId)}
                                                disabled={isSaving}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-default shadow-lg shadow-purple-500/25 disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <Save size={18} />
                                                )}
                                                حفظ التغييرات
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Permission Modal */}
            {showPermissionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card border border-border rounded-2xl p-6 w-full max-w-sm animate-fade-slide-in space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">إضافة صلاحية</h2>
                            <button
                                onClick={() => setShowPermissionModal(false)}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-default"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">السيرفر</label>
                                <select
                                    value={selectedWorkflowId}
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text opacity-70"
                                >
                                    <option value={selectedWorkflowId}>
                                        {getWorkflowName(selectedWorkflowId)}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">الدور</label>
                                <select
                                    value={newPermissionRole}
                                    onChange={(e) => setNewPermissionRole(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                >
                                    <option value="TechMember">عضو تقني</option>
                                    <option value="ScientificMember">عضو علمي</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPermissionModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface transition-default"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleAddPermission}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                                >
                                    إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}