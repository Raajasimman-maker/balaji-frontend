import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Eye, IndianRupee } from 'lucide-react';
import api from '../utils/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices')
       .then(res => setInvoices(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#7e3f3f] tracking-tight flex items-center">
            <Receipt size={28} className="mr-3 text-[#7e3f3f]/80" /> Invoice History
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">View and download generated final invoice PDFs.</p>
        </div>
        <Link to="/invoices/new" className="bg-[#7e3f3f] hover:bg-[#6b3535] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-900/10">
          Create New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6 md:pl-8">Date</th>
                <th className="p-4">Invoice No.</th>
                <th className="p-4">Bill To</th>
                <th className="p-4">Current Balance</th>
                <th className="p-4 pr-6 md:pr-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium animate-pulse">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium">No invoices generated yet.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="p-4 pl-6 md:pl-8 text-sm text-gray-500 font-medium">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4 text-sm font-bold text-[#7e3f3f]">{inv.invoiceNumber}</td>
                    <td className="p-4 text-sm text-gray-800 font-medium">{inv.billTo}</td>
                    <td className="p-4 text-sm text-gray-800 font-bold flex items-center">
                      <IndianRupee size={14} className="mr-0.5" />{inv.currentBalance}
                    </td>
                    <td className="p-4 pr-6 md:pr-8 text-right">
                      <Link to={`/invoices/${inv._id}`} className="inline-flex items-center text-[#7e3f3f] hover:text-[#582a2a] bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        <Eye size={16} className="mr-2"/> View PDF
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
