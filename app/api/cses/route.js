import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function GET(req , {params}) {
    const url = new URL(req.url);
    // Prefer dynamic route param, fallback to query
    let userId = params?.userId || url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    let browser;
    try {
        // Load CSES problems data
        const problemsDataPath = path.join(process.cwd(), 'json', 'cses_problems.json');
        const problemsData = JSON.parse(fs.readFileSync(problemsDataPath, 'utf8'));
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Go to login page
        await page.goto('https://cses.fi/login', { waitUntil: 'networkidle2' });
        
        // Fill login form
        await page.type('input[name="nick"]', 'fetchpuppter');
        await page.type('input[name="pass"]', 'fetchpuppter');
        
        // Submit login form
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('input[type="submit"]')
        ]);
        
        // Navigate to user profile
        const userUrl = `https://cses.fi/problemset/user/${userId}/`;
        await page.goto(userUrl, { waitUntil: 'networkidle2' });
        
        // Extract submission data
        const submissions = await page.evaluate(() => {
            // Look for the solved problems count in the text
            const solvedText = document.querySelector('p')?.textContent;
            const solvedMatch = solvedText?.match(/Solved tasks: (\d+)\/(\d+)/);
            
            // Extract username from the statistics heading
            let username = 'Unknown';
            
            // Primary method: Look for "Statistics for {username}" in h2
            const statsHeading = document.querySelector('h2');
            if (statsHeading && statsHeading.textContent.includes('Statistics for')) {
                const usernameMatch = statsHeading.textContent.match(/Statistics for (.+)/);
                if (usernameMatch) {
                    username = usernameMatch[1].trim();
                }
            }
            
            // Fallback: Try to get username from page title
            if (username === 'Unknown') {
                const titleElement = document.querySelector('title');
                if (titleElement) {
                    const titleMatch = titleElement.textContent.match(/CSES - (.+) - User/);
                    if (titleMatch) {
                        username = titleMatch[1];
                    }
                }
            }
            
            // Additional fallback: Check all headings
            if (username === 'Unknown') {
                const headings = document.querySelectorAll('h1, h2, h3, h4');
                headings.forEach((h) => {
                    if (h.textContent.includes('User:') || h.textContent.includes('Profile:')) {
                        const userMatch = h.textContent.match(/User:\s*(.+)/);
                        if (userMatch) {
                            username = userMatch[1].trim();
                        }
                    }
                });
            }
            
            // Extract individual solved problems from the grid
            const solvedLinks = document.querySelectorAll('table.course-user-solved a.task-score.icon.full');
            const solvedProblemIds = new Set();
            
            solvedLinks.forEach(link => {
                const href = link.getAttribute('href');
                const problemId = href?.match(/\/problemset\/task\/(\d+)\//)?.[1];
                
                if (problemId) {
                    solvedProblemIds.add(problemId);
                }
            });
            
            return {
                username: username,
                solvedCount: solvedMatch ? parseInt(solvedMatch[1]) : solvedProblemIds.size,
                totalCount: solvedMatch ? parseInt(solvedMatch[2]) : 400,
                solvedProblemIds: Array.from(solvedProblemIds)
            };
        });

        // Process problems by section
        const sectionResults = {};
        let totalSolved = 0;
        let totalProblems = 0;

        Object.entries(problemsData.sections).forEach(([sectionName, problems]) => {
            const solvedProblems = [];
            const unsolvedProblems = [];

            problems.forEach(problem => {
                totalProblems++;
                const isSolved = submissions.solvedProblemIds.includes(problem.id);
                
                const problemData = {
                    id: problem.id,
                    title: problem.title,
                    stats: problem.stats,
                    link: `https://cses.fi/problemset/task/${problem.id}/`,
                    status: isSolved ? 'Solved' : 'Unsolved'
                };

                if (isSolved) {
                    solvedProblems.push(problemData);
                    totalSolved++;
                } else {
                    unsolvedProblems.push(problemData);
                }
            });

            sectionResults[sectionName] = {
                solved: solvedProblems,
                unsolved: unsolvedProblems,
                solvedCount: solvedProblems.length,
                totalCount: problems.length,
                completionPercentage: Math.round((solvedProblems.length / problems.length) * 100)
            };
        });

        return NextResponse.json({
            userId,
            username: submissions.username,
            solvedProblems: totalSolved,
            totalProblems: totalProblems,
            completionPercentage: Math.round((totalSolved / totalProblems) * 100),
            sections: sectionResults
        });

    } catch (error) {
        console.error('Error fetching CSES data:', error.message);
        return NextResponse.json({ 
            error: 'Failed to fetch CSES data', 
            details: error.message 
        }, { status: 500 });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}