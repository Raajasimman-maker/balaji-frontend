// Sidebar collapsible layout with modern UI
import { useState, useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, UtensilsCrossed, CalendarPlus, FileText, Receipt, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Event Registration', path: '/events/new', icon: <CalendarPlus size={20} /> },
    { name: 'Food Items', path: '/food-items', icon: <UtensilsCrossed size={20} /> },
    { name: 'Quotations', path: '/quotations', icon: <FileText size={20} /> },
    { name: 'Invoices', path: '/invoices', icon: <Receipt size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <span className="text-xl font-extrabold text-[#7e3f3f] tracking-tight">Balaji Caters</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center px-4 py-3 text-gray-600 rounded-xl hover:bg-[#fff5f5] hover:text-[#7e3f3f] transition-all duration-200 group"
            >
              <span className="mr-3 text-gray-400 group-hover:text-[#7e3f3f] transition-colors">{item.icon}</span>
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <LogOut size={20} className="mr-3 text-gray-400 group-hover:text-gray-600" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100 lg:hidden shadow-sm z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          <span className="text-lg font-extrabold text-[#7e3f3f] tracking-tight">Balaji Caters</span>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
