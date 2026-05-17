import React, { useState } from "react";

const TopicAnalysis = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Merge all levels (advanced, intermediate, fundamental) into a single array
  const mergedTopics = [
    ...(data.advanced || []),
    ...(data.intermediate || []),
    ...(data.fundamental || []),
  ];

  // Determine how many items to display based on the expanded state
  const displayedItems = isExpanded ? mergedTopics : mergedTopics.slice(0, 15);

  return (
    <div className="flex flex-col gap-4 justify-center w-full">
      <div className="flex gap-3 flex-wrap text-sm">
        {displayedItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-center bg-zinc-900/50 border border-white/10 px-4 py-2 rounded-lg hover:border-matrix-200/40 transition-all">
            <span className="text-zinc-300 font-medium">
              {item.tagName}
            </span>
            <span className="text-matrix-200 font-mono font-bold">× {item.problemsSolved}</span>
          </div>
        ))}
      </div>
      {mergedTopics.length > 15 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-matrix-200 hover:text-matrix-100 mt-2 text-sm font-mono font-medium transition-colors self-start"
        >
          {isExpanded ? "Show Less ↑" : "Show More ↓"}
        </button>
      )}
    </div>
  );
};

export default TopicAnalysis;
