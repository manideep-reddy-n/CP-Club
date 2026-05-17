import axios from "axios";
import * as cheerio from "cheerio";

export const getCodeChefData = async (username) => {
  const handle = String(username || "").trim();
  if (!handle) return null;

  try {
    const url = `https://www.codechef.com/users/${handle}`;

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(data);

    // ===== BASIC INFO =====
    const country = $(".user-country-name").text().trim();
    const institution = $("li:contains('Institution') span").last().text().trim();

    // ===== RATING INFO =====
    const currentRating = $(".rating-number").first().text().trim();
    const highestRating =
      $("small:contains('Highest Rating')").text().match(/\d+/)?.[0] || null;

    const globalRank = $(".rating-ranks li:first-child strong").text().trim();
    const countryRank = $(".rating-ranks li:last-child strong").text().trim();

    // ===== CONTEST STATS =====
    const totalContests = $(".contest-participated-count b").text().trim();

    // ===== PROBLEMS SOLVED =====
    const problemsSolvedText = $("h3:contains('Total Problems Solved')").text();
    const totalProblemsSolved = problemsSolvedText.match(/\d+/)?.[0] || "0";

    // ===== HEATMAP DATA =====
    const heatmapMatch = data.match(
      /var userDailySubmissionsStats = (\[[\s\S]*?\]);/
    );
    const heatmapData = heatmapMatch ? JSON.parse(heatmapMatch[1]) : [];
    const totalActiveDays = heatmapData.length;

    // ===== CONTEST-WISE PROBLEMS SOLVED =====
    const contestProblems = [];

    $(".problems-solved .content").each((i, el) => {
      const contestName = $(el).find("h5 span").first().text().trim();
      const problemsText = $(el).find("p span").text().trim();

      if (!contestName || !problemsText) return;

      const problems = problemsText.split(",").map(p => p.trim()).filter(Boolean);

      contestProblems.push({
        contestName,
        problemsSolved: problems.length,
        problemList: problems,
      });
    });

    // ===== RATING GRAPH DATA =====
    const contestProblemsMap = new Map(
      contestProblems.map((c) => [c.contestName.toLowerCase(), c])
    );
    const ratingMatch = data.match(/var all_rating = (\[[\s\S]*?\]);/);
    const ratingData = ratingMatch ? JSON.parse(ratingMatch[1]) : [];

    const ratingHistory = ratingData.map((contest, index) => {
      const prev =
        index > 0
          ? parseInt(ratingData[index - 1].rating)
          : parseInt(contest.rating);
      const current = parseInt(contest.rating);
      const problems =
        contestProblemsMap.get(String(contest.name || "").toLowerCase())
          ?.problemsSolved ?? null;

      return {
        contestCode: contest.code,
        contestName: contest.name,
        ratingAfter: current,
        ratingChange: current - prev,
        rank: contest.rank,
        date: `${contest.getyear}-${contest.getmonth}-${contest.getday}`,
        problemsSolved: problems,
      };
    });

    return {
      username: handle,
      country,
      institution,
      currentRating,
      highestRating,
      globalRank,
      countryRank,
      totalContests,
      totalProblemsSolved,
      totalActiveDays,
      heatmapData,
      ratingHistory,
      contestProblems,
    };
  } catch (error) {
    console.error("CodeChef scrape error:", error?.message);
    return null;
  }
};
