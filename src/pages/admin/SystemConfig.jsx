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
    RefreshCw,
    Shield,
    Sparkles,
    FlaskConical,
    Crown,
    Scroll
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

    const getRoleInfo = (roleName) => {
        const config = {
            'Admin': { bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', icon: Crown, label: 'مسؤول' },
            'TechMember': { bg: 'bg-primary/15 text-primary', icon: Shield, label: 'تقني' },
            'ScientificMember': { bg: 'bg-cyan/15 text-cyan-600 dark:text-cyan-400', icon: FlaskConical, label: 'علمي' }
        };
        return config[roleName] || config.TechMember;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('ar-SY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-slide-in" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">إعدادات النظام</h1>
                    <p className="text-sm text-text-secondary mt-1">إدارة السيرفرات والتعليمات</p>
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
            <div className="flex gap-2 p-1.5 bg-surface rounded-xl w-fit border border-border">
                <button
                    onClick={() => setActiveTab('workflows')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'workflows'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-text-muted hover:text-text hover:bg-surface-card'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Settings2 size={16} />
                        الـسيرفرات والصلاحيات
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('prompts')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'prompts'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-text-muted hover:text-text hover:bg-surface-card'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Scroll size={16} />
                        التعليمات (Prompts)
                    </div>
                </button>
            </div>

            {/* Workflows & Permissions Tab */}
            {activeTab === 'workflows' && (
                <div className="space-y-5">
                    <div className="text-sm text-text-muted ps-1">
                       قم بتفعيل أو تعطيل السيرفرات لإدارة صلاحيات الأدوار
                    </div>

                    {workflows.map((wf, index) => {
                        const workflowPerms = permissionsByWorkflow[wf.workflowId] || [];
                        
                        return (
                            <div
                                key={wf.workflowId}
                                className="bg-surface-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                            wf.isActive === 1 
                                                ? 'bg-success/15' 
                                                : 'bg-surface'
                                        }`}>
                                            {wf.isActive === 1 ? (
                                                <Power size={22} className="text-success" strokeWidth={1.8} />
                                            ) : (
                                                <PowerOff size={22} className="text-text-muted" strokeWidth={1.8} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text">{wf.adminNote}</h3>
                                            <p className="text-xs text-text-muted font-mono bg-surface px-2 py-0.5 rounded mt-1 inline-block">{wf.systemCode}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                            wf.isActive === 1 
                                                ? 'bg-success/15 text-success' 
                                                : 'bg-surface text-text-muted'
                                        }`}>
                                            {wf.isActive === 1 ? 'مفعّل' : 'معطّل'}
                                        </span>
                                        
                                        <button
                                            onClick={() => handleToggleWorkflow(wf.workflowId, wf.isActive === 1)}
                                            className={`p-2.5 rounded-xl transition-all ${
                                                wf.isActive === 1 
                                                    ? 'text-text-muted hover:text-danger hover:bg-danger/10' 
                                                    : 'text-success hover:bg-success/10'
                                            }`}
                                            title={wf.isActive === 1 ? 'تعطيل' : 'تفعيل'}
                                        >
                                            {wf.isActive === 1 ? <PowerOff size={18} /> : <Power size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Permissions for this workflow */}
                                <div className="mt-5 pt-5 border-t border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-text">الصلاحيات:</span>
                                        <button
                                            onClick={() => {
                                                setSelectedWorkflowId(wf.workflowId);
                                                setShowPermissionModal(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-all"
                                        >
                                            <Plus size={14} />
                                            إضافة دور
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {workflowPerms.length === 0 ? (
                                            <span className="text-xs text-text-muted px-3 py-1.5">لا توجد صلاحيات</span>
                                        ) : (
                                            workflowPerms.map(perm => {
                                                const roleInfo = getRoleInfo(perm.roleName);
                                                const { bg, icon: Icon, label } = roleInfo;
                                                return (
                                                    <div
                                                        key={perm.permissionId}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${bg}`}
                                                    >
                                                        <Icon size={12} strokeWidth={2} />
                                                        <span>{label}</span>
                                                        <button
                                                            onClick={() => handleDeletePermission(perm.permissionId)}
                                                            className="hover:text-danger transition-colors ms-1"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                );
                                            })
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
                <div className="space-y-5">
                    <div className="text-sm text-text-muted ps-1">
                        قم بتعديل التعليمات (Prompts) المستخدمة من قبل كل سيرفر
                    </div>

                    {prompts.map((prompt, index) => {
                        const isEditing = editingPromptId === prompt.promptId;
                        const isSaving = saving[prompt.promptId];

                        return (
                            <div
                                key={prompt.promptId}
                                className="bg-surface-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/5"
                                style={{ animationDelay: `${index * 40}ms` }}
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
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <FileText size={22} className="text-purple-600" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text">{prompt.promptName}</h3>
                                            <p className="text-xs text-text-muted font-mono bg-surface px-2 py-0.5 rounded mt-1 inline-block">{prompt.systemCode}</p>
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
                                    <div className="px-5 pb-5 space-y-5 animate-fade-slide-in">
                                        <textarea
                                            value={promptText}
                                            onChange={(e) => setPromptText(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none transition-all"
                                            rows={8}
                                            placeholder="قم بإدخال التعليمات..."
                                        />
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setEditingPromptId(null)}
                                                className="flex-1 px-4 py-3 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface transition-all"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                onClick={() => handleSavePrompt(prompt.promptId)}
                                                disabled={isSaving}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                        onClick={() => setShowPermissionModal(false)}
                    />
                    <div className="relative bg-surface-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 space-y-5 animate-scaleIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">إضافة صلاحية</h2>
                            <button
                                onClick={() => setShowPermissionModal(false)}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-all hover:text-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">السيرفر</label>
                                <select
                                    value={selectedWorkflowId}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text opacity-70"
                                >
                                    <option value={selectedWorkflowId}>
                                        {getWorkflowName(selectedWorkflowId)}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">الدور</label>
                                <select
                                    value={newPermissionRole}
                                    onChange={(e) => setNewPermissionRole(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                >
                                    <option value="TechMember">عضو تقني</option>
                                    <option value="ScientificMember">عضو علمي</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPermissionModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleAddPermission}
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
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