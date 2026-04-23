interface TableCardProps {
  number: string;
  status: 'available' | 'occupied';
  capacity: number;
  currentOrder?: string;
  onClick?: () => void;
}

export function TableCard({ number, status, capacity, currentOrder, onClick }: TableCardProps) {
  const statusColors = {
    available: 'bg-[#D5F5E3] border-[#36774F]',
    occupied: 'bg-[#FFE8E8] border-[#F2612C]',
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
            ? 'bg-[#36774F] text-white' 
            : 'bg-[#F2612C] text-white'
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