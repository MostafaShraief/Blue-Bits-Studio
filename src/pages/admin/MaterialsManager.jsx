import { useState, useEffect } from 'react';
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
    GraduationCap
} from 'lucide-react';

export default function MaterialsManager() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
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
        setShowModal(true);
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-default shadow-lg shadow-green-500/25"
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

            {/* Materials Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {materials.map((material) => (
                    <div
                        key={material.materialId}
                        className="bg-surface-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <GraduationCap size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text">{material.materialName}</h3>
                                    <p className="text-sm text-text-muted">
                                        {getYearLabel(material.materialYear)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(material)}
                                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-default"
                                    title="تعديل"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(material.materialId)}
                                    className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-default"
                                    title="حذف"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-600">
                                {getYearLabel(material.materialYear)}
                            </span>
                        </div>
                    </div>
                ))}

                {materials.length === 0 && (
                    <div className="col-span-full">
                        <div className="bg-surface-card border border-border rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
                                <BookOpen size={32} className="text-text-muted" />
                            </div>
                            <h3 className="text-lg font-bold text-text mb-2">لا توجد مواد</h3>
                            <p className="text-sm text-text-muted mb-4">أضف مادة للبدء</p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default"
                            >
                                <Plus size={18} />
                                إضافة مادة
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                        onClick={() => { setShowModal(false); resetForm(); }}
                    />
                    <div className="relative bg-surface-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 space-y-4 animate-scaleIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">
                                {editingId ? 'تعديل مادة' : 'إضافة مادة جديدة'}
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
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">اسم المادة</label>
                                <input
                                    type="text"
                                    value={formData.materialName}
                                    onChange={(e) => setFormData({...formData, materialName: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    placeholder="مثال: هندسة البرمجيات"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">السنة الدراسية</label>
                                <select
                                    value={formData.materialYear}
                                    onChange={(e) => setFormData({...formData, materialYear: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                >
                                    <option value={1}>السنة الأولى</option>
                                    <option value={2}>السنة الثانية</option>
                                    <option value={3}>السنة الثالثة</option>
                                    <option value={4}>السنة الرابعة</option>
                                    <option value={5}>السنة الخامسة</option>
                                </select>
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
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-default shadow-lg shadow-green-500/25"
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