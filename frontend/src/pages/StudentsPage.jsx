import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../lib/api';

function StudentModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial || { name: '', guardianContact: '', email: '', phone: '', notes: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(initial?._id);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.patch(`/students/${initial._id}`, form);
      } else {
        await api.post('/students', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4">
      <div className="w-full max-w-[420px] rounded-lg bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[19px] text-neutral-900">{isEdit ? 'Edit student' : 'Add student'}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
          <input name="guardianContact" placeholder="Guardian contact" value={form.guardianContact} onChange={handleChange}
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
          <input name="email" type="email" placeholder="Email (optional)" value={form.email} onChange={handleChange}
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
          <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange}
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
          <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} rows={2}
            className="w-full resize-none border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />

          {error && <p className="text-[13px] text-red-600">{error}</p>}

          <button type="submit" disabled={saving}
            className="mt-2 w-full rounded-md bg-emerald-950 py-3 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900 disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add student'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/students');
    setStudents(data.students);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this student? Their session and payment history is kept.')) return;
    await api.delete(`/students/${id}`);
    load();
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (student) => { setEditing(student); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const handleSaved = () => { setModalOpen(false); load(); };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[22px] text-neutral-900">Students</h1>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 rounded-md bg-emerald-950 px-4 py-2 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900">
          <Plus size={15} /> Add student
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-[0.08em] text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Guardian contact</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td className="px-5 py-6 text-neutral-500" colSpan={4}>Loading…</td></tr>
            ) : students.length === 0 ? (
              <tr><td className="px-5 py-6 text-neutral-500" colSpan={4}>No students yet — add your first one.</td></tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="text-neutral-800">
                  <td className="px-5 py-3.5 font-medium">{s.name}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{s.guardianContact || '—'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{s.phone || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(s)} className="text-neutral-400 hover:text-emerald-800"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(s._id)} className="text-neutral-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && <StudentModal initial={editing} onClose={closeModal} onSaved={handleSaved} />}
    </div>
  );
}