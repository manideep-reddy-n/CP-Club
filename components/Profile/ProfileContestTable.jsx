"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const ProfileContestTable = ({ data }) => {
  const [contests, setContests] = useState([]);
  useEffect(() => {
    setContests(data.mergedContests);
  }, [data])

  const sortedContests = contests.sort((a, b) => b.startTime - a.startTime);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(contests.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentContests = sortedContests.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );

  const formatContestName = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').concat('/');
  };

  // console.log(currentContests);

  return (
    <div className="w-full overflow-x-auto">
      {!contests || contests.length !== 0 ? (
        <>
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-zinc-900 border-b border-white/10">
                <th className="p-3 text-sm font-mono font-medium text-matrix-200">Contest</th>
                <th className="p-3 text-sm font-mono font-medium text-matrix-200">Date</th>
                <th className="p-3 text-sm font-mono font-medium text-matrix-200">Rank</th>
                <th className="p-3 text-sm font-mono font-medium text-matrix-200">Solved</th>
              </tr>
            </thead>
            <tbody>
              {currentContests.map((contest, index) => (
                <tr
                  key={index}
                  className={`border-b border-white/5 transition-all hover:bg-zinc-800/30 ${index % 2 === 0 ? "bg-black/20" : "bg-zinc-900/20"
                    }`}
                >
                  <td className="py-3 px-3 text-sm">
                    <div className="flex gap-2 items-center">
                      {contest.platform === "LeetCode" ? (
                        <Image
                          src="/svgs/lc.svg"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                          alt="LeetCode"
                        />
                      ) : contest.platform === "CodeChef" ? (
                        <Image
                          src="/svgs/cc.svg"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                          alt="CodeChef"
                        />
                      ) : (
                        <Image
                          src="/svgs/cf.svg"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                          alt="Codeforces"
                        />
                      )}
                      {contest.platform === "LeetCode" ? (
                        <Link
                          href={`https://leetcode.com/contest/${formatContestName(contest.contestName)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-300 hover:text-matrix-200 transition-colors"
                        >
                          <p>{contest.contestName}</p>
                        </Link>
                      ) : contest.platform === "CodeChef" ? (
                        <Link
                          href={`https://www.codechef.com/${contest.contestId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-300 hover:text-matrix-200 transition-colors"
                        >
                          <p>{contest.contestName}</p>
                        </Link>
                      ) : (
                        <Link
                          href={`https://codeforces.com/contest/${contest.contestId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-300 hover:text-matrix-200 transition-colors"
                        >
                          <p>{contest.contestName}</p>
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-zinc-400 font-mono">
                    {formatDate(contest.startTime)}
                  </td>
                  <td className="py-3 px-3 text-sm text-zinc-400 font-mono">{contest.rank}</td>
                  <td className="py-3 px-3 text-sm text-matrix-200 font-mono font-bold">
                    {contest.problemsSolved ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-mono bg-zinc-900/50 border border-white/10 rounded-lg text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>

            <span className="text-sm text-zinc-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-mono bg-zinc-900/50 border border-white/10 rounded-lg text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-zinc-400 font-mono">No Records Found</p>
        </div>
      )}
    </div>
  );
};

export default ProfileContestTable;
