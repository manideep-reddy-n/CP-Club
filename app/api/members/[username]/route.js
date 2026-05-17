import { NextResponse } from "next/server";
import axios from "axios";
import {
  getMemberByUsername,
  updateMember,
  updateMemberById,
  getMembers,
} from "@/lib/members";

async function isValidCodeforcesHandle(handle) {
  if (!handle) return true;
  try {
    const { data } = await axios.get(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`
    );
    return data?.status === "OK" && Array.isArray(data?.result) && data.result.length > 0;
  } catch {
    return false;
  }
}

async function isValidLeetCodeHandle(handle) {
  if (!handle) return true;
  try {
    const { data } = await axios.post("https://leetcode.com/graphql", {
      query: `
        query validateUser($username: String!) {
          matchedUser(username: $username) {
            username
          }
        }
      `,
      variables: { username: handle },
    });
    return Boolean(data?.data?.matchedUser?.username);
  } catch {
    return false;
  }
}

async function isValidCodeChefHandle(handle) {
  if (!handle) return true;
  try {
    const { data, status } = await axios.get(
      `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
      {
        validateStatus: () => true,
        headers: { "User-Agent": "Mozilla/5.0" },
      }
    );
    if (status !== 200 || !data) return false;
    const lower = String(data).toLowerCase();
    if (lower.includes("page not found") || lower.includes("404")) return false;
    return lower.includes("rating-number") || lower.includes("user-country-name");
  } catch {
    return false;
  }
}

async function isValidCsesUserId(csesId) {
  if (!csesId) return true;
  try {
    const { status } = await axios.get(
      `https://cses.fi/user/${encodeURIComponent(csesId)}`,
      { validateStatus: () => true }
    );
    return status === 200;
  } catch {
    return false;
  }
}

export async function GET(_req, { params }) {
  try {
    const username = params?.username;
    const member = await getMemberByUsername(username);

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to load member." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    let username = params?.username;
    const body = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    // Decode URL encoding and trim whitespace
    username = decodeURIComponent(username).trim();
    console.log(`PUT /api/members: received username='${username}'`);

    const updates = {
      name: body.name,
      platforms: {
        cf_username: body.cf_username?.trim() || null,
        lc_username: body.lc_username?.trim() || null,
        cc_username: body.cc_username?.trim() || null,
        cses_id: body.cses_id?.trim() || null,
      },
    };

    if (Object.prototype.hasOwnProperty.call(body, "year")) {
      updates.year = body.year === "" ? null : body.year;
    }

    // Validate platform handles before persisting them.
    const [isCfValid, isLcValid, isCcValid, isCsesValid] = await Promise.all([
      isValidCodeforcesHandle(updates.platforms.cf_username),
      isValidLeetCodeHandle(updates.platforms.lc_username),
      isValidCodeChefHandle(updates.platforms.cc_username),
      isValidCsesUserId(updates.platforms.cses_id),
    ]);

    if (!isCfValid) {
      return NextResponse.json(
        { error: "Wrong Codeforces username. Please enter a valid handle." },
        { status: 400 }
      );
    }
    if (!isLcValid) {
      return NextResponse.json(
        { error: "Wrong LeetCode username. Please enter a valid handle." },
        { status: 400 }
      );
    }
    if (!isCcValid) {
      return NextResponse.json(
        { error: "Wrong CodeChef username. Please enter a valid handle." },
        { status: 400 }
      );
    }
    if (!isCsesValid) {
      return NextResponse.json(
        { error: "Wrong CSES user id. Please enter a valid id." },
        { status: 400 }
      );
    }

    try {
      if (body?.userId) {
        try {
          const updatedMember = await updateMemberById(body.userId, updates);
          return NextResponse.json(
            { ok: true, member: updatedMember },
            { status: 200 }
          );
        } catch (idErr) {
          console.warn(
            `updateMemberById failed for userId='${body.userId}': ${idErr?.message}`
          );
        }
      }

      const updatedMember = await updateMember(username, updates);
      console.log(`✓ Updated member: ${username}`);
      return NextResponse.json(
        { ok: true, member: updatedMember },
        { status: 200 }
      );
    } catch (err) {
      // Fallback: try to find member case-insensitively among all members
      console.warn(`✗ First attempt failed for '${username}': ${err?.message}`);
      if (err?.message === "Member not found." || err?.message?.includes("not found")) {
        try {
          const members = await getMembers();
          const found = members.find((m) =>
            m.username && m.username.toLowerCase() === String(username).toLowerCase()
          );
          if (found) {
            console.log(`→ Fallback: retry with correct username '${found.username}'`);
            const updatedMember = await updateMember(found.username, updates);
            return NextResponse.json(
              { ok: true, member: updatedMember },
              { status: 200 }
            );
          }
        } catch (innerErr) {
          console.error("Fallback update error:", innerErr?.message);
        }
        return NextResponse.json(
          { error: "Member not found. Please check your username and refresh." },
          { status: 404 }
        );
      }

      if (err?.message === "No valid updates provided.") {
        return NextResponse.json(
          { error: err.message },
          { status: 400 }
        );
      }

      throw err;
    }
  } catch (error) {
    console.error("PUT /api/members/[username] error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to update member." },
      { status: 500 }
    );
  }
}
