import { Link } from 'react-router-dom';
import { CalendarPlus, UtensilsCrossed, FileText, Receipt } from 'lucide-react';

const Dashboard = () => {
  const cards = [
    { name: 'Create Quotation/Event', path: '/events/new', icon: <CalendarPlus size={32} />, color: 'bg-indigo-50 text-indigo-600', borderColor: 'border-indigo-100' },
    { name: 'Food Items Management', path: '/food-items', icon: <UtensilsCrossed size={32} />, color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-100' },
    { name: 'Quotation History', path: '/quotations', icon: <FileText size={32} />, color: 'bg-teal-50 text-teal-600', borderColor: 'border-teal-100' },
    { name: 'Invoice History', path: '/invoices', icon: <Receipt size={32} />, color: 'bg-rose-50 text-rose-600', borderColor: 'border-rose-100' },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in font-sans">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">Welcome Back!</h1>
        <p className="text-gray-500 mt-2">Manage your catering events and generating invoices seamlessly.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            to={card.path}
            className={`flex items-center p-6 border ${card.borderColor} bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}
          >
            <div className={`p-4 rounded-2xl ${card.color} mr-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{card.name}</h3>
              <p className="text-sm text-gray-400 mt-1 flex items-center font-medium">
                Click to open <span className="ml-1 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
