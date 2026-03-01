import { useState } from 'react';
import { ChevronLeft, Settings2 } from 'lucide-react';

const tabs = ['All', 'Completed', 'Pending'];

const transactions = [
  {
    id: 1,
    title: 'AC Installation',
    dateTime: '30 May, 2024, 08:00 AM',
    reference: 'Milestone 1',
    status: 'Completed'
  },
  {
    id: 2,
    title: 'Electrical Repair',
    dateTime: '01 Jun, 2024, 10:30 AM',
    reference: 'Milestone 2',
    status: 'Pending'
  },
  {
    id: 3,
    title: 'Borehole Servicing',
    dateTime: '03 Jun, 2024, 01:00 PM',
    reference: 'Milestone 3',
    status: 'Completed'
  }
];

function Transaction({ onBack, transactions: appTransactions = [], showWithdraw = false, onWithdraw }) {
  const [activeTab, setActiveTab] = useState('All');
  const sourceTransactions = appTransactions.length > 0 ? appTransactions : transactions;

  const filteredTransactions =
    activeTab === 'All'
      ? sourceTransactions
      : sourceTransactions.filter((item) => item.status === activeTab);

  const totalRecords = sourceTransactions.length;

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl border border-white bg-white/90 flex items-center justify-center hover:bg-white transition shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Work Records</h1>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 rounded-2xl p-6 mb-6 text-center shadow-[0_14px_30px_rgba(15,23,42,0.24)]">
        <p className="text-sm text-gray-300 mb-1">Total records</p>
        <p className="text-3xl font-bold text-white">{totalRecords}</p>
        {showWithdraw && (
          <button
            type="button"
            onClick={onWithdraw}
            className="mt-4 bg-white text-slate-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition"
          >
            Export Records
          </button>
        )}
      </div>

      <div className="flex bg-white/80 border border-white rounded-2xl p-1 mb-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((item) => {
          const isCompleted = item.status === 'Completed';
          return (
            <article key={item.id} className="border border-white rounded-2xl p-4 flex items-center justify-between bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Settings2 size={18} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{item.title}</h2>
                  <p className="text-xs text-gray-500">{item.dateTime}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{item.reference || 'Update'}</p>
                <span className={`text-xs font-semibold ${isCompleted ? 'text-green-600' : 'text-blue-500'}`}>
                  {item.status}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Transaction;

