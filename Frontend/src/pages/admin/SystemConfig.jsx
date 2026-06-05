import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminWorkflows } from '../../hooks/useAdminWorkflows';
import { useAdminPrompts } from '../../hooks/useAdminPrompts';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { admin } from '../../api/AdminApi';
import { useToast } from '../../contexts/ToastContext';
import { ApiError } from '../../api/HttpClient';
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
    Shield,
    Sparkles,
    FlaskConical,
    Crown,
    Scroll,
    Server,
    UserCog,
    Upload,
    Calendar
} from 'lucide-react';

export default function SystemConfig() {
    const [activeTab, setActiveTab] = useState('workflows');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingPromptId, setEditingPromptId] = useState(null);
    const [promptText, setPromptText] = useState('');
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [newPermissionRole, setNewPermissionRole] = useState('TechMember');
    const [isClosing, setIsClosing] = useState(false);
    const [saving, setSaving] = useState({});
    const [permFieldErrors, setPermFieldErrors] = useState(null);

    const { showToast } = useToast();

    const workflows = useAdminWorkflows();
    const prompts = useAdminPrompts();
    const permissions = useAdminPermissions();

    const [templates, setTemplates] = useState([]);
    const [uploading, setUploading] = useState({});

    const fetchTemplates = useCallback(async () => {
        try {
            const data = await admin.templates.fetch();
            setTemplates(data);
        } catch {}
    }, []);

    useEffect(() => {
        Promise.all([
            workflows.list(),
            prompts.list(),
            permissions.list(),
            fetchTemplates()
        ]).catch(err => {
            setError(err.message);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const handleToggleWorkflow = async (id, currentActive) => {
        await workflows.toggleActive(id, !currentActive).catch(() => {});
        await workflows.list().catch(() => {});
    };

    const handleSavePrompt = async (id) => {
        setSaving(prev => ({ ...prev, [id]: true }));
        try {
            await prompts.updateText(id, promptText);
            setEditingPromptId(null);
        } catch {
        } finally {
            setSaving(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleAddPermission = async () => {
        if (!selectedWorkflowId) return;
        setPermFieldErrors(null);

        try {
            await permissions.create({
                roleName: newPermissionRole,
                workflowId: selectedWorkflowId
            });
            setShowPermissionModal(false);
            setNewPermissionRole('TechMember');
            await permissions.list().catch(() => {});
        } catch (err) {
            if (err.errors) setPermFieldErrors(err.errors);
        }
    };

    const handleDeletePermission = async (id) => {
        if (!confirm('هل أنت متأكد من إزالة هذه الصلاحية؟')) return;

        try {
            await permissions.delete(id);
            await permissions.list().catch(() => {});
        } catch {
        }
    };

    const closePermissionModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowPermissionModal(false);
            setIsClosing(false);
        }, 200);
    };

    const permissionsByWorkflow = useMemo(() => {
        const map = {};
        (permissions.items || []).forEach(p => {
            if (!map[p.workflowId]) map[p.workflowId] = [];
            map[p.workflowId].push(p);
        });
        return map;
    }, [permissions.items]);

    const getWorkflowName = (id) => {
        const wf = (workflows.items || []).find(w => w.workflowId === id);
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

    const getFieldError = (field) => {
        if (!permFieldErrors) return null;
        const key = Object.keys(permFieldErrors).find(k => k.toLowerCase() === field.toLowerCase());
        if (!key) return null;
        const msg = permFieldErrors[key];
        return Array.isArray(msg) ? msg[0] : msg;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleTemplateUpload = async (name, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        if (!file.name.toLowerCase().endsWith('.dotx')) {
            showToast('يجب أن يكون الملف بصيغة DOTX', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast('حجم الملف يجب أن لا يتجاوز 10 ميجابايت', 'error');
            return;
        }

        setUploading(prev => ({ ...prev, [name]: true }));
        try {
            await admin.templates.upload(name, file);
            showToast(`تم رفع القالب "${name}" بنجاح`, 'success');
            const data = await admin.templates.fetch();
            setTemplates(data);
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'فشل رفع القالب';
            showToast(msg, 'error');
        } finally {
            setUploading(prev => ({ ...prev, [name]: false }));
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">إعدادات النظام</h1>
                    <p className="text-sm text-text-secondary mt-1">إدارة السيرفرات والتعليمات</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

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
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'templates'
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                            : 'text-text-muted hover:text-text hover:bg-surface-card'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={16} />
                        القالب
                    </div>
                </button>
            </div>

            {activeTab === 'workflows' && (
                <div className="space-y-5">
                    <div className="text-sm text-text-muted ps-1">
                       قم بتفعيل أو تعطيل السيرفرات لإدارة صلاحيات الأدوار
                    </div>

                    {(workflows.items || []).map((wf, index) => {
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

                                <div className="mt-5 pt-5 border-t border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-text">الصلاحيات:</span>
                                        <button
                                            onClick={() => {
                                                setSelectedWorkflowId(wf.workflowId);
                                                setShowPermissionModal(true);
                                                setPermFieldErrors(null);
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

            {activeTab === 'prompts' && (
                <div className="space-y-5">
                    <div className="text-sm text-text-muted ps-1">
                        قم بتعديل التعليمات (Prompts) المستخدمة من قبل كل سيرفر
                    </div>

                    {(prompts.items || []).map((prompt, index) => {
                        const isEditing = editingPromptId === prompt.promptId;
                        const isSaving = saving[prompt.promptId];

                        return (
                            <div
                                key={prompt.promptId}
                                className="bg-surface-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/5"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
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

                                {isEditing && (
                                    <div className="px-5 pb-5 space-y-5 animate-fade-slide-in">
                                        <textarea
                                            value={promptText}
                                            onChange={(e) => setPromptText(e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border text-sm text-text focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none transition-all ${
                                                prompts.validationErrors?.promptText
                                                    ? 'border-danger focus:border-danger'
                                                    : 'border-border focus:border-purple-500'
                                            } ${prompts.validationErrors?.promptText ? 'bg-surface' : 'bg-surface'}`}
                                            rows={8}
                                            placeholder="قم بإدخال التعليمات..."
                                        />
                                        {prompts.validationErrors?.promptText && (
                                            <p className="text-xs text-danger -mt-3">
                                                {Array.isArray(prompts.validationErrors.promptText)
                                                    ? prompts.validationErrors.promptText[0]
                                                    : prompts.validationErrors.promptText}
                                            </p>
                                        )}

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

            {activeTab === 'templates' && (
                <div className="space-y-5">
                    <div className="text-sm text-text-muted ps-1">
                        قم برفع قوالب DOTX للمحاضرات النظرية والعملية
                    </div>

                    {[
                        { id: 'نظري', label: 'القالب النظري', hint: 'يُستخدم هذا القالب لتنسيق المحاضرات النظرية', color: 'bg-primary/15 text-primary' },
                        { id: 'عملي', label: 'القالب العملي', hint: 'يُستخدم هذا القالب لتنسيق المحاضرات العملية', color: 'bg-cyan/15 text-cyan-600 dark:text-cyan-400' }
                    ].map((type) => {
                        const template = (templates || []).find(t => t.name === type.id);
                        const isUploading = uploading[type.id];

                        return (
                            <div
                                key={type.id}
                                className="bg-surface-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type.color}`}>
                                            <FileText size={22} strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text">{type.label}</h3>
                                            <p className="text-xs text-text-muted mt-0.5">{type.hint}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border space-y-4">
                                    {template?.fileName ? (
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2 text-sm text-text">
                                                <FileText size={16} className="text-text-muted shrink-0" />
                                                <span dir="ltr">{template.fileName}</span>
                                            </div>
                                            <span className="text-xs text-text-muted flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {formatDate(template.lastModified)}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-muted">لم يتم رفع قالب بعد</p>
                                    )}

                                    <div className="flex justify-end">
                                        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                                            isUploading
                                                ? 'bg-surface text-text-muted cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                                        }`}>
                                            {isUploading ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Upload size={16} />
                                            )}
                                            {isUploading ? 'جاري الرفع...' : 'رفع القالب'}
                                            <input
                                                type="file"
                                                accept=".dotx"
                                                className="hidden"
                                                disabled={isUploading}
                                                onChange={(e) => handleTemplateUpload(type.id, e)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showPermissionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                        onClick={closePermissionModal}
                    />
                    <div className={`relative bg-surface-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 space-y-5 ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">إضافة صلاحية</h2>
                            <button
                                onClick={closePermissionModal}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-all hover:text-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">السيرفر</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <Server className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <select
                                        value={selectedWorkflowId}
                                        disabled
                                        className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text opacity-70"
                                    >
                                        <option value={selectedWorkflowId}>
                                            {getWorkflowName(selectedWorkflowId)}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">الدور</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <UserCog className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <select
                                        value={newPermissionRole}
                                        onChange={(e) => {
                                            setNewPermissionRole(e.target.value);
                                            setPermFieldErrors(null);
                                        }}
                                        className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
                                            getFieldError('roleName')
                                                ? 'border-danger focus:ring-danger/30 focus:border-danger'
                                                : 'border-border focus:ring-primary/30 focus:border-primary'
                                        }`}
                                    >
                                        <option value="TechMember">عضو تقني</option>
                                        <option value="ScientificMember">عضو علمي</option>
                                    </select>
                                    {getFieldError('roleName') && (
                                        <p className="text-xs text-danger mt-1">{getFieldError('roleName')}</p>
                                    )}
                                    {getFieldError('workflowId') && (
                                        <p className="text-xs text-danger mt-1">{getFieldError('workflowId')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={closePermissionModal}
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
