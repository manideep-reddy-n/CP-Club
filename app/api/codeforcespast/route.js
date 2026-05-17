import axios from "axios";
import { NextResponse } from "next/server";
import { getMembers } from "@/lib/members";

export async function GET(req) {
    const url = new URL(req.url);
    const contestId = url.searchParams.get("contestId");

    if (!contestId) {
        return NextResponse.json({ error: "Missing contestId" }, { status: 400 });
    }

    let userHandles = [];
    let userMapping = {};
    let userRefMapping = {};

    try {
        const members = await getMembers();
        // Keep original handles for API query, but build case-insensitive maps
        userHandles = members
            .map((user) => user?.platforms?.cf_username)
            .filter(Boolean);

        userMapping = Object.fromEntries(
            members
                .filter((user) => user?.platforms?.cf_username)
                .map((user) => [user.platforms.cf_username.toLowerCase(), user.name])
        );

        userRefMapping = Object.fromEntries(
            members
                .filter((user) => user?.platforms?.cf_username)
                .map((user) => [user.platforms.cf_username.toLowerCase(), user.username])
        );
    } catch (error) {
        console.error("Error reading members:", error);
        return NextResponse.json({ error: "Failed to read members" }, { status: 500 });
    }

    try {
        // Query only your club members using handles
        if (userHandles.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const response = await axios.get("https://codeforces.com/api/contest.standings", {
            params: {
                contestId,
                handles: userHandles.join(";"), // Filtered by members
                showUnofficial: true,
                from: 1,
                count: userHandles.length,
            },
        });

        if (response.data.status === "OK") {
            const standings = response.data.result.rows;

            // Deduplicate by handle, prefer CONTESTANT > PRACTICE > VIRTUAL
            const uniqueMap = new Map();

            for (const row of standings) {
                const handle = row.party.members[0].handle;
                const type = row.party.participantType;

                if (!uniqueMap.has(handle)) {
                    uniqueMap.set(handle, row); // first appearance
                } else {
                    // prefer official participation if multiple exist
                    const existing = uniqueMap.get(handle);
                    const priority = { CONTESTANT: 3, OUT_OF_COMPETITION: 2, PRACTICE: 1, VIRTUAL: 0 };
                    if ((priority[type] || 0) > (priority[existing.party.participantType] || 0)) {
                        uniqueMap.set(handle, row);
                    }
                }
            }

            const formattedData = Array.from(uniqueMap.values()).map((row) => {
                const handle = row.party.members[0].handle;
                const key = handle.toLowerCase();
                const userName = userMapping[key] || "Unknown";
                const ref = userRefMapping[key] || "Unknown";

                return {
                    name: userName,
                    handle,
                    standing: row.rank==0 ? "-" : row.rank,
                    points: row.points,
                    penalty: row.penalty,
                    participantType: row.party.participantType,
                    ref,
                };
            });

            return NextResponse.json(formattedData, { status: 200 });
        } else {
            console.error("CF API Error:", response.data);
            return NextResponse.json({ error: response.data.comment }, { status: 500 });
        }
    } catch (error) {
        console.error("Error fetching Codeforces API data:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to fetch data from Codeforces API", details: error.response?.data || error.message },
            { status: 500 }
        );
    }
}
