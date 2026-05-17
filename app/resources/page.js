"use client";
import React, { useState } from "react";
import { ExternalLink, BookOpen, Code, Trophy, Target, Copy, Check } from "lucide-react";
import Image from "next/image";

const Resources = () => {
  const [copiedUrl, setCopiedUrl] = useState(null);

  const copyToClipboard = (url, name) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(name);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const platforms = [
    {
      name: "Codeforces",
      url: "https://codeforces.com/",
      logo: {
        src: "https://sta.codeforces.com/s/44094/favicon-32x32.png",
        alt: "Codeforces logo"
      }
    },
    {
      name: "LeetCode",
      url: "https://leetcode.com/",
      logo: {
        src: "https://leetcode.com/static/images/LeetCode_logo.png",
        alt: "LeetCode logo"
      }
    },
    {
      name: "CodeChef",
      url: "https://www.codechef.com/",
      logo: {
        src: "https://www.codechef.com/favicon.ico",
        alt: "CC logo"
      }
    },
    {
      name: "AtCoder",
      url: "https://atcoder.jp/home",
      logo: {
        src: "https://atcoder.jp/favicon.ico",
        alt: "AtCoder logo"
      }
    },
    {
      name: "CSES",
      url: "https://cses.fi/register/",
      logo: {
        src: "/images/cses.png",
        alt: "CSES logo"
      }
    },
    {
      name: "HackerRank",
      url: "https://www.hackerrank.com/auth/login",
      logo: {
        src: "https://cdn.prod.website-files.com/66b6d7fd4d3e9cef94717176/6715d41d809c171b16ea5612_Hackerrank%20Cursor%20Favicon.png",
        alt: "HackerRank logo"
      }
    }
  ];

  const learningResources = [
    {
      topic: "Dynamic Programming",
      topics: ["DP"],
      resources: [
        { name: "DP Patterns from AtCoder", url: "https://atcoder.jp/contests/dp", desc: "Comprehensive DP problem collection" },
        { name: "LeetCode DP Study Plan", url: "https://leetcode.com/studyplan/dynamic-programming/", desc: "Structured DP learning path" }
      ]
    },
    {
      topic: "Graph Algorithms",
      topics: ["Graphs", "Trees"],
      resources: [
        { name: "CSES Graph Section", url: "https://cses.fi/problemset/list/", desc: "Classic graph problems" },
        { name: "Graph Theory Playlist", url: "https://www.youtube.com/watch?v=eQA-m22wjTQ&list=PLauivoElc3ggagradg8MfOZreCMmXMmJ-", desc: "Video tutorials on graphs" }
      ]
    },
    {
      topic: "Data Structures",
      topics: ["Trees", "Heaps", "Segment Trees"],
      resources: [
        { name: "CP Algorithms", url: "https://cp-algorithms.com/", desc: "Comprehensive DS & algorithms guide" },
        { name: "CSES Problem Set", url: "https://cses.fi/problemset/", desc: "Practice problems for all topics" }
      ]
    }
  ];

  const practiceResources = [
    {
      title: "Rating-Wise Practice",
      resources: [
        { name: "CP31 Sheet", url: "https://www.tle-eliminators.com/cp-sheet", desc: "Structured practice sheet, good for beginners" },
        { name: "Codeforces Problemset", url: "https://codeforces.com/problemset", desc: "Filter by difficulty" },
      ]
    },
    {
      title: "Topic-Wise Practice",
      resources: [
        { name: "CSES Problemset", url: "https://cses.fi/problemset/", desc: "A good collection of advanced problems" },
        { name: "Codeforces Problemset", url: "https://codeforces.com/problemset", desc: "Filter based on topic" }
      ]
    }
  ];

  const contests = [
    {
      level: "For Beginners",
      list: [
        "Codechef starters (every Wednesday)",
        "Codeforces Div 3, Div 4"
      ]
    },
    {
      level: "Intermediate & Advanced",
      list: [
        "Codeforces (all Divisions)",
        "Codechef starters",
        "LeetCode Weekly and Biweekly"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-matrix-100 via-matrix-200 to-emerald-400 bg-clip-text text-transparent">
              Resources
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">Your complete roadmap to mastering CP</p>
        </div>

        {/* Featured Playlist */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-matrix-200" size={28} />
            <h2 className="text-2xl font-mono font-bold text-white">Featured Playlist</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 items-start">
            <div className="glass-card rounded-lg p-5 hover:border-matrix-200/40 transition-all group">
              <div className="relative pb-[56.25%] overflow-hidden rounded mb-4">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/videoseries?list=PLauivoElc3ggagradg8MfOZreCMmXMmJ-"
                  title="A very good playlist to learn the basics and start"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white text-lg group-hover:text-matrix-200 transition-colors mb-2">
                    Fundamentals & Getting Started
                  </h3>
                  <p className="text-sm text-zinc-400">Great starting point to learn fundamentals and begin solving problems.</p>
                </div>
                <a
                  href="https://youtube.com/playlist?list=PLauivoElc3ggagradg8MfOZreCMmXMmJ-&si=z6Klj-Mts4nEgX4o"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="text-zinc-500 group-hover:text-matrix-200 transition-colors flex-shrink-0" size={18} />
                </a>
              </div>
            </div>

            <div className="glass-card rounded-lg p-5">
              <h4 className="font-semibold text-white mb-3 font-mono flex items-center gap-2">
                <span className="w-1 h-4 bg-matrix-200" />
                How to use this playlist
              </h4>
              <ul className="text-sm text-zinc-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-matrix-200 mt-0.5">•</span>
                  <span>Watch videos in order to build a strong foundation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-matrix-200 mt-0.5">•</span>
                  <span>Pause and solve example problems alongside the videos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-matrix-200 mt-0.5">•</span>
                  <span>Repeat concepts you find difficult and practice related problems afterwards.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Topic-Based Learning */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-matrix-200" size={28} />
            <h2 className="text-2xl font-mono font-bold text-white">Topic-Based Learning</h2>
          </div>

          <div className="grid gap-4">
            {learningResources.map((section, idx) => (
              <div key={idx} className="glass-card rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white text-lg font-mono">{section.topic}</h3>
                    <div className="flex gap-2 flex-wrap">
                      {section.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs font-mono bg-matrix-200/10 text-matrix-200 border border-matrix-200/20"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {section.resources.map((resource, resourceIdx) => (
                    <div
                      key={resourceIdx}
                      className="bg-zinc-900/30 border border-white/10 rounded-lg p-4 hover:border-matrix-200/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-zinc-300 group-hover:text-matrix-200 transition-colors inline-flex items-center gap-2"
                          >
                            {resource.name}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <p className="text-sm text-zinc-500 mt-1">{resource.desc}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(resource.url, resource.name)}
                          className={`flex-shrink-0 p-2 rounded-lg border transition-all ${copiedUrl === resource.name
                              ? "bg-matrix-200/20 border-matrix-200 text-matrix-200 shadow-glow-sm"
                              : "bg-zinc-900/50 border-white/10 text-zinc-400 hover:border-matrix-200/40 hover:text-matrix-200"
                            }`}
                          title="Copy link"
                        >
                          {copiedUrl === resource.name ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Practice Resources */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-matrix-200" size={28} />
            <h2 className="text-2xl font-mono font-bold text-white">Practice Resources</h2>
          </div>

          {practiceResources.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="font-semibold text-white mb-3 font-mono flex items-center gap-2">
                <span className="w-1 h-4 bg-matrix-200" />
                {section.title}
              </h3>
              <div className="grid gap-3">
                {section.resources.map((resource, resourceIdx) => (
                  <div
                    key={resourceIdx}
                    className="glass-card rounded-lg p-4 hover:border-matrix-200/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-zinc-300 group-hover:text-matrix-200 transition-colors inline-flex items-center gap-2"
                        >
                          {resource.name}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <p className="text-sm text-zinc-500 mt-1">{resource.desc}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(resource.url, resource.name)}
                        className={`flex-shrink-0 p-2 rounded-lg border transition-all ${copiedUrl === resource.name
                            ? "bg-matrix-200/20 border-matrix-200 text-matrix-200 shadow-glow-sm"
                            : "bg-zinc-900/50 border-white/10 text-zinc-400 hover:border-matrix-200/40 hover:text-matrix-200"
                          }`}
                        title="Copy link"
                      >
                        {copiedUrl === resource.name ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="glass-card rounded-lg p-5 mt-6 border-l-4 border-matrix-200">
            <p className="text-sm text-zinc-400">
              <span className="font-semibold text-white">Note:</span> Both topic-wise and rating-wise practice are needed.
              When you study a topic, practice topic-wise problems to strengthen it. Alongside, keep practicing random
              rating-wise problems in general.
            </p>
          </div>
        </section>

        {/* Coding Platforms */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Code className="text-matrix-200" size={28} />
            <h2 className="text-2xl font-mono font-bold text-white">Coding Platforms</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform, idx) => (
              <a
                key={idx}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-lg p-5 hover:border-matrix-200/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {platform.logo?.src && (
                      <Image
                        width={32}
                        height={32}
                        src={platform.logo.src}
                        alt={platform.logo.alt || platform.name}
                        className="w-8 h-8 rounded object-contain"
                        loading="lazy"
                      />
                    )}
                    <h3 className="font-semibold text-white text-lg group-hover:text-matrix-200 transition-colors font-mono">
                      {platform.name}
                    </h3>
                  </div>
                  <ExternalLink className="text-zinc-500 group-hover:text-matrix-200 transition-colors" size={18} />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Contest Strategy */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-matrix-200" size={28} />
            <h2 className="text-2xl font-mono font-bold text-white">Contest Strategy</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {contests.map((contest, idx) => (
              <div
                key={idx}
                className="glass-card rounded-lg p-6"
              >
                <h3 className="font-semibold text-white mb-3 font-mono flex items-center gap-2">
                  <span className="w-1 h-4 bg-matrix-200" />
                  {contest.level}
                </h3>
                <ul className="space-y-2.5">
                  {contest.list.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-zinc-400 text-sm flex items-start gap-2">
                      <span className="text-matrix-200 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-lg p-5 border-l-4 border-matrix-200">
            <h3 className="font-semibold text-white mb-3 font-mono">Contest Tips</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-matrix-200 font-bold mt-0.5">•</span>
                <span>Be consistent and don&apos;t miss any contests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-matrix-200 font-bold mt-0.5">•</span>
                <span>Upsolve at least 1-2 problems after each contest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-matrix-200 font-bold mt-0.5">•</span>
                <span>Analyze the contest and note down silly mistakes to avoid repeating them</span>
              </li>
            </ul>
          </div>
        </section>

        {/* How to Proceed */}
        <section>
          <div className="glass-card rounded-lg p-8 border-l-4 border-matrix-200">
            <h2 className="text-2xl font-mono font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-matrix-200" />
              How to Proceed
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="text-2xl font-mono font-bold text-matrix-200">1</span>
                <span className="text-zinc-300 pt-1">Start studying the topics and keep practicing problems alongside</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl font-mono font-bold text-matrix-200">2</span>
                <span className="text-zinc-300 pt-1">You can start giving contests after learning the basics. Just be consistent and have patience</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl font-mono font-bold text-matrix-200">3</span>
                <span className="text-zinc-300 pt-1">When you study a topic, practice lots of problems on it before proceeding to the next</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl font-mono font-bold text-matrix-200">4</span>
                <span className="text-zinc-300 pt-1">When stuck on a problem, try to debug yourself first. If unable, look at editorials or ask for help</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resources;