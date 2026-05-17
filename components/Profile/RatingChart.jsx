"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";

const RatingChart = ({ data }) => {
  const [lcDates, setLcDates] = useState([]);
  const [lcRatings, setLcRatings] = useState([]);
  const [cfDates, setCfDates] = useState([]);
  const [cfRatings, setCfRatings] = useState([]);
  const [ccDates, setCcDates] = useState([]);
  const [ccRatings, setCcRatings] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.contestsData?.leetCodeContestsData?.length > 0) {
      const sortedLcData = data.contestsData.leetCodeContestsData
        .slice()
        .sort(
        (a, b) => a.startTime - b.startTime
      );
      setLcDates(
        sortedLcData.map((item) => formatDate(item.contest.startTime))
      );
      setLcRatings(sortedLcData.map((item) => item.rating));
    } else {
      setLcDates([]);
      setLcRatings([]);
    }

    if (data.contestsData?.codeForcesContestsData?.length > 0) {
      const sortedCfData = data.contestsData.codeForcesContestsData
        .slice()
        .sort(
        (a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds
      );
      setCfDates(
        sortedCfData.map((item) => formatDate(item.ratingUpdateTimeSeconds))
      );
      setCfRatings(sortedCfData.map((item) => item.newRating));
    } else {
      setCfDates([]);
      setCfRatings([]);
    }

    if (data.contestsData?.codeChefContestsData?.length > 0) {
      const sortedCcData = data.contestsData.codeChefContestsData
        .slice()
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
      setCcDates(
        sortedCcData.map((item) =>
          formatDate(Math.floor(Date.parse(item.date) / 1000))
        )
      );
      setCcRatings(sortedCcData.map((item) => item.ratingAfter));
    } else {
      setCcDates([]);
      setCcRatings([]);
    }
  }, [data]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    // console.log(chartRef.current);

    if (lcRatings.length > 0 || cfRatings.length > 0 || ccRatings.length > 0) {
      const ctx = chartRef.current.getContext("2d");

      const lcGradient = ctx.createLinearGradient(0, 0, 0, 400);
      lcGradient.addColorStop(0, "rgba(34, 197, 94, 0.7)");
      lcGradient.addColorStop(1, "rgba(34, 197, 94, 0)");

      const cfGradient = ctx.createLinearGradient(0, 0, 0, 400);
      cfGradient.addColorStop(0, "rgba(16, 185, 129, 0.7)");
      cfGradient.addColorStop(1, "rgba(16, 185, 129, 0)");

      const ccGradient = ctx.createLinearGradient(0, 0, 0, 400);
      ccGradient.addColorStop(0, "rgba(234, 179, 8, 0.7)");
      ccGradient.addColorStop(1, "rgba(234, 179, 8, 0)");

      const labels =
        lcDates.length >= cfDates.length && lcDates.length >= ccDates.length
          ? lcDates
          : cfDates.length >= lcDates.length && cfDates.length >= ccDates.length
            ? cfDates
            : ccDates;

      const chartData = {
        labels,
        datasets: [
          lcRatings.length > 0 && {
            label: "LeetCode Rating",
            data: lcRatings,
            fill: true,
            backgroundColor: lcGradient,
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
            tension: 0.4,
          },
          cfRatings.length > 0 && {
            label: "Codeforces Rating",
            data: cfRatings,
            fill: true,
            backgroundColor: cfGradient,
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            tension: 0.4,
          },
          ccRatings.length > 0 && {
            label: "CodeChef Rating",
            data: ccRatings,
            fill: true,
            backgroundColor: ccGradient,
            borderColor: "rgba(234, 179, 8, 1)",
            borderWidth: 2,
            tension: 0.4,
          },
        ].filter(Boolean), // Filters out any empty datasets
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 8,
            right: 8,
            bottom: 0,
            left: 0,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) =>
                `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
            },
          },
          legend: {
            display: true,
            labels: {
              color: "#22c55e",
              font: {
                family: "ui-monospace, monospace",
                size: 12,
              },
            },
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            title: {
              display: true,
              text: "Rating",
              color: "#71717a",
              font: {
                family: "ui-monospace, monospace",
                size: 12,
              },
            },
            ticks: {
              color: "#71717a",
              font: {
                family: "ui-monospace, monospace",
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
            },
            min:
              Math.min(
                ...lcRatings
                  .concat(cfRatings)
                  .concat(ccRatings)
                  .filter((v) => v != null)
              ) ===
                Math.max(
                  ...lcRatings
                    .concat(cfRatings)
                    .concat(ccRatings)
                    .filter((v) => v != null)
                )
                ? 0
                : Math.min(
                  ...lcRatings
                    .concat(cfRatings)
                    .concat(ccRatings)
                    .filter((v) => v != null)
                ),
            max:
              Math.max(
                ...lcRatings
                  .concat(cfRatings)
                  .concat(ccRatings)
                  .filter((v) => v != null)
              ) + 300,

          },
        },
      };

      const myChart = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: chartOptions,
      });

      return () => myChart.destroy();
    }
  }, [lcRatings, cfRatings, ccRatings, lcDates, cfDates, ccDates]);

  return (
    <div className="w-full text-start overflow-hidden h-full">
      <div>
        <p className="text-sm font-mono text-white font-semibold flex items-center gap-2">
          <span className="w-1 h-4 bg-matrix-200" />
          Contests Rating
        </p>
        <p className="text-zinc-500 mt-2 font-mono text-xs">
          {data.contestsData?.leetCodeContestsData?.length === 0 &&
            data.contestsData?.codeForcesContestsData?.length === 0 &&
            data.contestsData?.codeChefContestsData?.length === 0 &&
            "No Contests Data"}
        </p>
      </div>
      {(data.contestsData?.leetCodeContestsData?.length > 0 ||
        data.contestsData?.codeForcesContestsData?.length > 0 ||
        data.contestsData?.codeChefContestsData?.length > 0) && (
          <div className="w-full h-[360px] sm:h-[400px]">
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </div>
        )}
    </div>
  );
};

export default RatingChart;
