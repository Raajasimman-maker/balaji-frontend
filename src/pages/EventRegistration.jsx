import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, IndianRupee } from 'lucide-react';
import api from '../utils/api';

const EventRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  
  // Event Details
  const [eventData, setEventData] = useState({
    partyName: '',
    eventVenue: '',
    eventDate: '',
    vegCount: 0,
    nonVegCount: 0,
    sessions: []
  });

  useEffect(() => {
    api.get('/food-items').then(res => setAvailableItems(res.data)).catch(console.error);
  }, []);

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const addSession = () => {
    setEventData(prev => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          id: Date.now(), // temp id for UI
          sessionName: '',
          time: '',
          location: '',
          numberOfPersons: 0,
          items: [],
          subtotal: 0
        }
      ]
    }));
  };

  const removeSession = (index) => {
    const newSessions = [...eventData.sessions];
    newSessions.splice(index, 1);
    setEventData(prev => ({ ...prev, sessions: newSessions }));
  };

  const handeSessionChange = (index, field, value) => {
    const newSessions = [...eventData.sessions];
    newSessions[index][field] = value;
    setEventData(prev => ({ ...prev, sessions: newSessions }));
  };

  // Session Items Add
  const addSessionItem = (sessionIndex) => {
    const newSessions = [...eventData.sessions];
    newSessions[sessionIndex].items.push({
      foodItem: '',
      name: '',
      quantity: 1,
      rate: 0,
      amount: 0
    });
    setEventData(prev => ({ ...prev, sessions: newSessions }));
  };

  const removeSessionItem = (sessionIndex, itemIndex) => {
    const newSessions = [...eventData.sessions];
    newSessions[sessionIndex].items.splice(itemIndex, 1);
    updateSessionSubtotal(newSessions, sessionIndex);
  };

  const handleItemChange = (sessionIndex, itemIndex, field, value) => {
    const newSessions = [...eventData.sessions];
    const item = newSessions[sessionIndex].items[itemIndex];
    
    if (field === 'foodItem') {
      const selectedItem = availableItems.find(i => i._id === value);
      item.foodItem = value;
      item.name = selectedItem ? selectedItem.name : '';
      item.rate = selectedItem ? selectedItem.defaultRate : 0;
    } else {
      item[field] = value;
    }
    
    // Auto calculate amount
    item.amount = Number(item.quantity) * Number(item.rate);
    
    updateSessionSubtotal(newSessions, sessionIndex);
  };

  const updateSessionSubtotal = (newSessions, sessionIndex) => {
    const subtotal = newSessions[sessionIndex].items.reduce((acc, curr) => acc + curr.amount, 0);
    newSessions[sessionIndex].subtotal = subtotal;
    setEventData(prev => ({ ...prev, sessions: newSessions }));
  };

  const getTotals = () => {
    const subTotal = eventData.sessions.reduce((acc, curr) => acc + curr.subtotal, 0);
    const cgstAmount = Number(((subTotal * 2.75) / 100).toFixed(2));
    const sgstAmount = Number(((subTotal * 2.75) / 100).toFixed(2));
    const grandTotal = Math.round(subTotal + cgstAmount + sgstAmount);
    return { subTotal, cgstAmount, sgstAmount, grandTotal };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totals = getTotals();
      const dataToSave = {
        ...eventData,
        ...totals
      };
      // Clean temp IDs
      dataToSave.sessions.forEach(s => delete s.id);
      
      const res = await api.post('/events', dataToSave);
      const eventId = res.data._id;
      
      // Generate Quotation right after event is created
      await api.post('/quotations', {
        eventId: eventId,
        grandTotal: totals.grandTotal
      });
      
      navigate('/quotations'); // Redirect to quotation list/history
    } catch (err) {
      console.error(err);
      alert('Error saving event: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#7e3f3f] tracking-tight">Create Quotation / Event</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Register a new party event and build its session menu.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Event Details */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Party Name</label>
              <input type="text" name="partyName" value={eventData.partyName} onChange={handleEventChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" placeholder="E.g. NSS - SJC" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Venue</label>
              <input type="text" name="eventVenue" value={eventData.eventVenue} onChange={handleEventChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" placeholder="E.g. Collector Office" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Date</label>
              <input type="date" name="eventDate" value={eventData.eventDate} onChange={handleEventChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Veg Count</label>
              <input type="number" min="0" name="vegCount" value={eventData.vegCount} onChange={handleEventChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Non-Veg Count</label>
              <input type="number" min="0" name="nonVegCount" value={eventData.nonVegCount} onChange={handleEventChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#7e3f3f] outline-none transition-all font-medium" />
            </div>
          </div>
        </div>

        {/* Sessions Loop */}
        <div className="space-y-6">
          {eventData.sessions.map((session, sIndex) => (
            <div key={session.id} className="bg-white rounded-3xl shadow-md border border-[#f5e6e6] overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-[#fffafa] p-6 border-b border-[#f5e6e6] flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#7e3f3f]">Session {sIndex + 1}: {session.sessionName || 'New Session'}</h3>
                <button type="button" onClick={() => removeSession(sIndex)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center text-sm font-semibold">
                  <Trash2 size={16} className="mr-1"/> Remove Session
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Session Name</label>
                    <input type="text" value={session.sessionName} onChange={(e) => handeSessionChange(sIndex, 'sessionName', e.target.value)} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e3f3f] outline-none" placeholder="Tea & Snacks / Lunch" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                    <input type="text" value={session.time} onChange={(e) => handeSessionChange(sIndex, 'time', e.target.value)} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e3f3f] outline-none" placeholder="11:00 AM" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                    <input type="text" value={session.location} onChange={(e) => handeSessionChange(sIndex, 'location', e.target.value)} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e3f3f] outline-none" placeholder="New Collector Office" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">No. of Persons</label>
                    <input type="number" value={session.numberOfPersons} onChange={(e) => handeSessionChange(sIndex, 'numberOfPersons', e.target.value)} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e3f3f] outline-none" placeholder="60" />
                  </div>
                </div>

                {/* Session Items Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100 mb-4">
                  <table className="w-full text-left bg-gray-50/50">
                    <thead>
                      <tr className="bg-gray-100/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-3 pl-4 w-12">No</th>
                        <th className="p-3 w-1/3">Particulars (Food Item)</th>
                        <th className="p-3 w-24">Qty</th>
                        <th className="p-3 w-32">Rate (₹)</th>
                        <th className="p-3 w-32">Amount (₹)</th>
                        <th className="p-3 pr-4 text-right w-16">Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {session.items.map((item, iIndex) => (
                        <tr key={iIndex}>
                          <td className="p-3 pl-4 text-sm font-medium text-gray-400">{iIndex + 1}</td>
                          <td className="p-3">
                            <select 
                              value={item.foodItem} 
                              onChange={(e) => handleItemChange(sIndex, iIndex, 'foodItem', e.target.value)}
                              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7e3f3f] outline-none" required
                            >
                              <option value="">-- Select Item --</option>
                              {availableItems.map(food => (
                                <option key={food._id} value={food._id}>{food.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(sIndex, iIndex, 'quantity', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-[#7e3f3f] outline-none" required/>
                          </td>
                          <td className="p-3">
                            <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(sIndex, iIndex, 'rate', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-[#7e3f3f] outline-none" required/>
                          </td>
                          <td className="p-3 font-bold text-gray-800">₹{item.amount}</td>
                          <td className="p-3 pr-4 text-right">
                            <button type="button" onClick={() => removeSessionItem(sIndex, iIndex)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <button type="button" onClick={() => addSessionItem(sIndex)} className="text-[#7e3f3f] hover:text-[#582a2a] bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center">
                    <Plus size={16} className="mr-1"/> Add Food Item
                  </button>
                  <div className="text-lg font-bold bg-[#fffafa] text-[#7e3f3f] px-6 py-2 rounded-xl border border-[#f5e6e6]">
                    Subtotal: ₹{session.subtotal}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSession} className="w-full border-2 border-dashed border-[#7e3f3f]/30 text-[#7e3f3f] rounded-3xl py-6 flex flex-col items-center justify-center hover:bg-red-50/50 hover:border-[#7e3f3f]/60 transition-all font-bold group">
          <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          Add New Session (e.g., Breakfast, Lunch)
        </button>

        <div className="bg-[#7e3f3f] text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-red-900/30">
          <div>
            <p className="text-red-200 text-sm font-medium mb-1 flex justify-between w-full min-w-[200px]">
              <span>Subtotal:</span>
              <span>₹{getTotals().subTotal}</span>
            </p>
            <p className="text-red-200 text-sm font-medium mb-1 flex justify-between w-full">
              <span>CGST (2.75%):</span>
              <span>₹{getTotals().cgstAmount}</span>
            </p>
            <p className="text-red-200 text-sm font-medium mb-2 flex justify-between w-full border-b border-red-400/30 pb-2">
              <span>SGST (2.75%):</span>
              <span>₹{getTotals().sgstAmount}</span>
            </p>
            <p className="text-white font-bold mb-1 uppercase tracking-wide text-sm">Grand Total</p>
            <div className="text-4xl md:text-5xl font-extrabold flex items-center">
              <IndianRupee size={36} className="mr-1 opacity-80" /> {getTotals().grandTotal}
            </div>
          </div>
          
          <button type="submit" disabled={loading || eventData.sessions.length === 0} className="mt-6 md:mt-0 bg-white text-[#7e3f3f] px-8 py-4 rounded-xl font-extrabold text-lg flex items-center hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            <Save size={20} className="mr-2" /> 
            {loading ? 'Saving Event...' : 'Save & Generate Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventRegistration;
