import React from "react";
import { Receipt, Calendar, Building2, Mail, Phone } from "lucide-react";

interface ReceiptItem {
  description: string;
  quantity: number;
  rate: string;
  amount: string;
}

interface ReceiptData {
  referenceId: string;
  date: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerOrganization?: string;
  items: ReceiptItem[];
  subtotal: string;
  discount: string;
  discountType: "percentage" | "fixed";
  total: string;
  currency: string;
}

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto print:shadow-none print:max-w-full">
        {/* Header - Hide on print */}
        <div className="flex justify-between items-center p-6 border-b print:hidden">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-oha_primary" size={28} />
            Receipt Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Receipt Content - Optimized for printing */}
        <div className="p-8 print:p-12" id="receipt-content">
          {/* Company Header */}
          <div className="text-center mb-8 border-b-2 border-oha_primary pb-6">
            <h1 className="text-3xl font-bold text-oha_primary mb-2">OneHive Africa</h1>
            <p className="text-gray-600">Sustainable Beekeeping Solutions</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail size={14} /> contact@onehiveafrica.com
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} /> +233 XXX XXX XXX
              </span>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Receipt Details</h3>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <Receipt size={16} className="text-gray-400" />
                  <span className="font-mono text-sm">{data.referenceId}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">{new Date(data.date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Buyer Information</h3>
              <div className="space-y-1">
                <p className="font-semibold">{data.buyerName}</p>
                {data.buyerOrganization && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={14} />
                    {data.buyerOrganization}
                  </p>
                )}
                {data.buyerEmail && (
                  <p className="text-sm text-gray-600">{data.buyerEmail}</p>
                )}
                {data.buyerPhone && (
                  <p className="text-sm text-gray-600">{data.buyerPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-sm font-bold text-gray-600">Description</th>
                <th className="text-right py-3 text-sm font-bold text-gray-600">Quantity</th>
                <th className="text-right py-3 text-sm font-bold text-gray-600">Rate</th>
                <th className="text-right py-3 text-sm font-bold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 text-gray-800">{item.description}</td>
                  <td className="text-right py-3 text-gray-800">{item.quantity}</td>
                  <td className="text-right py-3 text-gray-600">{item.rate}</td>
                  <td className="text-right py-3 font-semibold">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{data.currency} {data.subtotal}</span>
              </div>
              {parseFloat(data.discount.split(' ')[0]) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span className="text-red-600">- {data.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t-2 border-gray-300">
                <span>Total:</span>
                <span className="text-oha_primary">{data.currency} {data.total}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-6">
            <p className="mb-2">Thank you for your business!</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </div>

        {/* Action Buttons - Hide on print */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-oha_primary text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Receipt size={18} />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
