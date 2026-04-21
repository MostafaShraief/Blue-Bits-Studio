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
    X
} from 'lucide-react';

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

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            password: formData.password,
            userRole: formData.userRole,
            batchNumber: parseInt(formData.batchNumber) || 1,
            telegramUsername: formData.telegramUsername || null
        };

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
        const styles = {
            'Admin': 'bg-amber/20 text-amber',
            'TechMember': 'bg-primary/20 text-primary',
            'ScientificMember': 'bg-green-500/20 text-green-600'
        };
        const labels = {
            'Admin': 'مسؤول',
            'TechMember': 'تقني',
            'ScientificMember': 'علمي'
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles[role] || styles.TechMember}`}>
                {labels[role] || role}
            </span>
        );
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Users size={24} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text">إدارة المستخدمين</h1>
                        <p className="text-sm text-text-muted">{users.length} مستخدم</p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                >
                    <Plus size={18} />
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
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">المستخدم</th>
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">الدور</th>
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">الدفعة</th>
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">تاريخ الانضمام</th>
                                <th className="text-start px-4 py-3 text-sm font-bold text-text">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.userId} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                                    <td className="px-4 py-3">
                                        {getRoleBadge(user.userRole)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text">
                                        {user.batchNumber || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-muted">
                                        {user.teamJoinDate ? new Date(user.teamJoinDate).toLocaleDateString('ar-EG') : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-default"
                                                title="تعديل"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {user.userId !== 1 && (
                                                <button
                                                    onClick={() => handleDelete(user.userId)}
                                                    className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-default"
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
                                    <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                                        لا توجد مستخدمين
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 animate-fade-slide-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">
                                {editingId ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-default"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1.5">الاسم الأول</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1.5">اسم العائلة</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">اسم المستخدم</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">
                                    كلمة المرور
                                    {editingId && <span className="text-text-muted font-normal"> (اتركها فارغة لإبقاء الحالية)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    required={!editingId}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1.5">الدور</label>
                                    <select
                                        value={formData.userRole}
                                        onChange={(e) => setFormData({...formData, userRole: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    >
                                        <option value="TechMember">عضو تقني</option>
                                        <option value="ScientificMember">عضو علمي</option>
                                        <option value="Admin">مسؤول</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1.5">الدفعة</label>
                                    <input
                                        type="number"
                                        value={formData.batchNumber}
                                        onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">用户名 Telegram (اختياري)</label>
                                <input
                                    type="text"
                                    value={formData.telegramUsername}
                                    onChange={(e) => setFormData({...formData, telegramUsername: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface transition-default"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
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