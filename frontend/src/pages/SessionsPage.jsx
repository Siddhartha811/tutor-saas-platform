import { useEffect, useState } from 'react';
import { Plus, X, Check, Clock3, MinusCircle } from 'lucide-react';
import api from '../lib/api';
import { formatDateHeading, formatTime } from '../lib/formatDate';

const STATUS_STYLES = {
  scheduled: 'bg-neutral-100 text-neutral-600',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-50 text-red-600',
};

function NewSessionModal({ students, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', students: [], scheduledAt: '', durationMinutes: 60 });
  const [recurring, setRecurring] = useState(false);
  const [weeksCount, setWeeksCount] = useState(4);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleStudent = (id) =>
    setForm((f) => ({
      ...f,
      students: f.students.includes(id) ? f.students.filter((s) => s !== id) : [...f.students, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.students.length === 0) return setError('Select at least one student');
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
      if (recurring) {
        await api.post('/sessions/recurring', { ...payload, weeksCount: Number(weeksCount) });
      } else {
        await api.post('/sessions', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4">
      <div className="w-full max-w-[440px] rounded-lg bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[19px] text-neutral-900">New session</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X size={18} /></button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input placeholder="Title (e.g. Batch A — Physics)" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />

          <div>
            <p className="font-body mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">Students</p>
            <div className="max-h-32 space-y-1.5 overflow-y-auto">
              {students.map((s) => (
                <label key={s._id} className="flex items-center gap-2 text-[13px] text-neutral-700">
                  <input type="checkbox" checked={form.students.includes(s._id)} onChange={() => toggleStudent(s._id)}
                    className="accent-emerald-700" />
                  {s.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <input type="datetime-local" value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} required
              className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
            <input type="number" min={15} step={15} value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
              className="w-24 border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-neutral-700">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-emerald-700" />
            Repeat weekly
          </label>
          {recurring && (
            <input type="number" min={1} max={52} value={weeksCount} onChange={(e) => setWeeksCount(e.target.value)}
              placeholder="Number of weeks"
              className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
          )}

          {error && <p className="text-[13px] text-red-600">{error}</p>}

          <button type="submit" disabled={saving}
            className="mt-2 w-full rounded-md bg-emerald-950 py-3 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900 disabled:opacity-60">
            {saving ? 'Saving…' : recurring ? `Create ${weeksCount} sessions` : 'Create session'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AttendanceModal({ session, onClose, onSaved }) {
  const [records, setRecords] = useState(() =>
    session.students.map((s) => {
      const existing = session.attendance.find((a) => a.studentId === s._id);
      return { studentId: s._id, name: s.name, status: existing?.status || 'absent' };
    })
  );
  const [saving, setSaving] = useState(false);

  const setStatus = (studentId, status) =>
    setRecords((r) => r.map((rec) => (rec.studentId === studentId ? { ...rec, status } : rec)));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/sessions/${session._id}/attendance`, {
        records: records.map(({ studentId, status }) => ({ studentId, status })),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const statusButtons = [
    { key: 'present', icon: Check, label: 'Present' },
    { key: 'late', icon: Clock3, label: 'Late' },
    { key: 'excused', icon: MinusCircle, label: 'Excused' },
    { key: 'absent', icon: X, label: 'Absent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4">
      <div className="w-full max-w-[440px] rounded-lg bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[19px] text-neutral-900">{session.title}</h2>
            <p className="font-body text-[12px] text-neutral-500">
              {formatDateHeading(session.scheduledAt)} · {formatTime(session.scheduledAt)}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X size={18} /></button>
        </div>

        <div className="mt-6 space-y-3">
          {records.map((rec) => (
            <div key={rec.studentId} className="flex items-center justify-between">
              <span className="text-[13px] text-neutral-800">{rec.name}</span>
              <div className="flex gap-1.5">
                {statusButtons.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() => setStatus(rec.studentId, key)}
                    className={`flex h-7 w-7 items-center justify-center rounded-[3px] border transition-colors ${
                      rec.status === key
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : 'border-neutral-300 text-neutral-400 hover:border-emerald-700 hover:text-emerald-700'
                    }`}
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving}
          className="mt-7 w-full rounded-md bg-emerald-950 py-3 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save attendance'}
        </button>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const load = async () => {
    setLoading(true);
    const [sessionsRes, studentsRes] = await Promise.all([api.get('/sessions'), api.get('/students')]);
    setSessions(sessionsRes.data.sessions);
    setStudents(studentsRes.data.students);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grouped = sessions.reduce((acc, s) => {
    const key = new Date(s.scheduledAt).toDateString();
    (acc[key] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[22px] text-neutral-900">Sessions</h1>
        <button onClick={() => setNewModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-emerald-950 px-4 py-2 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900">
          <Plus size={15} /> New session
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {loading ? (
          <p className="text-[13px] text-neutral-500">Loading…</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-[13px] text-neutral-500">No sessions yet — schedule your first one.</p>
        ) : (
          Object.entries(grouped).map(([dateKey, daySessions]) => (
            <div key={dateKey}>
              <p className="font-display text-[14px] text-neutral-500">{formatDateHeading(dateKey)}</p>
              <div className="mt-2 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                {daySessions.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setActiveSession(s)}
                    className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[13px] hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-tally w-[68px] text-neutral-500">{formatTime(s.scheduledAt)}</span>
                      <span className="text-neutral-900">{s.title}</span>
                      <span className="text-neutral-400">{s.students.length} student{s.students.length !== 1 ? 's' : ''}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[s.status]}`}>
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {newModalOpen && (
        <NewSessionModal students={students} onClose={() => setNewModalOpen(false)}
          onSaved={() => { setNewModalOpen(false); load(); }} />
      )}
      {activeSession && (
        <AttendanceModal session={activeSession} onClose={() => setActiveSession(null)}
          onSaved={() => { setActiveSession(null); load(); }} />
      )}
    </div>
  );
}