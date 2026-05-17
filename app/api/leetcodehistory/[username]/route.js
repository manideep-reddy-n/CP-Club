import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  const username = params?.username;
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRankingHistory(username: $username) {
        attended
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables: { username } },
      { timeout: 8000 }
    );
    const history = response.data?.data?.userContestRankingHistory || [];
    return NextResponse.json(history);
  } catch (error) {
    console.error(`LeetCode history error for ${username}:`, error?.message);
    return NextResponse.json({ error: "Failed to fetch LeetCode history" }, { status: 500 });
  }
}
