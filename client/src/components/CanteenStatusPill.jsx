import { useCanteen } from '../context/CanteenContext';

const CanteenStatusPill = () => {
  const { isOpen, loading } = useCanteen();
  if (loading) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
      title={isOpen ? 'Canteen is open' : 'Canteen is closed'}
    >
      <span className="text-[10px]">{isOpen ? '🟢' : '🔴'}</span>
      {isOpen ? 'OPEN' : 'CLOSED'}
    </span>
  );
};

export default CanteenStatusPill;

