import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '../utils/api';

const InvoiceGeneration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    billTo: '',
    mobileNumber: '',
    placeOfSupply: 'TamilNadu',
    items: [{ itemDescription: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    cgstRate: 2.75,
    sgstRate: 2.75,
    cgstAmount: 0,
    sgstAmount: 0,
    grandTotal: 0,
    receivedAmount: 0,
    previousBalance: 0,
    currentBalance: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      return calculateTotals(newData);
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = value;
      newItems[index].amount = Number(newItems[index].quantity) * Number(newItems[index].rate);
      return calculateTotals({ ...prev, items: newItems });
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemDescription: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return calculateTotals({ ...prev, items: newItems });
    });
  };

  const calculateTotals = (data) => {
    const subtotal = data.items.reduce((acc, curr) => acc + curr.amount, 0);
    const cgstAmount = Number(((subtotal * data.cgstRate) / 100).toFixed(2));
    const sgstAmount = Number(((subtotal * data.sgstRate) / 100).toFixed(2));
    const grandTotal = Math.round(subtotal + cgstAmount + sgstAmount);
    
    // Balance calculation based on user input for previous and received amount
    const currBal = grandTotal + Number(data.previousBalance) - Number(data.receivedAmount);
    
    return {
      ...data,
      subtotal,
      cgstAmount,
      sgstAmount,
      grandTotal,
      currentBalance: currBal
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/invoices', formData);
      navigate('/invoices');
    } catch (err) {
      console.error(err);
      alert('Error generating invoice: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#7e3f3f] tracking-tight">Generate New Invoice</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Create a final Bill of Supply with proper taxation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bill To (Name)</label>
              <input type="text" name="billTo" value={formData.billTo} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
              <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Place of Supply</label>
              <input type="text" name="placeOfSupply" value={formData.placeOfSupply} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#f3e6c0] overflow-hidden">
          <div className="bg-[#fdf9f1] p-6 border-b border-[#f3e6c0]">
            <h2 className="text-xl font-bold text-[#7e3f3f]">Invoice Items</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto rounded-xl border border-gray-100 mb-6">
              <table className="w-full text-left bg-gray-50/50">
                <thead>
                  <tr className="bg-gray-100/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-3 pl-4 w-12">No</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 w-24">Qty</th>
                    <th className="p-3 w-32">Rate (₹)</th>
                    <th className="p-3 w-32">Amount (₹)</th>
                    <th className="p-3 pr-4 text-right w-16">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3 pl-4 text-sm font-medium text-gray-400">{index + 1}</td>
                      <td className="p-3"><input type="text" value={item.itemDescription} onChange={e=>handleItemChange(index, 'itemDescription', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7e3f3f] outline-none" required placeholder="E.g. Breakfast Combo" /></td>
                      <td className="p-3"><input type="number" min="1" value={item.quantity} onChange={e=>handleItemChange(index, 'quantity', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-[#7e3f3f] outline-none" required /></td>
                      <td className="p-3"><input type="number" min="0" value={item.rate} onChange={e=>handleItemChange(index, 'rate', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-[#7e3f3f] outline-none" required /></td>
                      <td className="p-3 font-bold text-gray-800">₹{item.amount}</td>
                      <td className="p-3 pr-4 text-right"><button type="button" onClick={()=>removeItem(index)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addItem} className="text-[#7e3f3f] bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center mb-6"> <Plus size={16} className="mr-1"/> Add Item </button>

            {/* Calculations Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700">Tax & Adjustments</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CGST (%)</label>
                    <input type="number" step="0.01" name="cgstRate" value={formData.cgstRate} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#7e3f3f] outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SGST (%)</label>
                    <input type="number" step="0.01" name="sgstRate" value={formData.sgstRate} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#7e3f3f] outline-none" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Previous Balance (₹)</label>
                    <input type="number" name="previousBalance" value={formData.previousBalance} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#7e3f3f] outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Received Amt (₹)</label>
                    <input type="number" name="receivedAmount" value={formData.receivedAmount} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#7e3f3f] outline-none text-green-700 font-bold" />
                  </div>
                </div>
              </div>

              <div className="bg-[#fdf9f1] p-6 rounded-2xl border border-[#f3e6c0] flex flex-col justify-center space-y-3">
                <div className="flex justify-between font-medium text-gray-700"><span>Subtotal:</span><span>₹{formData.subtotal}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>CGST ({formData.cgstRate}%):</span><span>₹{formData.cgstAmount}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>SGST ({formData.sgstRate}%):</span><span>₹{formData.sgstAmount}</span></div>
                <div className="border-t border-[#d4af37]/30 my-2"></div>
                <div className="flex justify-between font-bold text-lg text-gray-800"><span>Grand Total:</span><span>₹{formData.grandTotal}</span></div>
                <div className="flex justify-between font-extrabold text-[#7e3f3f] text-2xl mt-2"><span>Current Balance:</span><span>₹{formData.currentBalance}</span></div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#7e3f3f] hover:bg-[#6b3535] text-white py-4 rounded-xl font-extrabold text-lg flex justify-center items-center shadow-lg transition-transform active:scale-95 disabled:opacity-70 mt-4">
          <Save size={20} className="mr-2"/> {loading ? 'Saving...' : 'Generate Invoice Document'}
        </button>
      </form>
    </div>
  );
};

export default InvoiceGeneration;
