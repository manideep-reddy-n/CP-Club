import React from "react";
import Image from "next/image";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProfileSettings from "./ProfileSettings";

const ProfileSidebar = ({ data }) => {
  const { user } = useAuth();
  const isOwnProfile = user?.username?.toLowerCase() === data.user_data?.username?.toLowerCase();
  const ratingData = [
    {
      image: "/svgs/cf.svg",
      platform: "Codeforces",
      rating: data.codeForcesData?.rating ?? 0,
    },
    {
      image: "/svgs/lc.svg",
      platform: "Leetcode",
      rating: data.leetCodeData?.userContestDetails?.rating?.toFixed(0) ?? 0,
    },
    {
      image: "/svgs/cc.svg",
      platform: "Codechef",
      rating: parseInt(data.codeChefData?.currentRating, 10) || 0,
    },
  ];

  const platformsData = [
    {
      image: "/svgs/cf.svg",
      platform: "Codeforces",
      username: data.user_data.cf_username,
      link: "https://codeforces.com/profile",
    },
    {
      image: "/svgs/lc.svg",
      platform: "Leetcode",
      username: data.user_data.lc_username,
      link: "https://leetcode.com/u",
    },
    {
      image: "/svgs/cc.svg",
      platform: "Codechef",
      username: data.user_data.cc_username,
      link: "https://www.codechef.com/users",
    },
  ];

  if (data.user_data?.cses_id) {
    platformsData.push({
      image: "/images/cses.png",
      platform: "CSES",
      username: data.user_data.cses_id,
      link: "https://cses.fi/user",
    });
  }

  const filteredPlatforms = platformsData.filter((item) => item.username);

  return (
    <div className="grid gap-4 sm:gap-6">
      {/* User Details Card */}
      <div className="glass-card rounded-xl px-5 sm:px-6 py-6 gap-4 flex flex-col justify-center items-center">
        {/* Avatar with Green Ring */}
        {data.codeForcesData?.avatar ? (
          <Image
            width={112}
            height={112}
            src={data.codeForcesData?.titlePhoto}
            alt={data.user_data?.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-green-500 ring-offset-4 ring-offset-black"
          />
        ) : (
          <div className="bg-gradient-to-br from-matrix-200 to-emerald-600 px-4 py-2 rounded-full w-24 h-24 sm:w-28 sm:h-28 text-black flex justify-center items-center ring-4 ring-green-500 ring-offset-4 ring-offset-black">
            <p className="font-bold text-3xl sm:text-4xl font-mono">
              {data.user_data?.name?.charAt(0).toUpperCase()}
            </p>
          </div>
        )}

        {/* Username with Glitch Effect */}
        <div className="text-center">
          <p className="text-xl font-bold text-white font-mono glitch-text group relative inline-block">
            <span className="relative z-10">{data.user_data?.name}</span>
          </p>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Mumbai, India
          </p>
        </div>

        {/* Contest Rankings */}
        <p className="pt-2 text-zinc-400 text-sm font-mono uppercase tracking-wider border-t border-white/10 w-full text-center mt-2">
          Contest Rankings
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
          {ratingData.map((item, index) => (
            <div
              key={index}
              className="py-3 bg-zinc-900/50 rounded-lg border border-white/10 hover:border-matrix-200/40 transition-all"
            >
              <p className="text-center text-sm text-zinc-400 mb-2 font-mono">
                {item.platform}
              </p>
              <div className="flex justify-center items-center gap-4">
                <Image
                  src={item.image}
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  alt={item.platform}
                />
                <p className="text-2xl font-bold text-matrix-200 font-mono animate-pulse">
                  {item.rating}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CSES Link */}
        {data.user_data?.cses_id ? (
          <div className="pt-2 w-full">
            <Link
              href={`/cses/${encodeURIComponent(data.user_data.cses_id)}`}
              className="w-full flex items-center justify-between bg-zinc-900/50 border border-white/10 p-3 rounded-lg hover:border-matrix-200/40 hover:bg-zinc-800/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/images/cses.png"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  alt="CSES"
                />
                <div className="text-sm">
                  <p className="font-medium text-white font-mono">CSES Summary</p>
                  <p className="text-xs text-zinc-400">{data.user_data.cses_id}</p>
                </div>
              </div>
              <SquareArrowOutUpRight className="w-4 h-4 text-matrix-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* Platform Links Card or Settings */}
      {isOwnProfile ? (
        <ProfileSettings userData={data.user_data} onUpdate={null} />
      ) : (
        <div className="glass-card rounded-xl px-6 py-6 flex flex-col justify-center">
          <p className="font-semibold text-white mb-4 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-matrix-200" />
            Coding Platforms
          </p>
          <div className="flex flex-col gap-2">
            {filteredPlatforms.map((item, index) => (
              <Link
                href={`${item.link}/${item.username}`}
                target="_blank"
                key={index}
                className="flex gap-4 justify-between items-center bg-zinc-900/50 border border-white/10 p-3 hover:border-matrix-200/40 hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer rounded-lg group"
              >
                <div className="flex gap-3 items-center">
                  <Image
                    src={item.image}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    alt={item.platform}
                  />
                  <div className="text-sm">
                    <p className="text-white font-medium">{item.platform}</p>
                    <p className="text-zinc-400 text-xs font-mono">{item.username}</p>
                  </div>
                </div>
                <SquareArrowOutUpRight className="w-4 h-4 text-matrix-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Glitch Effect CSS */}
      <style jsx>{`
        .glitch-text {
          position: relative;
        }

        .glitch-text:hover::before,
        .glitch-text:hover::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          content: "${data.user_data?.name}";
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          color: #22c55e;
          animation: none;
        }

        .glitch-text::after {
          content: "${data.user_data?.name}";
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          color: #06b6d4;
          animation: none;
        }

        .glitch-text:hover::before {
          opacity: 0.8;
          animation: glitch-1 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
        }

        .glitch-text:hover::after {
          opacity: 0.8;
          animation: glitch-2 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
        }

        @keyframes glitch-1 {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes glitch-2 {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(2px, -2px);
          }
          40% {
            transform: translate(2px, 2px);
          }
          60% {
            transform: translate(-2px, -2px);
          }
          80% {
            transform: translate(-2px, 2px);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSidebar;
