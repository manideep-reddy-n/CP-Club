import axios from "axios";
import { NextResponse } from "next/server";
import { getMembers } from "@/lib/members";

// Helper function to fetch data for a single user
async function fetchUserContestHistory(username) {
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

  const variables = { username };

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables },
      { timeout: 5000 }
    );

    return response.data?.data?.userContestRankingHistory || [];
  } catch (error) {
    console.error(`Error fetching data for ${username}:`, error.message);
    return [];
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  
  // Get the exact contest name from URL (e.g., "Weekly Contest 482")
  const targetContestName = url.searchParams.get("contestName") || 'Weekly Contest 482'; 

  // 1. Load members from DB
  let membersList;
  
  try {
    const members = await getMembers();
    membersList = members.map((member) => ({
      id: member.username, // This becomes the 'ref'
      name: member.name,
      lc_username: member?.platforms?.lc_username || null,
    }));
  } catch (error) {
    console.error("Error reading members:", error);
    return NextResponse.json({ error: "Failed to read members" }, { status: 500 });
  }

  // console.log(`Fetching ranklist for: "${targetContestName}" | Total Members: ${membersList.length}`);

  // 3. Fetch all data in parallel
  const promises = membersList.map(async (member) => {
    if (!member.lc_username) return null;

    const history = await fetchUserContestHistory(member.lc_username);
    
    // Find the specific contest entry matching the name exactly
    const contestEntry = history.find((entry) => 
      entry.contest.title === targetContestName
    );

    // Only return if found and they have a valid rank
    if (contestEntry && contestEntry.ranking > 0) {
      return {
        ref: member.id, // ID from the JSON key
        name: member.name,
        handle: member.lc_username,
        standing: contestEntry.ranking,
        contestTitle: contestEntry.contest.title,
      };
    }

    return null; // User didn't participate
  });

  const results = await Promise.all(promises);
  
  const ranklist = results
    .filter(item => item !== null)
    .sort((a, b) => a.standing - b.standing);

  // console.log(`Found ${ranklist.length} participants.`);

  return NextResponse.json(ranklist);
}
