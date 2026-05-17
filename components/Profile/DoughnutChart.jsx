"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const DoughnutChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const isLeetCode = Array.isArray(data);
  const isTotalOnly =
    data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "totalOnly");
  let easy = 0,
    medium = 0,
    hard = 0,
    total = 0;

  if (isLeetCode && data?.length >= 4) {
    // LeetCode structure
    total = data[0]?.count || 0;
    easy = data[1]?.count || 0;
    medium = data[2]?.count || 0;
    hard = data[3]?.count || 0;
  } else if (isTotalOnly) {
    total = Number(data.totalOnly) || 0;
    easy = total;
    medium = 0;
    hard = 0;
  } else if (data && typeof data === "object") {
    // Codeforces structure
    easy = data.fundamental?.reduce(
      (sum, topic) => sum + (topic.problemsSolved || 0),
      0
    );
    medium = data.intermediate?.reduce(
      (sum, topic) => sum + (topic.problemsSolved || 0),
      0
    );
    hard = data.advanced?.reduce(
      (sum, topic) => sum + (topic.problemsSolved || 0),
      0
    );
    total = easy + medium + hard;
  }

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Easy", "Medium", "Hard"],
        datasets: [
          {
            label: "DSA Progress",
            data: [easy, medium, hard],
            backgroundColor: ["#28a745", "#fd7e14", "#dc3545"], // Emerald variations
            borderColor: "#18181b", // Dark zinc border
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        elements: { arc: { borderWidth: 2 } },
        cutout: "70%",
      },
    });

    return () => chartInstanceRef.current?.destroy();
  }, [easy, medium, hard]);

  return (
    <>
      <div className="relative w-fit h-fit">
        <canvas ref={chartRef} width="30" height="30" className="doughnutPie" />
        <p className="absolute inset-0 flex justify-center items-center text-3xl font-mono font-bold text-matrix-200">
          {total}
        </p>
      </div>
      <div className="w-full flex flex-col justify-center gap-2">
        {isTotalOnly ? (
          <div className="flex justify-between w-full bg-zinc-900/50 border border-white/10 px-3 py-2 rounded-md hover:border-matrix-200/40 transition-all">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#28a745" }} />
              <p className="text-sm text-zinc-300 font-medium">Total</p>
            </div>
            <p className="text-sm font-mono font-bold text-white">{total}</p>
          </div>
        ) : (
          [
            { label: "Easy", value: easy, color: "#28a745" },
            { label: "Medium", value: medium, color: "#fd7e14" },
            { label: "Hard", value: hard, color: "#dc3545" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex justify-between w-full bg-zinc-900/50 border border-white/10 px-3 py-2 rounded-md hover:border-matrix-200/40 transition-all"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-sm text-zinc-300 font-medium">{item.label}</p>
              </div>
              <p className="text-sm font-mono font-bold text-white">{item.value}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default DoughnutChart;
