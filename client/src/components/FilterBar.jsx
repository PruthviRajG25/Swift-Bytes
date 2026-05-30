const categoryIcons = {
  All: '🍱',
  Breakfast: '🌅',
  Lunch: '🍚',
  Snacks: '🥪',
  Beverages: '🥤',
  Rice: '🍚',
  Drinks: '🥤',
};

const FilterBar = ({ categories, active, onChange }) => {
  const chips = ['All', ...categories.filter((c) => c !== 'All')];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((cat) => {
        const isActive = (cat === 'All' && !active) || active === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat === 'All' ? '' : cat)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 transition ${
              isActive
                ? 'border-primary bg-primary text-white'
                : 'border-cream bg-white text-neutral-600 hover:border-primary/40'
            }`}
          >
            <span className="text-lg">{categoryIcons[cat] || '🍽️'}</span>
            <span className="text-[10px] font-semibold">{cat}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
