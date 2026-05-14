import { useState, useEffect, useMemo } from 'react';
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
    Sparkles,
    Eye,
    EyeOff,
    User,
    Lock,
    Hash,
    MessageCircle,
    Laptop2,
    Calendar,
    Copy,
    Check,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter
} from 'lucide-react';

export default function UsersManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState(''); // Error shown inside modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [copiedTelegram, setCopiedTelegram] = useState(null);
    
    // Filters
    const [roleFilter, setRoleFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    
    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    
    // Available roles and batches from data
    const availableRoles = useMemo(() => {
        const roles = new Set(users.map(u => u.userRole).filter(Boolean));
        return Array.from(roles);
    }, [users]);
    
    const availableBatches = useMemo(() => {
        const batches = new Set(users.map(u => u.batchNumber).filter(Boolean));
        return Array.from(batches).sort((a, b) => a - b);
    }, [users]);
    
    // Filtered and sorted users
    const filteredUsers = useMemo(() => {
        let result = [...users];
        
        // Filter by role
        if (roleFilter) {
            result = result.filter(u => u.userRole === roleFilter);
        }
        
        // Filter by batch
        if (batchFilter) {
            const batchNum = parseInt(batchFilter, 10);
            result = result.filter(u => u.batchNumber === batchNum);
        }
        
        // Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                
                // Handle null/undefined
                if (aVal == null) aVal = '';
                if (bVal == null) bVal = '';
                
                // String comparison for text fields
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return result;
    }, [users, roleFilter, batchFilter, sortConfig]);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        userRole: 'TechMember',
        batchNumber: '',
        telegramUsername: '',
        teamJoinDate: ''
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
        setModalError(''); // Clear modal error

        // Final validation before API call
        const usernameRegex = /^[a-zA-Z0-9._]+$/;
        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+=-]+$/;

        if (formData.username && !usernameRegex.test(formData.username)) {
            setModalError('يُسمح فقط للأحرف الإنجليزية والأرقام والنقاط بدون مسافات في اسم المستخدم');
            return;
        }

        if (formData.password && !passwordRegex.test(formData.password)) {
            setModalError('يجب أن تكون كلمة المرور بالإنجليزية وبدون مسافات');
            return;
        }

        // Username length validation (3-20)
        if (formData.username && (formData.username.length < 3 || formData.username.length > 20)) {
            setModalError('اسم المستخدم يجب أن يكون بين 3 و 20 حرف');
            return;
        }

        // Password length validation (min 6)
        if (formData.password && formData.password.length < 6) {
            setModalError('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
            return;
        }

        // Create base payload with common fields
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            userRole: formData.userRole,
            batchNumber: parseInt(formData.batchNumber, 10) || 1,
            telegramUsername: formData.telegramUsername || null,
            teamJoinDate: formData.teamJoinDate || null
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
            // Handle duplicate Telegram + Role conflict (409 or 400 with DUPLICATE_TELEGRAM_ROLE)
            const isDuplicateTelegramRole = 
                err.status === 409 || 
                (err.status === 400 && err.message?.includes('DUPLICATE_TELEGRAM_ROLE'));

            if (isDuplicateTelegramRole) {
                setModalError('هذا المعرف الخاص بتيليجرام مسجل مسبقاً بهذا الدور');
            } else {
                setModalError(err.message);
            }
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
            telegramUsername: user.telegramUsername || '',
            teamJoinDate: user.teamJoinDate || ''
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
            telegramUsername: '',
            teamJoinDate: ''
        });
        setEditingId(null);
        setModalError('');
    };

    const openCreateModal = () => {
        resetForm();
        setIsClosing(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            resetForm();
            setIsClosing(false);
        }, 200);
    };

    // Input guard for Username: allow English letters, numbers, dots, underscores only
    // Using onBeforeInput for proper UX - doesn't block Ctrl combinations
    const handleUsernameInput = (e) => {
        // onBeforeInput fires for actual character input, not modifier combinations
        // e.data is null for non-character keys (arrows, etc.)
        if (e.data === null || e.data === undefined) return;
        
        const char = e.data;
        
        // Block space
        if (char === ' ') {
            e.preventDefault();
            setUsernameError('يُسمح فقط بالأحرف الإنجليزية والأرقام والنقاط بدون مسافات');
            setTimeout(() => setUsernameError(''), 2500);
            return;
        }
        
        // Allow only English letters, numbers, dots, underscores
        if (!/^[a-zA-Z0-9._]$/.test(char)) {
            e.preventDefault();
            setUsernameError('يُسمح فقط بالأحرف الإنجليزية والأرقام والنقاط بدون مسافات');
            setTimeout(() => setUsernameError(''), 2500);
        }
    };

    // Input guard for Password: allow English letters, numbers, and standard symbols only
    // Using onBeforeInput for proper UX - doesn't block Ctrl combinations
    const handlePasswordInput = (e) => {
        // onBeforeInput fires for actual character input, not modifier combinations
        // e.data is null for non-character keys (arrows, etc.)
        if (e.data === null || e.data === undefined) return;
        
        const char = e.data;
        
        // Block space
        if (char === ' ') {
            e.preventDefault();
            setPasswordError('يجب أن تكون كلمة المرور بالإنجليزية وبدون مسافات');
            setTimeout(() => setPasswordError(''), 2500);
            return;
        }
        
        // Allow only English letters, numbers, and standard password symbols
        if (!/^[a-zA-Z0-9!@#$%^&*()_+=-]$/.test(char)) {
            e.preventDefault();
            setPasswordError('يجب أن تكون كلمة المرور بالإنجليزية وبدون مسافات');
            setTimeout(() => setPasswordError(''), 2500);
        }
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

    const handleCopyTelegram = async (telegramUsername, userId) => {
        if (!telegramUsername) return;
        
        try {
            await navigator.clipboard.writeText(telegramUsername);
            setCopiedTelegram(userId);
            setTimeout(() => setCopiedTelegram(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                // Cycle: asc -> desc -> null (no sort)
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                if (prev.direction === 'desc') return { key: null, direction: 'asc' };
                return { key, direction: 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-40" />;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp size={14} className="text-primary" />
            : <ArrowDown size={14} className="text-primary" />;
    };

    const getRoleLabel = (role) => {
        const labels = {
            'Admin': 'مسؤول',
            'TechMember': 'تقني',
            'ScientificMember': 'علمي'
        };
        return labels[role] || role;
    };

    const resetFilters = () => {
        setRoleFilter('');
        setBatchFilter('');
        setSortConfig({ key: null, direction: 'asc' });
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
                <h1 className="text-2xl font-bold text-text">إدارة المستخدمين</h1>
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

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-card border border-border rounded-xl">
                {/* Left side: Counter + Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-lg">
                        عرض {filteredUsers.length} من {users.length} مستخدم
                    </span>

                    <div className="flex items-center gap-2 text-sm font-medium text-text">
                        <Filter size={16} className="text-text-muted" />
                        <span>تصفية:</span>
                    </div>
                    
                    {/* Role Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-muted">الدور:</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="min-w-[100px] px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="">الكل</option>
                            {availableRoles.map(role => (
                                <option key={role} value={role}>{getRoleLabel(role)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Batch Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-muted">الدفعة:</label>
                        <select
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                            className="min-w-[100px] px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="">الكل</option>
                            {availableBatches.map(batch => (
                                <option key={batch} value={batch}>دفعة {batch}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Filters */}
                    {(roleFilter || batchFilter) && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-all"
                        >
                            إعادة تعيين
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface border-b border-border">
                            <tr>
                                <th 
                                    className="text-center px-5 py-4 text-sm font-bold text-text cursor-pointer hover:bg-surface/50 transition-colors"
                                    onClick={() => handleSort('firstName')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        المستخدم
                                        {getSortIcon('firstName')}
                                    </div>
                                </th>
                                <th 
                                    className="text-center px-5 py-4 text-sm font-bold text-text cursor-pointer hover:bg-surface/50 transition-colors"
                                    onClick={() => handleSort('userRole')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        الدور
                                        {getSortIcon('userRole')}
                                    </div>
                                </th>
                                <th 
                                    className="text-center px-5 py-4 text-sm font-bold text-text cursor-pointer hover:bg-surface/50 transition-colors"
                                    onClick={() => handleSort('batchNumber')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        الدفعة
                                        {getSortIcon('batchNumber')}
                                    </div>
                                </th>
                                <th className="text-center px-5 py-4 text-sm font-bold text-text">تيليجرام</th>
                                <th 
                                    className="text-center px-5 py-4 text-sm font-bold text-text cursor-pointer hover:bg-surface/50 transition-colors"
                                    onClick={() => handleSort('teamJoinDate')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        تاريخ الانضمام
                                        {getSortIcon('teamJoinDate')}
                                    </div>
                                </th>
                                <th 
                                    className="text-center px-5 py-4 text-sm font-bold text-text cursor-pointer hover:bg-surface/50 transition-colors"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        تاريخ الإنشاء
                                        {getSortIcon('createdAt')}
                                    </div>
                                </th>
                                <th className="text-center px-5 py-4 text-sm font-bold text-text">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr 
                                    key={user.userId} 
                                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center gap-3 justify-center">
                                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-bold text-sm">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-text-muted">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {getRoleBadge(user.userRole)}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text text-center">
                                        {user.batchNumber || '-'}
                                    </td>
                                    <td className="px-5 py-4 text-center" dir="ltr">
                                        {user.telegramUsername ? (
                                            <button
                                                onClick={() => handleCopyTelegram(user.telegramUsername, user.userId)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                    copiedTelegram === user.userId
                                                        ? 'bg-success/15 text-success'
                                                        : 'text-primary hover:bg-primary/10'
                                                }`}
                                                title="نسخ"
                                            >
                                                {copiedTelegram === user.userId ? (
                                                    <>
                                                        <Check size={14} />
                                                        <span>{user.telegramUsername}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={14} />
                                                        <span>{user.telegramUsername}</span>
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text-muted text-center">
                                        {formatDate(user.teamJoinDate)}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text-muted text-center">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
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
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users size={36} className="text-text-muted mb-2" strokeWidth={1.3} />
                                            <p className="text-sm text-text-muted">
                                                {roleFilter || batchFilter ? 'لا توجد نتائج المطابقة' : 'لا توجد مستخدمين'}
                                            </p>
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
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                        onClick={closeModal}
                    />
                    <div className={`relative bg-surface-card border border-border rounded-2xl p-6 w-full max-w-lg mx-4 space-y-5 ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">
                                {editingId ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-all hover:text-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Error */}
                        {modalError && (
                            <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm animate-fade-slide-in">
                                <AlertCircle size={18} />
                                <span>{modalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">الاسم الأول</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                            <User className="h-[18px] w-[18px] text-text-muted" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            placeholder="أدخل الاسم الأول"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">اسم العائلة</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                            <User className="h-[18px] w-[18px] text-text-muted" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            placeholder="أدخل اسم العائلة"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">اسم المستخدم</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <User className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        onBeforeInput={handleUsernameInput}
                                        className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${usernameError ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border'}`}
                                        placeholder="أدخل اسم المستخدم"
                                        dir="ltr"
                                        disabled={editingId}
                                        required={!editingId}
                                    />
                                    {usernameError && (
                                        <p className="text-xs text-danger mt-1">{usernameError}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">
                                    كلمة المرور
                                    {editingId && <span className="text-text-muted font-normal"> (اتركها فارغة لإبقاء الحالية)</span>}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        onBeforeInput={handlePasswordInput}
                                        className={`w-full ps-10 pe-10 py-3 rounded-xl border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${passwordError ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border'}`}
                                        placeholder="أدخل كلمة المرور"
                                        dir="ltr"
                                        required={!editingId}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 end-0 pe-3 flex items-center text-text-muted hover:text-text transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-xs text-danger mt-1">{passwordError}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">الدور</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                            <Crown className="h-[18px] w-[18px] text-text-muted" />
                                        </div>
                                        <select
                                            value={formData.userRole}
                                            onChange={(e) => setFormData({...formData, userRole: e.target.value})}
                                            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        >
                                            <option value="TechMember">عضو تقني</option>
                                            <option value="ScientificMember">عضو علمي</option>
                                            <option value="Admin">مسؤول</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">الدفعة</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                            <Hash className="h-[18px] w-[18px] text-text-muted" />
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.batchNumber}
                                            onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                                            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            placeholder="رقم الدفعة"
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Telegram (اختياري)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <MessageCircle className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.telegramUsername}
                                        onChange={(e) => setFormData({...formData, telegramUsername: e.target.value})}
                                        className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        placeholder="أدخل يوزر التيليجرام"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">تاريخ الانضمام (اختياري)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <Calendar className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <input
                                        type="date"
                                        value={formData.teamJoinDate}
                                        onChange={(e) => setFormData({...formData, teamJoinDate: e.target.value})}
                                        className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
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