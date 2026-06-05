import { X } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../../utils/currency';

interface PaymentModalProps {
  orderId: string;
  table: string;
  total: number;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

const paymentMethods = [
  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'e-wallet', label: 'E-Wallet', icon: '📱' },
];

export function PaymentModal({ orderId, table, total, onClose, onSubmit }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [amountPaid, setAmountPaid] = useState(total.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const change = parseFloat(amountPaid) - total;
    
    onSubmit({
      orderId,
      paymentMethod,
      amountPaid: parseFloat(amountPaid),
      change: change > 0 ? change : 0,
    });
  };

  const calculatedChange = parseFloat(amountPaid || '0') - total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Process Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Table:</span>
            <span className="font-medium">{table}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-xl font-bold text-amber-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === method.id
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{method.icon}</div>
                  <div className="text-xs font-medium">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-amber-400 hover:bg-amber-500 rounded-lg font-medium transition-colors"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}