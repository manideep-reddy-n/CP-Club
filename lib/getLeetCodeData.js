import axios from "axios";
import {
  contestQuery,
  statQuery,
  submissionCalendarQuery,
  userQuery,
} from "./query";

export const getLCRating = async (username) => {
  const response = await axios.post("https://leetcode.com/graphql", {
    query: contestQuery,
    variables: {
      username: username,
    },
  });
  if (response.data.data.userContestRanking.rating) {
    return Math.round(response.data.data.userContestRanking.rating);
  } else {
    return 0;
  }
};

export const getLeetCodeData = async (username) => {
  let leetCodeData = {};
  const handle = String(username || "").trim();
  if (!handle) return null;

  let response;
  try {
    response = await axios.post("https://leetcode.com/graphql", {
      query: userQuery,
      variables: {
        username: handle,
      },
    });
  } catch (error) {
    console.error("LeetCode userQuery error:", error?.message);
    return null;
  }

  const matchedUser = response?.data?.data?.matchedUser;
  if (!matchedUser) {
    // Invalid or unavailable LeetCode handle; do not crash profile rendering.
    return {
      acSubmissionNum: [],
      submissionCalendar: {},
      userContestDetails: { contestParticipation: [] },
      topicWiseAnalysis: { advanced: [], intermediate: [], fundamental: [] },
    };
  }

  leetCodeData["acSubmissionNum"] = matchedUser?.submitStatsGlobal?.acSubmissionNum || [];

  // fetch submission calendars for the previous 4 years (including current year) and merge them
  const currentYear = new Date().getFullYear();
  let mergedCalendar = {};

  for (let year = currentYear; year > currentYear - 4; year--) {
    try {
      const res = await axios.post("https://leetcode.com/graphql", {
        query: submissionCalendarQuery,
        variables: {
          username: handle,
          year: year,
        },
      });

      const calStr =
        res?.data?.data?.matchedUser?.userCalendar?.submissionCalendar;
      if (calStr) {
        const calObj = JSON.parse(calStr);
        for (const [date, count] of Object.entries(calObj)) {
          mergedCalendar[date] = (mergedCalendar[date] || 0) + count;
        }
      }
    } catch (e) {
      // ignore year if request fails
    }
  }

  // Put merged calendar into response so later code can JSON.parse it as before
  response = {
    data: {
      data: {
        matchedUser: {
          userCalendar: {
            submissionCalendar: JSON.stringify(mergedCalendar),
          },
        },
      },
    },
  };
  
  if (response.data.data) {
    leetCodeData["submissionCalendar"] = JSON.parse(
      response.data.data.matchedUser.userCalendar.submissionCalendar
    );
  }

  try {
    response = await axios.post("https://leetcode.com/graphql", {
      query: contestQuery,
      variables: {
        username: handle,
      },
    });
  } catch (error) {
    console.error("LeetCode contestQuery error:", error?.message);
    return null;
  }

  // if (response.data.data) {
  //   leetCodeData["userContestDetails"] = response.data.data.userContestRanking;
  //   leetCodeData["userContestDetails"]["contestParticipation"] =
  //     response.data.data.userContestRankingHistory.filter((item) => {
  //       if (item.attended === true) return item;
  //     });
  // }
  if (response?.data?.data) {
    const userContestRanking = response.data.data.userContestRanking;
    const userContestRankingHistory =
      response.data.data.userContestRankingHistory;

    // Check if userContestRanking and userContestRankingHistory exist
    if (userContestRanking && userContestRankingHistory) {
      leetCodeData["userContestDetails"] = userContestRanking;
      leetCodeData["userContestDetails"]["contestParticipation"] =
        userContestRankingHistory.filter((item) => item.attended === true);
    } else {
      // Handle case where userContestRanking or userContestRankingHistory is missing
      leetCodeData["userContestDetails"] = {
        contestParticipation: [],
      };
    }
  }

  try {
    response = await axios.post("https://leetcode.com/graphql", {
      query: statQuery,
      variables: {
        username: handle,
      },
    });
  } catch (error) {
    console.error("LeetCode statQuery error:", error?.message);
    return null;
  }
  if (response?.data?.data?.matchedUser?.tagProblemCounts) {
    leetCodeData["topicWiseAnalysis"] =
      response.data.data.matchedUser.tagProblemCounts;
  } else {
    leetCodeData["topicWiseAnalysis"] = {
      advanced: [],
      intermediate: [],
      fundamental: [],
    };
  }

  return leetCodeData;
};
