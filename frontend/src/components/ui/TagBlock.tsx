// frontend/src/components/ui/TagBlock.tsx
"use client"; // ← make this a client component since it has interactive state
import { useState } from "react";

interface TagBlockProps {
  /** 
   * Called when the user clicks “Upload.” 
   * You get back the object { [categoryName]: string[] } or however you shape it.
   */
  onUpload: (selectedTags: Record<string, string[]>) => void;
}

export default function TagBlock({ onUpload }: TagBlockProps) {
  // 1. Define your five categories:
  //    e.g. “Environment,” “Mood,” “Activity,” “Intensity,” “Other” 
  //    Each category has its own list of tag‐values.
  const categories: Record<string, string[]> = {
    Environment: ["Indoor", "Outdoor", "Lab", "Field", "Office"],
    Mood: ["Relaxed", "Stressed", "Alert", "Fatigued", "Neutral"],
    Activity: ["Sitting", "Walking", "Running", "Cycling", "LyingDown"],
    Intensity: ["Low", "Medium", "High", "Very High", "Unknown"],
    Other: ["Baseline", "Recovery", "Post-Test", "Calibration", "QC"],
  };

  // 2. Keep track of which tags are checked in each category:
  //    We'll use a Record<categoryName, arrayOfSelectedTagStrings>.
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    // initialize empty arrays for each category
    const init: Record<string, string[]> = {};
    Object.keys(categories).forEach((cat) => {
      init[cat] = [];
    });
    return init;
  });

  // 3. A checkbox‐toggle handler
  function toggleTag(category: string, tag: string) {
    setSelected((prev) => {
      const prevList = prev[category] || [];
      const isAlready = prevList.includes(tag);

      // Make a shallow copy, update that category’s array:
      const newCatList = isAlready
        ? prevList.filter((t) => t !== tag)
        : [...prevList, tag];

      return {
        ...prev,
        [category]: newCatList,
      };
    });
  }

  // 4. When “Upload” is clicked, call onUpload(selected)
  function handleUploadClick() {
    console.log("▶ TagBlock: upload clicked, selected =", selected);
    onUpload(selected);
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Add Tags to Current Measurement</h2>
      {Object.entries(categories).map(([category, tagList]) => (
        <fieldset key={category} className="mb-4">
          <legend className="font-medium">{category}</legend>
          <div className="flex flex-wrap gap-2 mt-1">
            {tagList.map((tag) => {
              const isChecked = selected[category].includes(tag);
              return (
                <label
                  key={tag}
                  className={`flex items-center px-2 py-1 border rounded ${
                    isChecked ? "bg-blue-100 border-blue-300" : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={isChecked}
                    onChange={() => toggleTag(category, tag)}
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleUploadClick}
      >
        Upload Tags
      </button>
    </div>
  );
}
