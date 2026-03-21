import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FoodItems from './pages/FoodItems';

import EventRegistration from './pages/EventRegistration';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import InvoiceGeneration from './pages/InvoiceGeneration';
import QuotationView from './pages/QuotationView';
import InvoiceView from './pages/InvoiceView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="food-items" element={<FoodItems />} />
          <Route path="events/new" element={<EventRegistration />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="quotations/:id" element={<QuotationView />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceGeneration />} />
          <Route path="invoices/:id" element={<InvoiceView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
