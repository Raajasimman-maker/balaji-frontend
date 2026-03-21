import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';

const FoodItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // new item form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [defaultRate, setDefaultRate] = useState('');

  const fetchItems = async () => {
    try {
      const res = await api.get('/food-items');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if(!name || !category || !defaultRate) return;
    try {
      await api.post('/food-items', { name, category, defaultRate: Number(defaultRate) });
      setName(''); setCategory(''); setDefaultRate('');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this specific food item?')) {
      try {
        await api.delete(`/food-items/${id}`);
        fetchItems();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#7e3f3f] tracking-tight">Food Items Management</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Add or remove items for your catering menu. These will appear in dropdowns.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 bg-orange-50/30">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Add New Food Item</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Item Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e3f3f] focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium" placeholder="E.g., Mutton Biriyani" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <input type="text" value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e3f3f] focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium" placeholder="Main Course" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rate (₹)</label>
              <input type="number" min="0" value={defaultRate} onChange={e=>setDefaultRate(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e3f3f] focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium" placeholder="250" required />
            </div>
            <button type="submit" className="w-full bg-[#7e3f3f] hover:bg-[#6b3535] active:bg-[#582a2a] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-900/10 flex items-center justify-center h-[50px]">
              <Plus size={20} className="mr-2" /> Add Item
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6 md:pl-8">S.No</th>
                <th className="p-4">Particulars</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rate (₹)</th>
                <th className="p-4 pr-6 md:pr-8 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium animate-pulse">Loading menu items...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium">No food items found in the database. Add your first item above!</td></tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item._id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="p-4 pl-6 md:pl-8 text-sm text-gray-400 font-medium">{index + 1}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">{item.name}</td>
                    <td className="p-4 text-sm">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold tracking-wide">{item.category}</span>
                    </td>
                    <td className="p-4 text-sm text-[#7e3f3f] font-bold">₹{item.defaultRate}/-</td>
                    <td className="p-4 pr-6 md:pr-8 text-right">
                      <button onClick={() => handleDelete(item._id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <Trash2 size={18} />
                      </button>
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

export default FoodItems;
