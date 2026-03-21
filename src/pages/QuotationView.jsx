import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toWords } from 'number-to-words';
import api from '../utils/api';

const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    api.get(`/quotations/${id}`)
       .then(res => setQuotation(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = () => {
    // Rely on browser's built in high quality PDF export
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading quotation details...</div>;
  if (!quotation) return <div className="p-8 text-center text-red-500">Quotation not found.</div>;

  const event = quotation.eventId;
  const amountInWords = toWords(quotation.grandTotal || 0).replace(/-/g, ' ').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 bg-gray-50 px-4 py-2 rounded-xl transition-colors font-medium">
          <ArrowLeft size={18} className="mr-2"/> Back
        </button>
        <button onClick={handleDownloadPdf} className="flex items-center text-white bg-[#7e3f3f] hover:bg-[#6b3535] px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-900/10 transition-colors">
          <Download size={18} className="mr-2"/> Download Quotation PDF
        </button>
      </div>

      {/* Printable Area */}
      <div className="bg-white shadow-xl overflow-x-auto flex justify-center print-content">
        <div ref={printRef} className="w-[800px] min-h-[1131px] bg-white p-12 text-black relative" style={{ fontFamily: 'Times New Roman, serif' }}>
          
          <div className="text-center mb-10 border-b-4 border-[#7e3f3f]/20 pb-6">
            <h1 className="text-4xl font-extrabold text-[#7e3f3f] tracking-widest uppercase mb-1">Balaji Perfect Caters</h1>
            <p className="text-sm font-semibold text-gray-600 tracking-widest uppercase">High Class Veg & Non Veg Caterers</p>
          </div>

          <div className="flex justify-between items-end mb-8 font-medium">
            <div className="space-y-1 text-lg">
              <p><span className="font-bold">Party Name:</span> {event.partyName}</p>
              <p><span className="font-bold">Event Venue:</span> {event.eventVenue}</p>
            </div>
            <div className="text-lg">
              <p><span className="font-bold">Date:</span> {new Date(event.eventDate).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div className="space-y-10">
            {event.sessions.map((session, sIdx) => (
              <div key={session._id || sIdx}>
                <div className="mb-2 text-lg">
                  <p className="font-bold text-xl mb-1">Session {sIdx + 1} – {session.sessionName}</p>
                  <p><span className="font-bold">Time:</span> {session.time} &nbsp;&nbsp;|&nbsp;&nbsp; <span className="font-bold">Location:</span> {session.location}</p>
                  <p className="font-bold">Total Count: {session.numberOfPersons} Persons <span className="text-base font-normal">(NV – {event.nonVegCount} Nos | Veg – {event.vegCount} Nos)</span></p>
                </div>
                
                <table className="w-full text-left border-collapse border border-gray-400 mb-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 p-2 font-bold w-12 text-center">S.No</th>
                      <th className="border border-gray-400 p-2 font-bold">Particulars</th>
                      <th className="border border-gray-400 p-2 font-bold w-24 text-center">Quantity</th>
                      <th className="border border-gray-400 p-2 font-bold w-24 text-center">Rate (Rs.)</th>
                      <th className="border border-gray-400 p-2 font-bold w-28 text-center">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.items.map((item, iIdx) => (
                      <tr key={item._id || iIdx}>
                        <td className="border border-gray-400 p-2 text-center">{iIdx + 1}</td>
                        <td className="border border-gray-400 p-2">{item.name}</td>
                        <td className="border border-gray-400 p-2 text-center">{item.quantity} Nos</td>
                        <td className="border border-gray-400 p-2 text-center">{item.rate}/-</td>
                        <td className="border border-gray-400 p-2 text-center">{item.amount}/-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="font-bold text-lg text-right border-gray-400 mb-8">Subtotal (Session {sIdx + 1}): Rs. {session.subtotal}/-</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold uppercase mb-2 border-b-2 border-gray-300 pb-1 inline-block">Grand Total</h3>
            <table className="w-full text-left border-collapse border border-gray-400 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 font-bold text-lg">Description</th>
                  <th className="border border-gray-400 p-2 font-bold w-48 text-right text-lg">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {event.sessions.map((session, sIdx) => (
                  <tr key={sIdx}>
                    <td className="border border-gray-400 p-2 font-medium">{session.sessionName}</td>
                    <td className="border border-gray-400 p-2 text-right">{session.subtotal}/-</td>
                  </tr>
                ))}
                {(event.cgstAmount > 0 || event.sgstAmount > 0) && (
                  <>
                    <tr className="bg-white">
                      <td className="border border-gray-400 p-2 font-bold text-right pt-4">Subtotal</td>
                      <td className="border border-gray-400 p-2 font-bold text-right pt-4">Rs. {event.subTotal}/-</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-400 p-2 font-medium text-right">CGST (2.75%)</td>
                      <td className="border border-gray-400 p-2 font-medium text-right">Rs. {event.cgstAmount}/-</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-400 p-2 font-medium text-right">SGST (2.75%)</td>
                      <td className="border border-gray-400 p-2 font-medium text-right">Rs. {event.sgstAmount}/-</td>
                    </tr>
                  </>
                )}
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold text-xl text-right">Grand Total</td>
                  <td className="border border-gray-400 p-2 font-bold text-xl text-right text-[#7e3f3f]">Rs. {quotation.grandTotal}/-</td>
                </tr>
              </tbody>
            </table>
            
            <p className="font-bold text-lg mt-6 mb-16 italic">
              Amount in Words: <span className="font-normal underline decoration-dashed underline-offset-4 capitalize">Rupees {amountInWords} Only.</span>
            </p>
          </div>

          <div className="absolute bottom-16 right-16 text-right">
            <p className="font-medium text-lg mb-8">With Regards,</p>
            <p className="font-bold text-xl">Rtn Balaji S</p>
            <p className="text-lg">Balaji Perfect Caters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationView;
