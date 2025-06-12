import React, { useState, useEffect } from "react";

export interface TagInputsProps {
  categories: string[];
  allOptions: Record<string, string[]>;
  onApply: (tags: Record<string, string[]>) => void;
}

export default function TagInputs({ categories, allOptions, onApply }: TagInputsProps) {
  const [values, setValues] = useState<Record<string, string>>( 
    Object.fromEntries(categories.map(c => [c, ""])) 
  );
  const [sugs, setSugs] = useState<Record<string, string[]>>( 
    Object.fromEntries(categories.map(c => [c, []])) 
  );
  const [focusedCat, setFocusedCat] = useState<string | null>(null);

  // Recompute suggestions when values change
  useEffect(() => {
    const newS: Record<string, string[]> = {};
    categories.forEach(cat => {
      const v = values[cat].toLowerCase();
      newS[cat] = allOptions[cat]
        .filter(opt => opt.toLowerCase().includes(v))
        .slice(0, 5);
    });
    setSugs(newS);
  }, [values, categories, allOptions]);

  const handleApply = () => {
    const out: Record<string, string[]> = {};
    categories.forEach(cat => {
      const val = values[cat].trim();
      out[cat] = val ? [val] : [];
    });
    onApply(out);
  };

  return (
    <>
      {categories.map(cat => (
        <div key={cat} className="relative mb-4">
          <label className="block font-medium mb-1">{cat}</label>
          <input
            type="text"
            value={values[cat]}
            onChange={e => setValues(v => ({ ...v, [cat]: e.target.value }))}
            onFocus={() => setFocusedCat(cat)}
            onBlur={() => {
              setTimeout(() => {
                if (focusedCat === cat) setFocusedCat(null);
                setSugs(s => ({ ...s, [cat]: [] }));
              }, 100);
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setSugs(s => ({ ...s, [cat]: [] }));
              }
            }}
            placeholder={`Enter ${cat}`}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />

          {focusedCat === cat && sugs[cat].length > 0 && values[cat] && (
            <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-40 overflow-auto">
              {sugs[cat].map(opt => (
                <li
                  key={opt}
                  onMouseDown={() => {
                    setValues(v => ({ ...v, [cat]: opt }));
                    setSugs(s => ({ ...s, [cat]: [] }));
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <button
        onClick={handleApply}
        className= "w-full rounded bg-black text-white py-2 px-6 border-2 border-black hover:text-black transition-all duration-300"
      >
        Apply Tags
      </button>
    </>
  );
}
