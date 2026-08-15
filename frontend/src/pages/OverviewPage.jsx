import { useEffect, useState } from 'react';
import api from '../lib/api';

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-6 py-5">
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">{label}</p>
      <p className="font-tally mt-2 text-[32px] leading-none text-neutral-900">{value}</p>
      <p className="font-body mt-1.5 text-[12px] text-neutral-500">{sub}</p>
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState({ students: 0, sessionsThisWeek: 0, pendingPayments: 0 });

  useEffect(() => {
    const load = async () => {
      // allSettled — one endpoint failing must not blank out the other two counts
      const [studentsRes, sessionsRes, paymentsRes] = await Promise.allSettled([
        api.get('/students'),
        api.get('/sessions'),
        api.get('/payments', { params: { status: 'pending' } }),
      ]);

      setStats((prev) => ({
        students: studentsRes.status === 'fulfilled' ? studentsRes.value.data.count : prev.students,
        sessionsThisWeek: sessionsRes.status === 'fulfilled' ? sessionsRes.value.data.count : prev.sessionsThisWeek,
        pendingPayments: paymentsRes.status === 'fulfilled' ? paymentsRes.value.data.count : prev.pendingPayments,
      }));

      [studentsRes, sessionsRes, paymentsRes].forEach((r) => {
        if (r.status === 'rejected') console.error('Overview stat fetch failed:', r.reason);
      });
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Active students" value={stats.students} sub="Full cohort" />
      <StatCard label="Sessions" value={stats.sessionsThisWeek} sub="Upcoming & completed" />
      <StatCard label="Pending payments" value={stats.pendingPayments} sub="Awaiting collection" />
    </div>
  );
}