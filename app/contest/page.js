'use client'

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Clock, Calendar } from "lucide-react"
import axios from "axios"
import dayjs from "dayjs"
import Link from "next/link"
import Image from "next/image"

const platformLogos = {
  codeforces: "https://sta.codeforces.com/s/44094/favicon-32x32.png",
  leetcode: "https://leetcode.com/static/images/LeetCode_logo.png",
  codechef: "https://www.codechef.com/favicon.ico",
  atcoder: "https://atcoder.jp/favicon.ico",
  geeksforgeeks: "https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg"
}

const platformColors = {
  codeforces: "bg-red-500/10 text-red-400 border-red-500/20",
  leetcode: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  codechef: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  atcoder: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  geeksforgeeks: "bg-green-500/10 text-green-400 border-green-500/20"
}

// Countdown Timer Component
function CountdownTimer({ contestStartDate }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs()
      const start = dayjs(contestStartDate)
      const diff = start.diff(now)

      if (diff <= 0) {
        setTimeLeft("Started")
        clearInterval(timer)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [contestStartDate])

  return (
    <div className="flex items-center gap-1.5 text-sm font-mono text-matrix-200">
      <Clock className="w-4 h-4" />
      {timeLeft}
    </div>
  )
}

export default function Component() {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [contests, setContests] = useState({ previous: [], upcoming: [] })
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const startDate = dayjs().subtract(3, 'months').startOf('day').toISOString()
        const endDate = dayjs().add(3, 'months').endOf('day').toISOString()

        const response = await axios.get("https://node.codolio.com/api/contest-calendar/v1/all/get-contests", {
          params: { startDate, endDate }
        })

        const allContests = response.data.data
          .filter(event => event.platform !== 'geeksforgeeks')
          .sort((a, b) => new Date(a.contestStartDate) - new Date(b.contestStartDate))

        const now = dayjs()
        const previousContests = allContests
          .filter(contest => dayjs(contest.contestStartDate).isBefore(now))
          .sort((a, b) => new Date(b.contestStartDate) - new Date(a.contestStartDate))
        const upcomingContests = allContests.filter(contest => dayjs(contest.contestStartDate).isAfter(now))

        setContests({ previous: previousContests, upcoming: upcomingContests })
      } catch (error) {
        console.error("Error fetching contests:", error)
      }
    }

    fetchContests()
  }, [])

  const previousMonth = () => setCurrentDate(currentDate.subtract(1, 'month'))
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'))
  const daysInMonth = Array.from({ length: currentDate.daysInMonth() }, (_, i) => i + 1)
  const startDayOfWeek = currentDate.startOf('month').day()

  const eventsByDate = [...contests.previous, ...contests.upcoming].reduce((acc, event) => {
    const eventDate = dayjs(event.contestStartDate).format('YYYY-MM-DD')
    if (!acc[eventDate]) acc[eventDate] = []
    acc[eventDate].push(event)
    return acc
  }, {})

  const ContestGrid = ({ contests }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contests.map((event, index) => {
        const isUpcoming = dayjs(event.contestStartDate).isAfter(dayjs())
        const isPast = dayjs(event.contestStartDate).isBefore(dayjs())

        return (
          <div
            key={index}
            className="glass-card rounded-lg p-5 hover:border-matrix-200/40 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Platform Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image
                  src={platformLogos[event.platform]}
                  alt={event.platform}
                  width={20}
                  height={20}
                  className="rounded"
                />
                <span className={`text-xs font-mono px-2 py-1 rounded border ${platformColors[event.platform]}`}>
                  {event.platform.charAt(0).toUpperCase() + event.platform.slice(1)}
                </span>
              </div>

              {/* Status Badge */}
              {isUpcoming ? (
                <span className="text-xs font-mono px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                  Upcoming
                </span>
              ) : isPast ? (
                <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-700/50 text-zinc-400 border border-zinc-600/20">
                  Past
                </span>
              ) : null}
            </div>

            {/* Contest Name */}
            <h3 className="text-white font-medium mb-3 line-clamp-2 group-hover:text-matrix-200 transition-colors">
              {event.contestName}
            </h3>

            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="font-mono">
                {dayjs(event.contestStartDate).format("MMM D, HH:mm")}
              </span>
            </div>

            {/* Countdown Timer (only for upcoming) */}
            {isUpcoming && <CountdownTimer contestStartDate={event.contestStartDate} />}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              <Link
                href={event.contestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-matrix-200/10 border border-matrix-200/20 rounded-lg text-matrix-200 hover:bg-matrix-200/20 transition-all text-sm font-mono"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </Link>
              {(event.platform === 'leetcode' || event.platform === 'codeforces') && isPast && (
                <Link
                  href={`/pastcontest?contestId=${event.contestCode}&contestName=${encodeURIComponent(event.contestName)}&platform=${event.platform}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900/50 border border-white/10 rounded-lg text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200 transition-all text-sm font-mono"
                >
                  Leaderboard
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-matrix-100 via-matrix-200 to-emerald-400 bg-clip-text text-transparent">
            Contests
          </span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Track upcoming competitive programming contests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${activeTab === "upcoming"
              ? "bg-matrix-200 text-black shadow-glow-md"
              : "glass border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200"
            }`}
        >
          Upcoming ({contests.upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab("previous")}
          className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${activeTab === "previous"
              ? "bg-matrix-200 text-black shadow-glow-md"
              : "glass border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200"
            }`}
        >
          Past ({contests.previous.length})
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${activeTab === "calendar"
              ? "bg-matrix-200 text-black shadow-glow-md"
              : "glass border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200"
            }`}
        >
          Calendar
        </button>
      </div>

      {/* Content */}
      {activeTab === "upcoming" && <ContestGrid contests={contests.upcoming} />}
      {activeTab === "previous" && <ContestGrid contests={contests.previous} />}

      {activeTab === "calendar" && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-mono font-bold text-white">
              {currentDate.format("MMMM YYYY")}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="p-2 rounded-lg bg-zinc-900/50 border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg bg-zinc-900/50 border border-white/10 text-zinc-300 hover:border-matrix-200/40 hover:text-matrix-200 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-sm font-mono font-medium text-zinc-400 text-center pb-2">
                {day}
              </div>
            ))}

            {Array.from({ length: startDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {daysInMonth.map((day) => {
              const dateStr = currentDate.year() + '-' + (currentDate.month() + 1).toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0')
              const events = eventsByDate[dateStr]
              const isToday = currentDate.date() === day && currentDate.month() === dayjs().month() && currentDate.year() === dayjs().year()

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 rounded-lg border border-white/10 hover:border-matrix-200/40 transition-all ${events ? 'bg-matrix-200/5' : 'bg-zinc-900/30'
                    } ${isToday ? 'ring-2 ring-matrix-200' : ''}`}
                >
                  <div className="text-center text-zinc-300 font-mono text-sm font-semibold">{day}</div>
                  {events && (
                    <div className="flex flex-col gap-1 mt-1">
                      {events.slice(0, 2).map((event, index) => (
                        <Link
                          key={index}
                          href={event.contestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div
                            className={`text-xs px-1.5 py-0.5 rounded border font-mono ${platformColors[event.platform]} overflow-hidden whitespace-nowrap text-ellipsis`}
                            title={event.contestName}
                          >
                            {event.platform}
                          </div>
                        </Link>
                      ))}
                      {events.length > 2 && (
                        <div className="text-xs text-matrix-200 font-mono text-center">
                          +{events.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}