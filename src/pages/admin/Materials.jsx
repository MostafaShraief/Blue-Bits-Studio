import { useState, useEffect } from 'react';
import { authFetch } from '../../utils/api';
import { BookOpen, Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text">إدارة المواد</h1>
                <button
                    onClick={() => {
                        setFormData({ materialName: '', materialYear: 1 });
                        setEditingId(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default"
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

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h2 className="text-xl font-bold text-text">
                            {editingId ? 'تعديل مادة' : 'إضافة مادة جديدة'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">اسم المادة</label>
                                <input
                                    type="text"
                                    value={formData.materialName}
                                    onChange={(e) => setFormData({...formData, materialName: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">السنة الدراسية</label>
                                <select
                                    value={formData.materialYear}
                                    onChange={(e) => setFormData({...formData, materialYear: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text"
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
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text font-bold text-sm"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"
                                >
                                    {editingId ? 'تحديث' : 'إضافة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Materials Table */}
            <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-surface border-b border-border">
                        <tr>
                            <th className="text-start px-4 py-3 text-sm font-bold text-text">المادة</th>
                            <th className="text-start px-4 py-3 text-sm font-bold text-text">السنة</th>
                            <th className="text-start px-4 py-3 text-sm font-bold text-text">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                                    لا توجد مواد. أضف مادة للبدء.
                                </td>
                            </tr>
                        ) : materials.map((material) => (
                            <tr key={material.materialId} className="border-b border-border last:border-0">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <BookOpen size={18} className="text-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-text">{material.materialName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-primary/20 text-primary">
                                       السنة {material.materialYear}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(material)}
                                            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-default"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(material.materialId)}
                                            className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-default"
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
    );
}