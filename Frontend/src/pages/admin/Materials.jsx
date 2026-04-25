import { useState, useEffect } from 'react';
import { authFetch } from '../../utils/api';
import {
    BookOpen,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    GraduationCap,
    Sparkles
} from 'lucide-react';

export default function AdminMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        materialName: '',
        materialYear: 1
    });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const data = await authFetch('/admin/materials');
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

        try {
            if (editingId) {
                await authFetch(`/admin/materials/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await authFetch('/admin/materials', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            
            setShowForm(false);
            setEditingId(null);
            setFormData({ materialName: '', materialYear: 1 });
            fetchMaterials();
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
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return;
        
        try {
            await authFetch(`/admin/materials/${id}`, { method: 'DELETE' });
            fetchMaterials();
        } catch (err) {
            alert(err.message);
        }
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
                    onClick={() => {
                        setFormData({ materialName: '', materialYear: 1 });
                        setEditingId(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    إضافة مادة
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Materials Table */}
            <div className="bg-surface-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface border-b border-border">
                            <tr>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">المادة</th>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">السنة</th>
                                <th className="text-start px-5 py-4 text-sm font-bold text-text">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-5 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <Sparkles size={36} className="text-text-muted mb-2" strokeWidth={1.3} />
                                            <p className="text-sm text-text-muted">لا توجد مواد. أضف مادة للبدء.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : materials.map((material, index) => (
                                <tr 
                                    key={material.materialId} 
                                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <GraduationCap size={20} className="text-primary" />
                                            </div>
                                            <span className="text-sm font-bold text-text">{material.materialName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary/15 text-primary">
                                            {getYearLabel(material.materialYear)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleEdit(material)}
                                                className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(material.materialId)}
                                                className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                        onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                        }}
                    />
                    <div className="relative bg-surface-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 space-y-5 animate-scaleIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">
                                {editingId ? 'تعديل مادة' : 'إضافة مادة جديدة'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="p-2 rounded-lg text-text-muted hover:bg-surface transition-all hover:text-text"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">اسم المادة</label>
                                <input
                                    type="text"
                                    value={formData.materialName}
                                    onChange={(e) => setFormData({...formData, materialName: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">السنة الدراسية</label>
                                <select
                                    value={formData.materialYear}
                                    onChange={(e) => setFormData({...formData, materialYear: parseInt(e.target.value)})}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                                        setShowForm(false);
                                        setEditingId(null);
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