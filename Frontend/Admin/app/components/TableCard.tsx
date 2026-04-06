interface TableCardProps {
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  currentOrder?: string;
  onClick?: () => void;
}

export function TableCard({ number, status, capacity, currentOrder, onClick }: TableCardProps) {
  const statusColors = {
    available: 'bg-brand/10 border-brand/35',
    occupied: 'bg-red-50 border-red-600',
    reserved: 'bg-yellow-50 border-yellow-500',
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${statusColors[status]}`}
    >
      {/* Table Icon */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-2">
          <span className="text-2xl">🪑</span>
        </div>
        <h3 className="font-bold text-lg">Table {number}</h3>
      </div>

      {/* Details */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-700">Capacity: {capacity} people</p>
        <span className={`inline-block px-4 py-1 rounded-full text-xs font-medium capitalize ${
          status === 'available'
            ? 'bg-brand text-brand-foreground'
            : status === 'occupied'
              ? 'bg-red-600 text-white'
              : 'bg-yellow-400 text-neutral-900'
        }`}>
          {status}
        </span>
        {currentOrder && (
          <p className="text-xs font-medium mt-2 text-gray-700">Order: {currentOrder}</p>
        )}
      </div>
    </div>
  );
}