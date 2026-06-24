import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import * as api from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GREEN = '#32a852';
const BLUE_LINE = 'rgba(59, 130, 246, 0.6)';

function getCurrentYear() {
  return new Date().getFullYear();
}

export default function YearOverview({ user }) {
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(getCurrentYear());
  const [data, setData] = useState(null);

  useEffect(() => { loadYear(); }, [year]);

  async function loadYear() {
    setLoading(true);
    try {
      const res = await api.getYearSummary(String(year));
      setData(res || null);
    } catch (e) {
      console.error('load year data error', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function prevYear() { setYear(y => y - 1); }
  function nextYear() { setYear(y => y + 1); }

  if (loading || !data) {
    return (
      <Layout username={user}>
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#32a852] rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const { total_spending, total_budgeted, variance, avg_monthly_spending, avg_monthly_budgeted, spend_rate, monthly_summary: rawMonthlySummary = [], category_variance } = data;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // January is 1
  
  const monthly_summary = (rawMonthlySummary || []).filter(m => {
    if (!m?.month) return false;
    if (year > currentYear) return true;
    return m.month <= currentMonth;
  });

  const pctUsed = total_budgeted > 0 ? (total_spending / total_budgeted) * 100 : 0;

  // Chart data with both spending and budget for comparison
  const chartData = monthly_summary.map(m => ({
    label: m.label,
    spending: m.spending,
    budget: m.budget > 0 ? m.budget : null,
  }));

  return (
    <Layout username={user}>
      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={prevYear} className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Roczny Przegląd - {year}</h2>
        <button onClick={nextYear} className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard label="Saldo roczne" value={variance} color={variance >= 0 ? GREEN : '#ef4444'} />
        <SummaryCard label="Wykorzystanie budżetu" value={spend_rate != null ? `${spend_rate}%` : 'N/A'} />
        <SummaryCard label="Średnie miesięczne wydatki" value={avg_monthly_spending} color="#3b82f6" />
        <SummaryCard label="Średni budżet miesięczny" value={avg_monthly_budgeted} color="#f59e0b" />
      </div>

      {/* Bar chart + category variance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending trends bar chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-base font-bold mb-4 text-gray-800 dark:text-slate-200">Wydatki w roku {year}</h3>
          {!monthly_summary || monthly_summary.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-slate-500 py-12">Brak danych. Dodaj transakcje aby zobaczyć wykres.</p>
          ) : (
            <ResponsiveContainer width={500} height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-600" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={60}/>
                <Tooltip formatter={(v) => [formatMoney(v), null]} content={<CustomBarTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }}/>
                <Line dataKey="spending" name="Wydatki" stroke={GREEN} strokeWidth={4} dot={{ r: 6, fill: '#fff', strokeWidth: 2, stroke: GREEN }} connectNulls />
                <Line type="monotone" dataKey="budget" name="Budżet" stroke={BLUE_LINE} strokeWidth={1.5} strokeDasharray="8 3" dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Progress overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-base font-bold mb-4 text-gray-800 dark:text-slate-200">Podsumowanie roku</h3>

          {/* Total budget bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Wykorzystanie budżetu rocznego</span>
              <span className={`text-lg font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMoney(variance)}
              </span>
            </div>

            <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min(100, pctUsed)}%`, backgroundColor: variance >= 0 ? GREEN : '#ef4444' }} />
            </div>

            <p className={`text-right text-sm font-bold mt-2 ${(total_budgeted <= 0 || monthly_summary[monthly_summary.length - 1]?.spending === 0) ? 'text-gray-400 dark:text-slate-500' : (variance >= 0 ? 'text-green-600' : 'text-red-600')}`}>
              {total_budgeted <= 0 || monthly_summary[monthly_summary.length - 1]?.spending === 0 ? 'Brak danych' : `${(total_spending / total_budgeted * 100).toFixed(1)}%`}
            </p>
          </div>

          {/* Category variance table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Odchylenia wg kategorii</h4>
            {!category_variance || category_variance.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-slate-500 py-6">Brak danych.</p>
            ) : (
              category_variance.slice(0, 8).map((cv, idx) => {
                const catPct = cv.budget > 0 ? Math.max(5, (cv.spending / cv.budget) * 100) : (cv.spending > 0 ? 5 : 0);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-slate-300">{cv.name}</span>
                      <span className={`text-xs font-medium ${( cv.variance >= 0 ? 'text-green-600' : 'text-red-600')}`}>
                        {formatMoney(cv.variance)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, catPct)}%`, backgroundColor: cv.variance >= 0 ? GREEN : '#ef4444' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
        <h3 className="text-base font-bold mb-4 text-gray-800 dark:text-slate-200">Miesięczne porównanie</h3>
        {!monthly_summary || monthly_summary.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-blue-slate-500 py-8">Brak danych.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Miesiąc</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Budżet</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Wydatek</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Saldo</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthly_summary.map((m, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-slate-200">{m.label}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-400">{formatMoney(m.budget)}</td>
                    <td className="py-3 px-4 text-right font-medium text-red-600 dark:text-red-400">{formatMoney(m.spending)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${m.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatMoney(m.balance)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${m.on_budget ? (variance >= 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400') : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {m.on_budget ? 'OK' : 'Nadbudżet'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </Layout>
  );
}

function SummaryCard({ label, value, color = GREEN }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden">
      <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold`} style={{ color }}>
        {typeof value === 'string' && value.endsWith('%') ? value : typeof value !== 'string' && (value == null || isNaN(parseFloat(value))) ? String(value) : formatMoney(value)}
      </p>
    </div>
  );
}

function formatMoney(v) {
  if (typeof v === 'string' && v.endsWith('zł')) return v;
  const num = Number(v);
  if (isNaN(num)) return String(v);
  return `${num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function CustomBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-md p-3 rounded-lg max-w-[240px]">
      {d.label && <p style={{ fontSize:'13px', fontWeight:700, marginBottom:'6px' }}>{d.label}</p>}
      {payload.map((e) => {
        const val = Number(e.value).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return (
          <div key={e.name} style={{ display:'flex', alignItems:'center', gap:'6px', margin:'4px 0' }}>
            <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:e.color, flexShrink:0 }} />
            <span style={{ color:'#6b7280', fontSize:'13px' }}>{e.name}</span>
            <strong>{val} zł</strong>
          </div>
        );
      })}
    </div>
  );
}

function ModalDodajWydatek({ isOpen, onClose, onSubmit, activeCategories = [] }) {
  const [form, setForm] = useState({ categoryId: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });

  if (!isOpen) return null;

  async function handleSubmit() {
    await onSubmit(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-slate-200">Dodaj wydatek</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kategoria</label>
            <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200">
              <option value="">Wybierz kategorię...</option>
              {activeCategories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kwota</label>
            <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Data</label>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Opis</label>
            <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Dodatkowy opis..." className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">Anuluj</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[#32a852] text-white hover:bg-[#1f8c42] transition-colors">Dodaj</button>
        </div>
      </div>
    </div>
  );
}
