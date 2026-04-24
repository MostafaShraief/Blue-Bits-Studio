import { useState, useEffect } from 'react';
import {
    fetchAdminUsers,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser
} from '../../utils/api';
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    UserPlus,
    Crown,
    Shield,
    FlaskConical,
    Sparkles
} from 'lucide-react';
import { ComputerIcon } from 'lucide-react';
import { Computer } from 'lucide-react';
import { LaptopIcon } from 'lucide-react';
import { Laptop2 } from 'lucide-react';
import { LaptopMinimal } from 'lucide-react';

export default function UsersManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        userRole: 'TechMember',
        batchNumber: '',
        telegramUsername: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Create base payload with common fields
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            userRole: formData.userRole,
            batchNumber: parseInt(formData.batchNumber, 10) || 1,
            telegramUsername: formData.telegramUsername || null
        };

        // Only include password if provided (for create or update with new password)
        if (formData.password.trim() !== '') {
            payload.password = formData.password;
        }

        // Only include username for create (not for update)
        if (!editingId) {
            payload.username = formData.username;
        }

        try {
            if (editingId) {
                await updateAdminUser(editingId, payload);
            } else {
                await createAdminUser(payload);
            }

            setShowModal(false);
            resetForm();
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (user) => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            password: '',
            userRole: user.userRole,
            batchNumber: user.batchNumber?.toString() || '',
            telegramUsername: user.telegramUsername || ''
        });
        setEditingId(user.userId);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

        try {
            await deleteAdminUser(id);
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            userRole: 'TechMember',
            batchNumber: '',
            telegramUsername: ''
        });
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getRoleBadge = (role) => {
        const config = {
            'Admin': { 
                bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', 
                icon: Crown,
                label: 'مسؤول'
            },
            'TechMember': { 
                bg: 'bg-primary/15 text-primary', 
                icon: Laptop2,
                label: 'تقني'
            },
            'ScientificMember': { 
                bg: 'bg-cyan/15 text-cyan-600 dark:text-cyan-400', 
                icon: FlaskConical,
                label: 'علمي'
            }
        };
        const { bg, icon: Icon, label } = config[role] || config.TechMember;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${bg}`}>
                <Icon size={12} strokeWidth={2} />
                {label}
            </span>
        );
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
                    <h1 className="text-2xl font-bold text-text">إدارة المستخدمين</h1>
                    <p className="text-sm text-text-secondary mt-1">إجمالي {users.length} مستخدم</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                    <UserPlus size={18} />
                    إضافة مستخدم
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm animate-fade-slide-in">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Table */}
            <div className="bg-surface-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface border-b border-border">
                            <tr>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">المستخدم</th>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">الدور</th>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">الدفعة</th>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">تاريخ الانضمام</th>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr 
                                    key={user.userId} 
                                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-bold text-sm">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-text-muted">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {getRoleBadge(user.userRole)}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text">
                                        {user.batchNumber || '-'}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text-muted">
                                        {formatDate(user.teamJoinDate)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                                                title="تعديل"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {user.userId !== 1 && (
                                                <button
                                                    onClick={() => handleDelete(user.userId)}
                                                    className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users size={36} className="text-text-muted mb-2" strokeWidth={1.3} />
                                            <p className="text-sm text-text-muted">لا توجد مستخدمين</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                        onClick={() => { setShowModal(false); resetForm(); }}
                    />
                    <div className="relative bg-surface-card border border-border rounded-2xl p-6 w-full max-w-lg mx-4 space-y-5 animate-scaleIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">
                                {editingId ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-all hover:text-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">الاسم الأول</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">اسم العائلة</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">اسم المستخدم</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    disabled={editingId}
                                    required={!editingId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">
                                    كلمة المرور
                                    {editingId && <span className="text-text-muted font-normal"> (اتركها فارغة لإبقاء الحالية)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required={!editingId}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">الدور</label>
                                    <select
                                        value={formData.userRole}
                                        onChange={(e) => setFormData({...formData, userRole: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    >
                                        <option value="TechMember">عضو تقني</option>
                                        <option value="ScientificMember">عضو علمي</option>
                                        <option value="Admin">مسؤول</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">الدفعة</label>
                                    <input
                                        type="number"
                                        value={formData.batchNumber}
                                        onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2"> Telegram (اختياري)</label>
                                <input
                                    type="text"
                                    value={formData.telegramUsername}
                                    onChange={(e) => setFormData({...formData, telegramUsername: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                >
                                    {editingId ? 'تحديث' : 'إضافة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}