"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";
import { LeaderboardSkeleton } from "./Skeleton";
import Image from "next/image";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const CACHE_VERSION = 3;

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [sortKey, setSortKey] = useState(null);

  const filteredData =
    activeTab === "all"
      ? leaderboardData
      : leaderboardData.filter((member) =>
        activeTab === "club" ? member.inClub : !member.inClub
      );

  const fetchUserRatings = async (handles) => {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handles.join(";")}`
      );
      return response.data.result;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return [];
    }
  };

  const fetchLeetCodeRating = async () => {
    try {
      const response = await axios.get("/api/lcrating");
      const sortedData = response.data.sort((a, b) => b.rating - a.rating);
      return sortedData;
    } catch (error) {
      console.log("Error fetching leaderboard data:", error);
    }
  };

  const fetchCodeChefRating = async (username) => {
    try {
      const response = await axios.get(`/api/codechef/${username}`);
      const rating = parseInt(response.data?.currentRating, 10);
      return Number.isNaN(rating) ? 0 : rating;
    } catch (error) {
      return 0;
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get("/api/members");
      const data = response.data || [];
      const normalized = data.map((member) => ({
        username: member.username,
        name: member.name,
        year: member.year || "-",
        inClub: !!member.inClub,
        cf_username: member?.platforms?.cf_username || null,
        lc_username: member?.platforms?.lc_username || null,
        cc_username: member?.platforms?.cc_username || null,
        cses_id: member?.platforms?.cses_id || null,
      }));
      return normalized;
    } catch (error) {
      console.error("Error fetching members:", error);
      return [];
    }
  };

  const fetchCodeforcesHistory = async (handle) => {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.rating?handle=${handle}`
      );
      return response.data?.result || [];
    } catch (error) {
      return [];
    }
  };

  const fetchLeetCodeHistory = async (handle) => {
    try {
      const response = await axios.get(`/api/leetcodehistory/${handle}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  };

  const getValidCodeforcesUsers = async (initialHandles) => {
    let currentHandles = [...initialHandles];
    let attempts = 0;

    while (attempts < 5 && currentHandles.length > 0) {
      try {
        const response = await axios.get(
          `https://codeforces.com/api/user.info?handles=${currentHandles.join(";")}`
        );
        return {
          validHandles: response.data.result.map(u => u.handle)
        };
      } catch (error) {
        attempts++;
        const comment = error.response?.data?.comment;

        // Extract the specific bad handle from the error message
        if (comment && comment.includes("not found")) {
          const matches = comment.match(/User with handle (.+) not found/);
          if (matches && matches[1]) {
            const badHandle = matches[1];
            console.warn(`Invalid Handle Found: ${badHandle}. Removing from list...`);

            currentHandles = currentHandles.filter(h => h !== badHandle);
            continue;
          }
        }
        console.error("Critical API Error:", error);
        break;
      }
    }
    return { validHandles: [] };
  };

  const fetchRatingsAndAttendance = async () => {
    const membersList = await fetchMembers();
    const handles = membersList
      .map((member) => member.cf_username)
      .filter(Boolean);
    setLoading(true);
    const { validHandles } = handles.length
      ? await getValidCodeforcesUsers(handles)
      : { validHandles: [] };

    try {
      const leetCodeRating = await fetchLeetCodeRating();

      const codeChefDataList = await Promise.all(
        membersList.map(async (m) => {
          if (!m.cc_username) return { username: null, data: null };
          try {
            const res = await axios.get(`/api/codechef/${m.cc_username}`);
            return { username: m.cc_username, data: res.data };
          } catch {
            return { username: m.cc_username, data: null };
          }
        })
      );
      const codeChefRatingMap = new Map(
        codeChefDataList
          .filter((item) => item.username)
          .map((item) => [
            String(item.username).toLowerCase(),
            parseInt(item.data?.currentRating, 10) || 0,
          ])
      );
      const codeChefHistoryMap = new Map(
        codeChefDataList
          .filter((item) => item.username)
          .map((item) => [
            String(item.username).toLowerCase(),
            item.data?.ratingHistory || [],
          ])
      );

      const leetCodeHistoryList = await Promise.all(
        membersList.map(async (m) => ({
          username: m.lc_username,
          history: m.lc_username ? await fetchLeetCodeHistory(m.lc_username) : [],
        }))
      );
      const leetCodeHistoryMap = new Map(
        leetCodeHistoryList
          .filter((item) => item.username)
          .map((item) => [String(item.username).toLowerCase(), item.history || []])
      );

      const codeforcesHistoryList = await Promise.all(
        validHandles.map(async (h) => ({
          username: h,
          history: await fetchCodeforcesHistory(h),
        }))
      );
      const codeforcesHistoryMap = new Map(
        codeforcesHistoryList.map((item) => [
          String(item.username).toLowerCase(),
          item.history || [],
        ])
      );

      const cfRatings =
        validHandles.length > 0 ? await fetchUserRatings(validHandles) : [];
      const updatedMembers = [];

      for (const data of membersList) {
        const cfData = cfRatings.find(
          (user) => user.handle === data.cf_username
        );

        const memberData = {
          ...data,
          username: data.username,
          rating: cfData?.rating || 0,
          titlePhoto:
            cfData?.titlePhoto || "https://userpic.codeforces.org/no-title.jpg",
          leetCodeRating:
            data.lc_username
              ? leetCodeRating.find((item) => item.username === data.lc_username)
                  ?.rating || 0
              : 0,
          codeChefRating:
            data.cc_username
              ? codeChefRatingMap.get(String(data.cc_username).toLowerCase()) ?? 0
              : 0,
          lastFiveCombined: (() => {
            const contests = [];

            const cfHistory =
              data.cf_username
                ? codeforcesHistoryMap.get(String(data.cf_username).toLowerCase()) || []
                : [];
            cfHistory.slice(-10).forEach((c) => {
              contests.push({
                platform: "codeforces",
                contestName: c.contestName,
                time: (c.ratingUpdateTimeSeconds || 0) * 1000,
              });
            });

            const lcHistory =
              data.lc_username
                ? leetCodeHistoryMap.get(String(data.lc_username).toLowerCase()) || []
                : [];
            lcHistory
              .filter((c) => c.attended && c.ranking > 0)
              .slice(-10)
              .forEach((c) => {
                contests.push({
                  platform: "leetcode",
                  contestName: c.contest?.title,
                  time: (c.contest?.startTime || 0) * 1000,
                });
              });

            const ccHistory =
              data.cc_username
                ? codeChefHistoryMap.get(String(data.cc_username).toLowerCase()) || []
                : [];
            ccHistory.slice(-10).forEach((c) => {
              const parsed = Date.parse(c.date);
              contests.push({
                platform: "codechef",
                contestName: c.contestName,
                time: Number.isNaN(parsed) ? 0 : parsed,
              });
            });

            return contests
              .filter((c) => c.time > 0)
              .sort((a, b) => b.time - a.time)
              .slice(0, 5);
          })(),
        };

        updatedMembers.push(memberData);
      }

      if (sortKey === "leetCodeRating") {
        updatedMembers.sort((a, b) => b.leetCodeRating - a.leetCodeRating);
      } else if (sortKey === "codeChefRating") {
        updatedMembers.sort((a, b) => b.codeChefRating - a.codeChefRating);
      } else if (sortKey === "cfRating") {
        updatedMembers.sort((a, b) => b.rating - a.rating);
      } else {
        updatedMembers.sort((a, b) => b.rating - a.rating);
      }
      setLeaderboardData(updatedMembers);
      // console.log( "Leaderboard Data:", updatedMembers);
      const cachedData = {
        data: updatedMembers,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem("leaderboardData", JSON.stringify(cachedData));
      localStorage.setItem("lastClearDateIST", new Date().toISOString());
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkForMidnightIST = () => {
      const now = new Date();
      const istOffset = 330; // IST is UTC+5:30
      const istNow = new Date(now.getTime() + istOffset * 60 * 1000);

      const currentHour = istNow.getUTCHours();
      const currentMinute = istNow.getUTCMinutes();

      // Check if it's exactly 12:00 AM IST and clear the storage
      if (currentHour === 0 && currentMinute === 0) {
        localStorage.removeItem("leaderboardData");
        localStorage.setItem("lastClearDateIST", new Date().toISOString());
      }
    };

    // Set an interval to check the time every minute
    const intervalId = setInterval(checkForMidnightIST, 60000);

    const cachedData = JSON.parse(localStorage.getItem("leaderboardData"));
    const isCacheValid =
      cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION;

    const hasAnyCfRating =
      cachedData?.data?.some((m) => Number(m.rating) > 0) ?? false;
    const hasAnyCodeChefRating =
      cachedData?.data?.some((m) => Number(m.codeChefRating) > 0) ?? false;

    if (
      isCacheValid &&
      cachedData?.version === CACHE_VERSION &&
      (hasAnyCfRating || hasAnyCodeChefRating)
    ) {
      if (sortKey === "leetCodeRating") {
        cachedData.data.sort((a, b) => b.leetCodeRating - a.leetCodeRating);
      } else if (sortKey === "codeChefRating") {
        cachedData.data.sort((a, b) => b.codeChefRating - a.codeChefRating);
      } else if (sortKey === "cfRating") {
        cachedData.data.sort((a, b) => b.rating - a.rating);
      }

      setLeaderboardData(cachedData.data);
      setLoading(false);
    } else {
      fetchRatingsAndAttendance();
    }

    return () => clearInterval(intervalId);
  }, [sortKey]);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  // Helper function to render rank with medals for top 3
  const renderRank = (index) => {
    const Medal = ({ className }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
        <path d="M11 12 5.12 2.2" />
        <path d="m13 12 5.88-9.8" />
        <path d="M8 7h8" />
        <circle cx="12" cy="17" r="5" />
        <path d="M12 18v-2h-.5" />
      </svg>
    );

    if (index === 0) {
      return (
        <div className="flex items-center justify-center">
          <Medal className="w-6 h-6 text-yellow-400 drop-shadow-glow" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="flex items-center justify-center">
          <Medal className="w-6 h-6 text-gray-300 drop-shadow-glow" />
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="flex items-center justify-center">
          <Medal className="w-6 h-6 text-orange-400 drop-shadow-glow" />
        </div>
      );
    }
    return <span className="font-mono text-zinc-400">{index + 1}</span>;
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortKey === "leetCodeRating") {
      return b.leetCodeRating - a.leetCodeRating;
    }
    if (sortKey === "codeChefRating") {
      return b.codeChefRating - a.codeChefRating;
    }
    if (sortKey === "cfRating") {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8">
      {/* Header */}
      <div className="w-full max-w-7xl mb-8">
        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-matrix-100 via-matrix-200 to-emerald-400 bg-clip-text text-transparent">
            Leaderboard
          </span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Track your competitive programming progress
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${activeTab === "all"
            ? "bg-matrix-200 text-black shadow-glow-md"
            : "glass border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200"
            }`}
        >
          All Members
        </button>
        <button
          onClick={() => setActiveTab("club")}
          className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${activeTab === "club"
            ? "bg-matrix-200 text-black shadow-glow-md"
            : "glass border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200"
            }`}
        >
          BigOOne Members
        </button>
        <button
          onClick={() => setActiveTab("nonclub")}
          className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${activeTab === "nonclub"
            ? "bg-matrix-200 text-black shadow-glow-md"
            : "glass border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200"
            }`}
        >
          Non-BigOOne Members
        </button>
      </div>

      {/* Table Card */}
      <div className="w-full max-w-7xl glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900 text-matrix-200 border-b border-white/10">
                <th className="p-3 sm:p-4 text-left font-mono text-sm">Rank</th>
                <th className="p-3 sm:p-4 text-left font-mono text-sm">Name</th>
                <th className="p-3 sm:p-4 text-center font-mono text-sm">Year</th>
                <th className="p-3 sm:p-4 text-center font-mono text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>LeetCode</span>
                    <button
                      onClick={() => {
                        setSortKey(
                          sortKey === "leetCodeRating" ? null : "leetCodeRating"
                        );
                      }}
                      className="flex items-center hover:text-white transition-colors"
                    >
                      {sortKey === "leetCodeRating" ? (
                        <ArrowDown size={16} />
                      ) : (
                        <ArrowUp size={16} className="opacity-30" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="p-3 sm:p-4 text-center font-mono text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>CodeChef</span>
                    <button
                      onClick={() => {
                        setSortKey(
                          sortKey === "codeChefRating" ? null : "codeChefRating"
                        );
                      }}
                      className="flex items-center hover:text-white transition-colors"
                    >
                      {sortKey === "codeChefRating" ? (
                        <ArrowDown size={16} />
                      ) : (
                        <ArrowUp size={16} className="opacity-30" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="p-3 sm:p-4 text-center font-mono text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>CF Rating</span>
                    <button
                      onClick={() => {
                        setSortKey(sortKey === "cfRating" ? null : "cfRating");
                      }}
                      className="flex items-center hover:text-white transition-colors"
                    >
                      {sortKey === "cfRating" ? (
                        <ArrowDown size={16} />
                      ) : (
                        <ArrowUp size={16} className="opacity-30" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="p-3 sm:p-4 text-center font-mono text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>Last 5</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((member, index) => (
                <tr
                  key={index}
                  className={`border-b border-white/5 transition-all duration-300 hover:scale-[1.01] hover:border-matrix-200/40 hover:shadow-glow-sm group ${index % 2 === 0 ? "bg-black/30" : "bg-zinc-900/30"
                    }`}
                >
                  {/* Rank Column with Medals */}
                  <td className="p-3 sm:p-4 text-center">
                    {renderRank(index)}
                  </td>

                  {/* Name Column with Avatar */}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        width={40}
                        height={40}
                        src={member.titlePhoto}
                        alt={member.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-green-500 ring-offset-2 ring-offset-black"
                      />
                      <Link
                        className="text-sm sm:text-base text-zinc-300 hover:text-matrix-200 transition-colors font-medium"
                        href={`profile/${member.username}`}
                      >
                        {member.name}
                      </Link>
                    </div>
                  </td>

                  {/* Year */}
                  <td className="p-3 sm:p-4 text-center text-zinc-400 text-sm sm:text-base">
                    {member.year}
                  </td>

                  {/* LeetCode Rating */}
                  <td className="p-3 sm:p-4 text-center">
                    {member.lc_username ? (
                      <a
                        href={`https://leetcode.com/${member.lc_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base text-matrix-200 hover:text-matrix-100 transition-colors font-mono"
                      >
                        {member.leetCodeRating}
                      </a>
                    ) : (
                      <span className="text-sm sm:text-base text-zinc-500 font-mono">
                        0
                      </span>
                    )}
                  </td>

                  {/* CodeChef Rating */}
                  <td className="p-3 sm:p-4 text-center">
                    {member.cc_username ? (
                      <a
                        href={`https://www.codechef.com/users/${member.cc_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base text-matrix-200 hover:text-matrix-100 transition-colors font-mono"
                      >
                        {member.codeChefRating ?? 0}
                      </a>
                    ) : (
                      <span className="text-sm sm:text-base text-zinc-500 font-mono">
                        0
                      </span>
                    )}
                  </td>

                  {/* Codeforces Rating */}
                  <td className="p-3 sm:p-4 text-center">
                    {member.cf_username ? (
                      <a
                        href={`https://codeforces.com/profile/${member.cf_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base text-matrix-200 hover:text-matrix-100 transition-colors font-mono"
                      >
                        {member.rating}
                      </a>
                    ) : (
                      <span className="text-sm sm:text-base text-zinc-500 font-mono">
                        0
                      </span>
                    )}
                  </td>

                  {/* Last 5 Combined */}
                  <td className="p-3 sm:p-4">
                    <div className="flex gap-2 items-center justify-center">
                      {(member.lastFiveCombined || []).length === 0 ? (
                        <span className="text-xs text-zinc-500 font-mono">No data</span>
                      ) : (
                        member.lastFiveCombined.map((contest, i) => {
                          const icon =
                            contest.platform === "leetcode"
                              ? "/svgs/lc.svg"
                              : contest.platform === "codechef"
                                ? "/svgs/cc.svg"
                                : "/svgs/cf.svg";
                          return (
                            <span key={i} title={contest.contestName}>
                              <Image
                                src={icon}
                                width={18}
                                height={18}
                                className="w-5 h-5"
                                alt={contest.platform}
                              />
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
