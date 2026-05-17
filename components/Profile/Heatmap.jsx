import React, { useState } from 'react';
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ActivityHeatmap = ({
    heatMapData,
    platform,
    onPlatformChange,
    platformOptions,
}) => {
    const [timeOffset, setTimeOffset] = useState(0);

    // Calculate date ranges (9 months)
    const calculateDateRange = () => {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() - (9 * timeOffset));
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 9);
        return { startDate, endDate };
    };

    const { startDate, endDate } = calculateDateRange();

    // Transform data to match calendar heatmap format
    const transformedData = heatMapData.map((item) => ({
        date: item.date,
        count: item.count,
    }));

    // Calculate total submissions
    const totalSubmissions = heatMapData.reduce((sum, item) => sum + item.count, 0);

    const monthLabels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Dynamic color strength based on dataset
    const maxCount = Math.max(...heatMapData.map((d) => d.count), 1);

    const getIntensityLevel = (count) => {
        if (!count || count === 0) return 0;
        // ratio from 0..1
        const ratio = count / maxCount;
        const level = Math.ceil(ratio * 4);
        return Math.min(Math.max(level, 1), 4);
    };

    const getClassForValue = (value) => {
        if (!value || value.count === 0) return "color-empty";
        const level = getIntensityLevel(value.count);
        return `color-scale-${level}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handlePrevious = () => {
        setTimeOffset(prev => {
            const candidateOffset = prev + 1;
            const candidateEnd = new Date();
            candidateEnd.setMonth(candidateEnd.getMonth() - (9 * candidateOffset));

            const earliestAllowed = new Date();
            earliestAllowed.setFullYear(earliestAllowed.getFullYear() - 4);

            // Prevent going earlier than 4 years before today
            if (candidateEnd < earliestAllowed) return prev;
            return candidateOffset;
        });
    };

    const handleNext = () => {
        setTimeOffset(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="w-full py-5 sm:py-6 px-5 sm:px-7 rounded-xl glass-card">
            <style>{`
        .react-calendar-heatmap text {
          font-size: 11px;
          fill: #71717a;
          font-family: ui-monospace, monospace;
        }

        .react-calendar-heatmap .color-empty {
          fill: #18181b;
        }

        .react-calendar-heatmap .color-scale-1 {
          fill: #134e4a;
        }

        .react-calendar-heatmap .color-scale-2 {
          fill: #14532d;
        }

        .react-calendar-heatmap .color-scale-3 {
          fill: #15803d;
        }

        .react-calendar-heatmap .color-scale-4 {
          fill: #22c55e;
        }

        .react-calendar-heatmap rect {
          rx: 2;
          stroke: #27272a;
          stroke-width: 1;
          transition: all 0.2s ease;
        }

        .react-calendar-heatmap rect:hover {
          stroke: #22c55e;
          stroke-width: 2;
          opacity: 0.9;
        }
      `}</style>

            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-6 bg-matrix-200" />
                            <h3 className="text-lg font-semibold text-white font-mono">Activity Heatmap</h3>
                        </div>
                        <span className="text-sm text-zinc-400 font-mono">
                            {totalSubmissions} submissions
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {platformOptions?.length ? (
                            <select
                                value={platform}
                                onChange={(e) => onPlatformChange?.(e.target.value)}
                                className="appearance-none bg-zinc-950/80 border border-zinc-700/60 text-zinc-100 text-sm font-mono rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-matrix-200 focus:ring-1 focus:ring-matrix-200/40 shadow-inner hover:border-matrix-200/40 transition-colors"
                                style={{
                                    colorScheme: "dark",
                                    backgroundImage:
                                        "linear-gradient(45deg, transparent 50%, rgba(34, 197, 94, 0.9) 50%), linear-gradient(135deg, rgba(34, 197, 94, 0.9) 50%, transparent 50%)",
                                    backgroundPosition:
                                        "calc(100% - 14px) 55%, calc(100% - 9px) 55%",
                                    backgroundSize: "5px 5px, 5px 5px",
                                    backgroundRepeat: "no-repeat",
                                }}
                            >
                                {platformOptions.map((opt) => (
                                    <option
                                        key={opt.value}
                                        value={opt.value}
                                        className="bg-zinc-900 text-zinc-100"
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : null}
                        <span className="text-sm font-medium text-zinc-400 font-mono">
                            {startDate.getFullYear() === endDate.getFullYear()
                                ? endDate.getFullYear()
                                : `${startDate.getFullYear()} - ${endDate.getFullYear()}`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevious}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-matrix-200 hover:bg-zinc-800/50 transition-all"
                                title="Previous period"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-matrix-200 hover:bg-zinc-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                                disabled={timeOffset === 0}
                                title="Next period"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="w-full overflow-x-auto bg-black/30 p-3 sm:p-4 rounded-lg border border-white/10">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        values={transformedData}
                        classForValue={getClassForValue}
                        tooltipDataAttrs={(value) => ({
                            "data-tooltip-id": "heatmap-tooltip",
                            "data-tooltip-content": value && value.date
                                ? `${formatDate(value.date)}: ${value.count} submission${value.count !== 1 ? 's' : ''}`
                                : 'No submissions',
                        })}
                        showWeekdayLabels={true}
                        weekdayLabels={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
                        monthLabels={monthLabels}
                        gutterSize={3}
                    />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>Less</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-zinc-900 border border-zinc-700"></div>
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#134e4a' }}></div>
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#14532d' }}></div>
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#15803d' }}></div>
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }}></div>
                    </div>
                    <span>More</span>
                </div>

                <Tooltip
                    id="heatmap-tooltip"
                    style={{
                        backgroundColor: 'rgba(24, 24, 27, 0.98)',
                        color: '#22c55e',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: 'ui-monospace, monospace',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                />
            </div>
        </div>
    );
};

export default ActivityHeatmap;
