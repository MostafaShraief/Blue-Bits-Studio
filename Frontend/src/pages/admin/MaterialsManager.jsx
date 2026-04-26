import { useState, useEffect, useMemo } from 'react';
import {
    fetchAdminMaterials,
    createAdminMaterial,
    updateAdminMaterial,
    deleteAdminMaterial
} from '../../utils/api';
import {
    BookOpen,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    Sparkles,
    Eye,
    EyeOff,
    Calendar,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    GraduationCap,
    Hash
} from 'lucide-react';

export default function MaterialsManager() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    
    // Filters
    const [yearFilter, setYearFilter] = useState('');
    
    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    
    // Available years from data
    const availableYears = useMemo(() => {
        const years = new Set(materials.map(m => m.materialYear).filter(Boolean));
        return Array.from(years).sort((a, b) => a - b);
    }, [materials]);
    
    // Filtered and sorted materials
    const filteredMaterials = useMemo(() => {
        let result = [...materials];
        
        // Filter by year
        if (yearFilter) {
            const yearNum = parseInt(yearFilter, 10);
            result = result.filter(m => m.materialYear === yearNum);
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
    }, [materials, yearFilter, sortConfig]);
    
    const [formData, setFormData] = useState({
        materialName: '',
        materialYear: 1
    });

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminMaterials();
            setMaterials(data);
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
            materialName: formData.materialName,
            materialYear: parseInt(formData.materialYear)
        };

        try {
            if (editingId) {
                await updateAdminMaterial(editingId, payload);
            } else {
                await createAdminMaterial(payload);
            }

            setShowModal(false);
            resetForm();
            loadMaterials();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (material) => {
        setFormData({
            materialName: material.materialName,
            materialYear: material.materialYear
        });
        setEditingId(material.materialId);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return;

        try {
            await deleteAdminMaterial(id);
            loadMaterials();
        } catch (err) {
            alert(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            materialName: '',
            materialYear: 1
        });
        setEditingId(null);
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

    const getYearLabel = (year) => {
        const labels = {
            1: 'السنة الأولى',
            2: 'السنة الثانية',
            3: 'السنة الثالثة',
            4: 'السنة الرابعة',
            5: 'السنة الخامسة'
        };
        return labels[year] || `السنة ${year}`;
    };

    const getYearBadge = (year) => {
        const colors = {
            1: 'bg-primary/15 text-primary',
            2: 'bg-cyan/15 text-cyan-600 dark:text-cyan-400',
            3: 'bg-success/15 text-success',
            4: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
            5: 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
        };
        const colorClass = colors[year] || colors[1];
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${colorClass}`}>
                <GraduationCap size={12} strokeWidth={2} />
                {getYearLabel(year)}
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

    const resetFilters = () => {
        setYearFilter('');
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
                <div>
                    <h1 className="text-2xl font-bold text-text">إدارة المواد</h1>
                    <p className="text-sm text-text-secondary mt-1">إجمالي {materials.length} مادة</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    إضافة مادة
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
                        عرض {filteredMaterials.length} من {materials.length} مادة
                    </span>

                    <div className="flex items-center gap-2 text-sm font-medium text-text">
                        <Filter size={16} className="text-text-muted" />
                        <span>تصفية:</span>
                    </div>
                    
                    {/* Year Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-muted">السنة:</label>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="min-w-[120px] px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="">الكل</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{getYearLabel(year)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Filters */}
                    {yearFilter && (
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
                                    onClick={() => handleSort('materialName')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        المادة
                                        {getSortIcon('materialName')}
                                    </div>
                                </th>
                                <th 
                                    className="text-center px-5 py-4 text-sm font-bold text-text cursor-pointer hover:bg-surface/50 transition-colors"
                                    onClick={() => handleSort('materialYear')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        السنة الدراسية
                                        {getSortIcon('materialYear')}
                                    </div>
                                </th>
                                <th className="text-center px-5 py-4 text-sm font-bold text-text">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map((material, index) => (
                                <tr 
                                    key={material.materialId} 
                                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <td className="px-5 py-4 text-center">
                                        <p className="text-sm font-bold text-text">{material.materialName}</p>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {getYearBadge(material.materialYear)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => handleEdit(material)}
                                                className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                                                title="تعديل"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(material.materialId)}
                                                className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredMaterials.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-5 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <Sparkles size={36} className="text-text-muted mb-2" strokeWidth={1.3} />
                                            <p className="text-sm text-text-muted">
                                                {yearFilter ? 'لا توجد نتائج المطابقة' : 'لا توجد مواد'}
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
                    <div className={`relative bg-surface-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 space-y-5 ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">
                                {editingId ? 'تعديل مادة' : 'إضافة مادة جديدة'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-all hover:text-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">اسم المادة</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <BookOpen className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.materialName}
                                        onChange={(e) => setFormData({...formData, materialName: e.target.value})}
                                        className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        placeholder="مثال: هندسة البرمجيات"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">السنة الدراسية</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <Calendar className="h-[18px] w-[18px] text-text-muted" />
                                    </div>
                                    <select
                                        value={formData.materialYear}
                                        onChange={(e) => setFormData({...formData, materialYear: parseInt(e.target.value)})}
                                        className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    >
                                        <option value={1}>السنة الأولى</option>
                                        <option value={2}>السنة الثانية</option>
                                        <option value={3}>السنة الثالثة</option>
                                        <option value={4}>السنة الرابعة</option>
                                        <option value={5}>السنة الخامسة</option>
                                    </select>
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