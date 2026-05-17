import Profile from "@/components/Profile/Profile";
import { getLeetCodeData } from "@/lib/getLeetCodeData";
import React from "react";
import { getCodeForcesData } from "@/lib/getCodeForcesData";
import { getCodeChefData } from "@/lib/getCodeChefData";
import { getMemberByUsername } from "@/lib/members";
import { notFound } from "next/navigation";

async function page({ params }) {
  const key = (await params).username;
  const userRecord = await getMemberByUsername(key);
  if (!userRecord) {
    notFound();
  }

  const user_data = {
    _id: userRecord._id?.toString(),
    name: userRecord.name,
    username: userRecord.username,
    email: userRecord.email,
    year: userRecord.year,
    inClub: userRecord.inClub,
    cf_username: userRecord.platforms?.cf_username || null,
    lc_username: userRecord.platforms?.lc_username || null,
    cc_username: userRecord.platforms?.cc_username || null,
    cses_id: userRecord.platforms?.cses_id || null,
  };

  const leetCodeData = user_data.lc_username
    ? await getLeetCodeData(user_data.lc_username)
    : null;
  const codeForcesData = user_data.cf_username
    ? await getCodeForcesData(user_data.cf_username)
    : null;
  const codeChefData = user_data.cc_username
    ? await getCodeChefData(user_data.cc_username)
    : null;

  let data = {
    user_data: user_data,
    leetCodeData: leetCodeData ?? null,
    codeForcesData: codeForcesData ?? null,
    codeChefData: codeChefData ?? null,
  };

  let contestsData = {
    leetCodeContestsData:
      data.leetCodeData?.userContestDetails?.contestParticipation || [],
    codeForcesContestsData: data.codeForcesData?.ratingData || [],
    codeChefContestsData: data.codeChefData?.ratingHistory || [],
  };

  let mergedContestsArray = [
    ...(contestsData.leetCodeContestsData || []).map((contest) =>
      normalizeContestData(contest, "LeetCode")
    ),
    ...(contestsData.codeForcesContestsData || []).map((contest) =>
      normalizeContestData(contest, "CodeForces")
    ),
    ...(contestsData.codeChefContestsData || []).map((contest) =>
      normalizeContestData(contest, "CodeChef")
    ),
  ];

  data["mergedContests"] = mergedContestsArray;
  data["contestsData"] = contestsData;

  // console.log(data);
  
  return (
    <div>
      <Profile data={data} />
    </div>
  );
}

function normalizeContestData(contest, platform) {
  if (platform === "CodeChef") {
    const parsedDate = Date.parse(contest.date);
    return {
      platform: platform,
      contestId: contest.contestCode || null,
      contestName: contest.contestName || "Unknown Contest",
      startTime: Number.isNaN(parsedDate) ? null : Math.floor(parsedDate / 1000),
      newRating: contest.ratingAfter || null,
      rank: contest.rank || null,
      problemsSolved: contest.problemsSolved ?? null,
    };
  }

  return {
    platform: platform,
    contestId: contest.contestId || null,
    contestName:
      contest.contestName || contest.contest?.title || "Unknown Contest",
    startTime:
      contest?.contest?.startTime || contest.ratingUpdateTimeSeconds || null,
    newRating: contest.newRating || contest.rating || null,
    rank: contest.rank || contest.ranking || null,
    problemsSolved: contest.problemsSolved || null,
  };
}

export default page;
