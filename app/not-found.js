"use client";
import Link from "next/link";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="text-center">
        {/* 404 with Glitch Effect */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-mono font-bold text-green-500 glitch-text">
            404
          </h1>
          {/* We use global jsx or strict double quotes to prevent linter errors */}
          <style jsx>{`
            .glitch-text {
              position: relative;
              animation: glitch-main 2s infinite;
            }

            .glitch-text::before,
            .glitch-text::after {
              content: "404"; /* Ensure double quotes are used here */
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }

            .glitch-text::before {
              color: #22c55e;
              animation: glitch-before 0.3s infinite;
              clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
              z-index: -1;
            }

            .glitch-text::after {
              color: #10b981;
              animation: glitch-after 0.3s infinite;
              clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
              z-index: -1;
            }

            @keyframes glitch-main {
              0%, 100% { transform: translate(0); }
              20% { transform: translate(-2px, 2px); }
              40% { transform: translate(-2px, -2px); }
              60% { transform: translate(2px, 2px); }
              80% { transform: translate(2px, -2px); }
            }

            @keyframes glitch-before {
              0%, 100% { transform: translate(0); }
              33% { transform: translate(-4px, 0); }
              66% { transform: translate(4px, 0); }
            }

            @keyframes glitch-after {
              0%, 100% { transform: translate(0); }
              33% { transform: translate(4px, 0); }
              66% { transform: translate(-4px, 0); }
            }
          `}</style>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Error Messages */}
        <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
          System Error: Node Not Found
        </h2>
        <p className="text-zinc-400 mb-2 font-mono text-sm sm:text-base">
          The page you are looking for has been garbage collected.
        </p>
        <p className="text-zinc-500 mb-8 font-mono text-xs sm:text-sm">
          Error Code: <span className="text-red-400">SEGMENTATION_FAULT</span>
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-mono font-semibold rounded-lg shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-300"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
}