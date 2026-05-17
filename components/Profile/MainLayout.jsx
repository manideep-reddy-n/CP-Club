import Image from "next/image";
import React, { useState, useEffect } from "react";
import DoughnutChart from "./DoughnutChart";
import RatingChart from "./RatingChart";
import ProfileContestTable from "./ProfileContestTable";
import TopicAnalysis from "./TopicAnalysis";
import Link from "next/link";
import ActivityHeatmap from "./Heatmap";

function mergeTopicData(leetCodeData, codeForcesData) {
  const combinedAnalysis = { advanced: [], intermediate: [], fundamental: [] };

  ["advanced", "intermediate", "fundamental"].forEach((level) => {
    const leetTopics = leetCodeData?.[level] || [];
    const cfTopics = codeForcesData?.[level] || [];

    const topicMap = new Map();

    // Add LeetCode topics
    leetTopics.forEach((topic) => {
      topicMap.set(topic.tagSlug, { ...topic });
    });

    cfTopics.forEach((topic) => {
      if (topicMap.has(topic.tagSlug)) {
        topicMap.get(topic.tagSlug).problemsSolved += topic.problemsSolved;
      } else {
        topicMap.set(topic.tagSlug, { ...topic });
      }
    });

    combinedAnalysis[level] = Array.from(topicMap.values());
  });

  return combinedAnalysis;
}

async function getDailySolvedProblemsCount(userHandle) {
  const response = await fetch(
    `https://codeforces.com/api/user.status?handle=${userHandle}`
  );
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error("Failed to fetch user data");
  }

  const solvedProblems = data.result
    .filter((submission) => submission.verdict === "OK")
    .map((submission) => ({
      date: new Date(submission.creationTimeSeconds * 1000)
        .toISOString()
        .split("T")[0],
      problemId: `${submission.contestId}-${submission.problem.index}`,
    }));

  const dailyCounts = new Map();

  solvedProblems.forEach(({ date, problemId }) => {
    if (!dailyCounts.has(date)) {
      dailyCounts.set(date, new Set());
    }
    dailyCounts.get(date).add(problemId);
  });

  const dailySolvedProblems = Array.from(dailyCounts, ([date, problems]) => ({
    date,
    count: problems.size,
  }));

  return dailySolvedProblems;
}

function MainLayout({ data }) {
  const [dailySolvedProblem, setdailySolvedProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('leetcode');
  const [contestQuestionsScope, setContestQuestionsScope] = useState("total");
  const [totalContestsScope, setTotalContestsScope] = useState("total");
  const [activeDaysScope, setActiveDaysScope] = useState("total");
  const [heatmapScope, setHeatmapScope] = useState("total");

  useEffect(() => {
    const fetchDailySolvedProblems = async () => {
      try {
        const dailySolvedProblems = await getDailySolvedProblemsCount(
          data?.codeForcesData?.handle
        );
        setdailySolvedProblems(dailySolvedProblems);
      } catch (error) {
        console.error("Error fetching daily solved problems:", error);
      }
    };

    if (data?.codeForcesData?.handle) {
      fetchDailySolvedProblems();
    }
  }, [data?.codeForcesData?.handle]);

  let calenderSubmission = data.leetCodeData?.submissionCalendar;

  // console.log(calenderSubmission);

  const topicWiseAnalysis = mergeTopicData(
    data.leetCodeData?.topicWiseAnalysis,
    data.codeForcesData?.topicAnalysis
  );

  const heatmapData = Object.keys(calenderSubmission || {}).map((timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000)
      .toISOString()
      .split("T")[0];
    return { date, count: calenderSubmission[timestamp] };
  });

  // console.log(heatmapData);

  const leetContestSolvedSum = (
    data.leetCodeData?.userContestDetails?.contestParticipation ?? []
  ).reduce((sum, p) => sum + (p?.problemsSolved ?? 0), 0);

  const codeforcesSolved = data.codeForcesData?.problemsSolvedCount ?? 0;
  const codechefSolved =
    parseInt(data.codeChefData?.totalProblemsSolved, 10) || 0;

  const totalContestQuestions =
    leetContestSolvedSum + codeforcesSolved + codechefSolved;

  const leetContestsCount =
    data.leetCodeData?.userContestDetails?.contestParticipation?.length ?? 0;
  const codeforcesContestsCount = data.codeForcesData?.ratingData?.length ?? 0;
  const codechefContestsCount = data.codeChefData?.ratingHistory?.length ?? 0;
  const totalContestsCount =
    leetContestsCount + codeforcesContestsCount + codechefContestsCount;

  const leetActiveDays = Object.keys(calenderSubmission || {}).length;
  const codeforcesActiveDays = dailySolvedProblem.length;
  const codechefActiveDays = data.codeChefData?.totalActiveDays ?? 0;
  const totalActiveDaysCount =
    leetActiveDays + codeforcesActiveDays + codechefActiveDays;

  const platformOptions = [
    { value: "total", label: "Total" },
    { value: "leetcode", label: "LeetCode" },
    { value: "codechef", label: "CodeChef" },
    { value: "codeforces", label: "Codeforces" },
  ];

  const getContestQuestionsCount = (scope) => {
    switch (scope) {
      case "leetcode":
        return leetContestSolvedSum;
      case "codechef":
        return codechefSolved;
      case "codeforces":
        return codeforcesSolved;
      default:
        return totalContestQuestions;
    }
  };

  const getContestsCount = (scope) => {
    switch (scope) {
      case "leetcode":
        return leetContestsCount;
      case "codechef":
        return codechefContestsCount;
      case "codeforces":
        return codeforcesContestsCount;
      default:
        return totalContestsCount;
    }
  };

  const getActiveDaysCount = (scope) => {
    switch (scope) {
      case "leetcode":
        return leetActiveDays;
      case "codechef":
        return codechefActiveDays;
      case "codeforces":
        return codeforcesActiveDays;
      default:
        return totalActiveDaysCount;
    }
  };

  const normalizeCodeChefHeatmap = (raw = []) =>
    (raw || [])
      .map((item) => {
        if (Array.isArray(item) && item.length >= 2) {
          return { date: String(item[0]), count: Number(item[1]) || 0 };
        }
        if (item && typeof item === "object") {
          const date = item.date || item[0];
          const count =
            item.count ?? item.value ?? item.submissions ?? item[1] ?? 0;
          if (date) return { date: String(date), count: Number(count) || 0 };
        }
        return null;
      })
      .filter(Boolean);

  const codechefHeatmap = normalizeCodeChefHeatmap(
    data.codeChefData?.heatmapData
  );

  const mergeHeatmapSources = (...sources) => {
    const merged = new Map();
    sources.forEach((source) => {
      (source || []).forEach(({ date, count }) => {
        if (!date) return;
        const prev = merged.get(date) || 0;
        merged.set(date, prev + (count || 0));
      });
    });
    return Array.from(merged, ([date, count]) => ({ date, count })).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const totalHeatmap = mergeHeatmapSources(
    heatmapData,
    dailySolvedProblem,
    codechefHeatmap
  );

  const heatmapByScope = {
    total: totalHeatmap,
    leetcode: heatmapData,
    codeforces: dailySolvedProblem,
    codechef: codechefHeatmap,
  };

  const topData = [
    {
      image: "/svgs/puzzle.svg",
      title: "Contest Questions",
      count: getContestQuestionsCount(contestQuestionsScope),
      scope: contestQuestionsScope,
      onScopeChange: setContestQuestionsScope,
    },
    {
      image: "/svgs/trophy.svg",
      title: "Total Contests",
      count: getContestsCount(totalContestsScope),
      scope: totalContestsScope,
      onScopeChange: setTotalContestsScope,
    },
    {
      image: "/svgs/active-days.svg",
      title: "Total Active Days",
      count: getActiveDaysCount(activeDaysScope),
      scope: activeDaysScope,
      onScopeChange: setActiveDaysScope,
    },
  ];
  // console.log(data.codeForcesData);


  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      {/* upper part */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {topData.map((data, index) => (
          <div
            key={index}
            className="w-full py-5 sm:py-6 px-5 sm:px-7 rounded-xl glass-card flex items-center gap-4 sm:gap-5"
          >
            <div className="bg-matrix-200/10 border border-matrix-200/20 rounded-full w-14 h-14 flex justify-center items-center shadow-glow-sm">
              <Image
                src={data.image}
                alt={data.title}
                width={24}
                height={24}
                className="w-6 h-6 brightness-150"
              />
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between gap-3">
                <p className="text-zinc-400 text-sm font-medium">{data.title}</p>
                <select
                  value={data.scope}
                  onChange={(e) => data.onScopeChange(e.target.value)}
                  className="appearance-none bg-zinc-950/80 border border-zinc-700/60 text-zinc-100 text-xs font-mono rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-matrix-200 focus:ring-1 focus:ring-matrix-200/40 shadow-inner hover:border-matrix-200/40 transition-colors"
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
              </div>
              <p className="text-3xl font-mono font-bold text-matrix-200 mt-1">
                {data.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 sm:gap-7">
        {/* left part */}
        <div className="w-full xl:w-[380px] 2xl:w-[420px] flex flex-col gap-6 sm:gap-7">
          <div className="w-full py-5 sm:py-6 px-5 sm:px-7 rounded-xl glass-card flex flex-col gap-5">
            <div className="flex gap-4 border-b border-white/10">
              <button
                onClick={() => setActiveTab('leetcode')}
                className={`pb-3 px-4 font-mono font-medium transition-all ${activeTab === 'leetcode'
                    ? 'border-b-2 border-matrix-200 text-matrix-200'
                    : 'text-zinc-400 hover:text-zinc-300'
                  }`}
              >
                LeetCode
              </button>
              <button
                onClick={() => setActiveTab('codeforces')}
                className={`pb-3 px-4 font-mono font-medium transition-all ${activeTab === 'codeforces'
                    ? 'border-b-2 border-matrix-200 text-matrix-200'
                    : 'text-zinc-400 hover:text-zinc-300'
                  }`}
              >
                CodeForces
              </button>
              <button
                onClick={() => setActiveTab('codechef')}
                className={`pb-3 px-4 font-mono font-medium transition-all ${activeTab === 'codechef'
                    ? 'border-b-2 border-matrix-200 text-matrix-200'
                    : 'text-zinc-400 hover:text-zinc-300'
                  }`}
              >
                CodeChef
              </button>
            </div>

            {activeTab === 'leetcode' && (
              <>
                <p className="text-white font-mono text-sm flex items-center gap-2">
                  <span className="w-1 h-4 bg-matrix-200" />
                  Problems solved from leetcode
                </p>
                <div className="flex gap-3">
                  <DoughnutChart data={data.leetCodeData?.acSubmissionNum} />
                </div>
              </>
            )}

            {activeTab === 'codeforces' && (
              <>
                <p className="text-white font-mono text-sm flex items-center gap-2">
                  <span className="w-1 h-4 bg-matrix-200" />
                  Problems solved from codeforces
                </p>
                <div className="flex gap-3">
                  <DoughnutChart data={data.codeForcesData?.topicAnalysis} />
                </div>
              </>
            )}

            {activeTab === 'codechef' && (
              <>
                <p className="text-white font-mono text-sm flex items-center gap-2">
                  <span className="w-1 h-4 bg-matrix-200" />
                  Problems solved from CodeChef
                </p>
                <div className="flex gap-3">
                  <DoughnutChart data={{ totalOnly: codechefSolved }} />
                </div>
              </>
            )}
          </div>

          <div className="w-full py-5 sm:py-6 px-5 sm:px-7 rounded-xl glass-card flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <p className="text-white font-mono text-sm flex items-center gap-2">
                <span className="w-1 h-4 bg-matrix-200" />
                Contests
              </p>
              <Link href="/contest" className="text-sm text-matrix-200 hover:text-matrix-100 cursor-pointer font-mono transition-colors">
                See All →
              </Link>
            </div>
            <ProfileContestTable data={data} />
          </div>
        </div>

        {/* right part */}
        <div className="w-full xl:flex-1 flex flex-col gap-6 sm:gap-7">
          {/* Heat map section */}
          <ActivityHeatmap
            heatMapData={heatmapByScope[heatmapScope] || []}
            platform={heatmapScope}
            onPlatformChange={setHeatmapScope}
            platformOptions={platformOptions}
          />

          {/* Rating chart section */}
          <div className="w-full py-5 sm:py-6 px-5 sm:px-7 rounded-xl glass-card flex flex-col gap-5">
            <RatingChart data={data} />
          </div>

          {/* Topic Analysis section */}
          <div className="w-full py-5 sm:py-6 px-5 sm:px-7 rounded-xl glass-card flex flex-col gap-5">
            <p className="text-white font-mono text-sm flex items-center gap-2">
              <span className="w-1 h-4 bg-matrix-200" />
              Topic Wise Analysis
            </p>
            <TopicAnalysis data={topicWiseAnalysis} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
