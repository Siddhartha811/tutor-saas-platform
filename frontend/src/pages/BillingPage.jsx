import { useEffect, useState } from 'react';
import { Plus, X, Link2 } from 'lucide-react';
import api from '../lib/api';
import { formatINR } from '../lib/formatCurrency';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-50 text-red-600',
  cancelled: 'bg-neutral-100 text-neutral-500',
};

function NewInvoiceModal({ students = [], onClose, onSaved }) {
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    description: '',
    dueDate: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/payments', {
        studentId: form.studentId,
        amount: Math.round(Number(form.amount) * 100),
        description: form.description,
        ...(form.dueDate && {
          dueDate: new Date(form.dueDate).toISOString(),
        }),
      });

      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not create invoice'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4">
      <div className="w-full max-w-[420px] rounded-lg bg-white p-7 shadow-xl">

        <div className="flex items-center justify-between">
          <h2 className="font-display text-[19px] text-neutral-900">
            New invoice
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >

          <select
            value={form.studentId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                studentId: e.target.value,
              }))
            }
            required
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none"
          >
            <option value="" disabled>
              Select student
            </option>

            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                amount: e.target.value,
              }))
            }
            required
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none"
          />

          <input
            placeholder="Description (e.g. August fees)"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                description: e.target.value,
              }))
            }
            required
            className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none"
          />

          <div>
            <p className="font-body mb-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
              Due date (optional)
            </p>

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  dueDate: e.target.value,
                }))
              }
              className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-md bg-emerald-950 py-3 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900 disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create invoice'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [linkLoadingId, setLinkLoadingId] = useState(null);

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/students');

      console.log('Students received:', data.students);

      setStudents(data.students || []);
    } catch (err) {
      console.error('Students load error:', err);
      setStudents([]);
    }
  };

  const loadPayments = async () => {
    try {
      const { data } = await api.get('/payments');

      setPayments(data.payments || []);
    } catch (err) {
      console.error('Payments load error:', err);
      setPayments([]);
    }
  };

  const load = async () => {
    setLoading(true);

    await Promise.all([
      loadStudents(),
      loadPayments(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const getPaymentLink = async (paymentId) => {
    setLinkLoadingId(paymentId);

    try {
      const { data } = await api.post(
        `/payments/${paymentId}/checkout-session`
      );

      window.open(
        data.url,
        '_blank',
        'noopener,noreferrer'
      );
    } catch (err) {
      console.error('Payment link error:', err);
    } finally {
      setLinkLoadingId(null);
    }
  };

  const totalOutstanding = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>

      <div className="flex items-center justify-between">

        <div>
          <h1 className="font-display text-[22px] text-neutral-900">
            Billing
          </h1>

          <p className="font-tally mt-1 text-[13px] text-neutral-500">
            {formatINR(totalOutstanding)} outstanding
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-emerald-950 px-4 py-2 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900"
        >
          <Plus size={15} />
          New invoice
        </button>

      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">

        <table className="w-full text-left text-[13px]">

          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-[0.08em] text-neutral-500">

            <tr>
              <th className="px-5 py-3 font-medium">
                Student
              </th>

              <th className="px-5 py-3 font-medium">
                Description
              </th>

              <th className="px-5 py-3 font-medium">
                Amount
              </th>

              <th className="px-5 py-3 font-medium">
                Status
              </th>

              <th className="px-5 py-3 font-medium"></th>
            </tr>

          </thead>

          <tbody className="divide-y divide-neutral-100">

            {loading ? (

              <tr>
                <td
                  className="px-5 py-6 text-neutral-500"
                  colSpan={5}
                >
                  Loading…
                </td>
              </tr>

            ) : payments.length === 0 ? (

              <tr>
                <td
                  className="px-5 py-6 text-neutral-500"
                  colSpan={5}
                >
                  No invoices yet.
                </td>
              </tr>

            ) : (

              payments.map((p) => (

                <tr
                  key={p._id}
                  className="text-neutral-800"
                >

                  <td className="px-5 py-3.5 font-medium">
                    {p.studentId?.name || '—'}
                  </td>

                  <td className="px-5 py-3.5 text-neutral-600">
                    {p.description}
                  </td>

                  <td className="font-tally px-5 py-3.5">
                    {formatINR(p.amount)}
                  </td>

                  <td className="px-5 py-3.5">

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                        STATUS_STYLES[p.status]
                      }`}
                    >
                      {p.status}
                    </span>

                  </td>

                  <td className="px-5 py-3.5 text-right">

                    {p.status === 'pending' && (

                      <button
                        onClick={() => getPaymentLink(p._id)}
                        disabled={linkLoadingId === p._id}
                        className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-900 disabled:opacity-50"
                      >
                        <Link2 size={14} />

                        {linkLoadingId === p._id
                          ? 'Generating…'
                          : 'Payment link'}
                      </button>

                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {modalOpen && (
        <NewInvoiceModal
          students={students}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}

    </div>
  );
}