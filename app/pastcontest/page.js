"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Medal, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ContestTableSkeleton } from "@/components/Skeleton";
import Link from "next/link";

const platformLogos = {
  codeforces:
    "https://sta.codeforces.com/s/44094/favicon-32x32.png",
  leetcode:
    "https://leetcode.com/static/images/LeetCode_logo.png",
  codechef:
    "https://www.codechef.com/favicon.ico",
};

// Platform-specific glow colors
const platformGlowColors = {
  leetcode: {
    borderGlow: "border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    textGradient: "from-yellow-400 to-orange-500",
    ringColor: "ring-yellow-500/50"
  },
  codeforces: {
    borderGlow: "border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    textGradient: "from-blue-400 to-blue-600",
    ringColor: "ring-blue-500/50"
  },
};

function ContestLeaderboardContent() {
  const searchParams = useSearchParams();
  const contestName = searchParams.get("contestName");
  const platform = searchParams.get("platform");
  const contestId = searchParams.get("contestId");

  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        let response;
        if (platform === "codeforces" && contestId) {
          response = await axios.get(
            `/api/codeforcespast?contestId=${contestId}`
          );
        } else if (platform === "leetcode" && contestId) {
          response = await axios.get(
            `/api/leetcodepast?contestId=${contestId}&contestName=${contestName}`
          );
        }
        if (response?.data) {
          setParticipants(
            Array.isArray(response.data)
              ? [...response.data].sort((a, b) => {
                return a.standing - b.standing;
              })
              : response.data
          );
          // console.log("Fetched participants:", response.data);
        }
      } catch (error) {
        console.error(`Failed to fetch standings for ${platform}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (platform && (contestId || contestName)) fetchParticipants();
  }, [platform, contestId, contestName]);

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const platformStyle = platformGlowColors[platform] || platformGlowColors.leetcode;

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Glass Card with Platform Glow */}
        <div
          className={`mb-8 rounded-xl bg-zinc-900/50 backdrop-blur-xl border-2 ${platformStyle.borderGlow} p-8 transition-all duration-300`}
        >
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <div className="relative">
              {/* Glowing ring around logo */}
              <div className={`absolute inset-0 animate-pulse rounded-full ring-4 ${platformStyle.ringColor} opacity-60`}></div>
              <Image
                src={platformLogos[platform]}
                alt={`${platform} logo`}
                width={64}
                height={64}
                className="relative h-16 w-16 rounded-full border-4 border-white/20 shadow-lg"
              />
            </div>
            <h1 className={`text-center text-3xl font-mono font-extrabold sm:text-4xl bg-gradient-to-r ${platformStyle.textGradient} bg-clip-text text-transparent`}>
              {contestName || "Default Contest Name"}
            </h1>
          </div>
          {/* Participant Count Badge */}
          {!loading && participants.length > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 backdrop-blur-sm">
                <span className="text-sm font-mono text-green-400">
                  {participants.length} Participant{participants.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="mb-6 flex justify-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800 focus:ring-green-500 focus:border-green-500 text-white placeholder:text-zinc-500 font-mono"
            />
          </div>
        </div>

        {loading ? (
          <ContestTableSkeleton />
        ) : filteredParticipants.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-mono font-bold text-white mb-2">No participants found</h3>
            <p className="text-zinc-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-900 border-b border-white/10 hover:bg-zinc-900">
                  <TableHead className="text-green-500 font-mono uppercase tracking-wider">Rank</TableHead>
                  <TableHead className="text-green-500 font-mono uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-green-500 font-mono uppercase tracking-wider">Handle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant, index) => (
                  <TableRow
                    key={`${participant.handle}-${index}`}
                    className="bg-black border-b border-white/5 transition-all hover:bg-green-900/10 hover:border-l-2 hover:border-l-green-500 group animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                  >
                    <TableCell className="font-semibold text-zinc-300 font-mono">
                      {participant.standing <= 3 ? (
                        <div className="flex items-center space-x-2">
                          <Medal
                            className={`h-6 w-6 ${participant.standing === 1
                              ? "text-yellow-400"
                              : participant.standing === 2
                                ? "text-gray-400"
                                : "text-orange-400"
                              }`}
                            fill="currentColor"
                          />
                          <span className="text-white font-bold">{participant.standing}</span>
                        </div>
                      ) : (
                        participant.standing
                      )}
                    </TableCell>
                    <TableCell className="text-lg font-medium text-zinc-300 group-hover:text-white transition-colors">
                      <Link
                        href={`/profile/${participant.ref}`}
                        className="hover:text-green-400 transition-colors underline decoration-zinc-600 hover:decoration-green-400"
                      >
                        {participant.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-green-400">
                      {participant.handle}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContestLeaderboard() {
  return (
    <Suspense fallback={<ContestTableSkeleton />}>
      <ContestLeaderboardContent />
    </Suspense>
  );
}
