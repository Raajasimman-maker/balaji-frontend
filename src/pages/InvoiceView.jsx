import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toWords } from 'number-to-words';
import api from '../utils/api';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    api.get(`/invoices/${id}`)
       .then(res => setInvoice(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading invoice details...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found.</div>;

  const amountInWords = toWords(invoice.currentBalance || 0).replace(/-/g, ' ').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 bg-gray-50 px-4 py-2 rounded-xl transition-colors font-medium">
          <ArrowLeft size={18} className="mr-2"/> Back
        </button>
        <button onClick={handleDownloadPdf} className="flex items-center text-white bg-[#7e3f3f] hover:bg-[#6b3535] px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-900/10 transition-colors">
          <Download size={18} className="mr-2"/> Download Invoice PDF
        </button>
      </div>

      <div className="bg-white shadow-xl overflow-x-auto flex justify-center print-content">
        <div ref={printRef} className="w-[800px] min-h-[1131px] bg-white text-black relative flex flex-col font-sans border-t-[10px] border-[#d4af37]">
          
          <div className="p-10 pb-0">
            <div className="flex justify-between items-start mb-10">
              <div className="flex-1">
                <h1 className="text-4xl font-extrabold text-[#7e3f3f] tracking-tight mb-2">Balaji Perfect Caters</h1>
                <p className="text-sm font-bold text-gray-700 mb-1">GSTIN: <span className="font-normal text-gray-600">33CADPB6649D1Z3</span></p>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="text-yellow-600 mr-2 text-lg">📍</span> 
                  Raaj Iswariyam, Cantonment, Trichy, Tamil Nadu 620001
                </p>
              </div>
              <div className="text-right ml-8">
                <h2 className="text-3xl font-extrabold text-[#7e3f3f] tracking-widest uppercase mb-4">Bill of Supply</h2>
                <div className="bg-[#fdf9f1] border border-[#f3e6c0] p-4 rounded-xl text-left inline-block">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <p className="text-sm font-bold text-gray-700">Invoice No.</p>
                    <p className="text-sm font-bold text-[#7e3f3f]">{invoice.invoiceNumber}</p>
                    <p className="text-sm font-bold text-gray-700">Invoice Date</p>
                    <p className="text-sm font-medium text-gray-800">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#7e3f3f]"></div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                <p className="font-bold text-lg text-gray-900 mb-1">{invoice.billTo}</p>
                <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Mobile:</span> {invoice.mobileNumber}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Place of Supply:</span> {invoice.placeOfSupply}</p>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden border-[#f3e6c0] mb-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#fdf9f1] border-b border-[#f3e6c0]">
                    <th className="p-4 font-bold text-gray-700">No</th>
                    <th className="p-4 font-bold text-gray-700">Items</th>
                    <th className="p-4 font-bold text-gray-700 text-center">Qty.</th>
                    <th className="p-4 font-bold text-gray-700 text-center">Rate</th>
                    <th className="p-4 font-bold text-gray-700 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-4 text-gray-600 font-medium">{idx + 1}</td>
                      <td className="p-4 text-gray-800 font-bold">{item.itemDescription}</td>
                      <td className="p-4 text-gray-600 text-center">{item.quantity}</td>
                      <td className="p-4 text-gray-600 text-center">₹{item.rate}</td>
                      <td className="p-4 text-gray-900 font-bold text-right">₹{item.amount}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#fcf8ef]">
                    <td colSpan="4" className="p-4 font-bold text-gray-800 text-right">SUBTOTAL</td>
                    <td className="p-4 font-bold text-gray-900 text-right border-t">₹{invoice.subtotal}</td>
                  </tr>
                  <tr className="bg-[#fcf8ef]">
                    <td colSpan="4" className="px-4 py-2 font-semibold text-gray-600 text-right">CGST ({invoice.cgstRate}%)</td>
                    <td className="px-4 py-2 font-medium text-gray-800 text-right text-sm">₹{invoice.cgstAmount?.toFixed(2) || 0}</td>
                  </tr>
                  <tr className="bg-[#fcf8ef]">
                    <td colSpan="4" className="px-4 py-2 font-semibold text-gray-600 text-right">SGST ({invoice.sgstRate}%)</td>
                    <td className="px-4 py-2 font-medium text-gray-800 text-right text-sm border-b">₹{invoice.sgstAmount?.toFixed(2) || 0}</td>
                  </tr>
                  <tr className="bg-[#fdf3ec]">
                    <td colSpan="4" className="p-4 font-extrabold text-[#7e3f3f] text-right">GRAND TOTAL</td>
                    <td className="p-4 font-extrabold text-[#7e3f3f] text-right text-xl">₹{invoice.grandTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-5 gap-8 border-t border-gray-200 mt-auto pt-8">
              <div className="col-span-3">
                <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Bank Details</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <p className="font-semibold text-gray-600">Name:</p><p className="col-span-2 text-gray-900 font-bold">Balaji S</p>
                  <p className="font-semibold text-gray-600">IFSC:</p><p className="col-span-2 text-gray-900 font-bold">SIBL0000082</p>
                  <p className="font-semibold text-gray-600">Account No:</p><p className="col-span-2 text-gray-900 font-bold tracking-wider">0082073000002485</p>
                  <p className="font-semibold text-gray-600">Bank Name:</p><p className="col-span-2 text-gray-900 font-bold">South Indian Bank, TIRUCHIRAPALLI</p>
                </div>
                
                <div className="mt-6 flex items-center border border-[#d4af37]/30 bg-[#fdfaf2] rounded-xl p-4">
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 mr-4 flex items-center justify-center p-1 border">
                    {/* Fallback to Google Charts which explicitly returns CORS headers */}
                    <img src={`https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl=upi://pay?pa=trichybalaji054-2@okaxis&pn=BalajiS&cu=INR`} crossOrigin="anonymous" alt="QR Code" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">Payment QR Code</p>
                    <p className="text-xs text-gray-500 mb-1">Scan to pay with any UPI App</p>
                    <p className="text-sm font-semibold tracking-wide text-[#7e3f3f]">UPI ID: trichybalaji054-2@okaxis</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="bg-white rounded-2xl mb-6">
                  <div className="flex justify-between py-2 border-b-2 border-gray-200">
                    <p className="font-bold text-gray-700 text-lg">Total Amount</p>
                    <p className="font-extrabold text-[#7e3f3f] text-lg">₹ {invoice.grandTotal}</p>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                    <p className="text-gray-600">Received Amount</p>
                    <p className="font-medium text-gray-800">₹ {invoice.receivedAmount || 0}</p>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                    <p className="text-gray-600">Previous Balance</p>
                    <p className="font-medium text-gray-800">₹ {invoice.previousBalance || 0}</p>
                  </div>
                  <div className="flex justify-between py-2 mt-1">
                    <p className="font-bold text-gray-800">Current Balance</p>
                    <p className="font-extrabold text-red-600 text-xl tracking-tight">₹ {invoice.currentBalance}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="font-bold text-sm text-gray-600 mb-1">Total Amount (in words)</p>
              <p className="font-medium text-gray-800 bg-gray-50 py-2 px-4 rounded-lg inline-block italic capitalize border border-gray-100">
                {amountInWords} Rupees Only
              </p>
            </div>

            <div className="flex justify-end mt-12 pr-4 pb-8">
              <div className="text-center w-64 border border-gray-200 rounded-2xl p-6 bg-gray-50/50">
                <div className="h-16 mb-2 mt-2" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '28px' }}>
                  Balaji S
                </div>
                <div className="w-full border-t-2 border-gray-300 mt-2"></div>
                <p className="text-sm font-bold text-gray-800 mt-3 uppercase tracking-wider">Signature</p>
                <p className="text-xs font-semibold text-gray-500 mt-1">Balaji Perfect Caters</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
