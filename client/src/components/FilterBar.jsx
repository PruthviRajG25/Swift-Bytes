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
            className={`shrink-0 rounded-lg px-3 py-1 text-sm font-medium transition ${
              isActive
                ? 'bg-primary text-white'
                : 'border border-cream bg-white text-neutral-700 hover:bg-surface'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
