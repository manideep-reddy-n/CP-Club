"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Login failed.");
      }

      setSuccess(true);

      // Store user in auth context
      if (data?.member) {
        login({
          _id: data.member._id,
          username: data.member.username,
          name: data.member.name,
          email: data.member.email,
          platforms: data.member.platforms,
        });
      }

      setForm({
        username: "",
        password: "",
      });

      if (data?.member?.username) {
        router.push(`/profile/${data.member.username}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-8">
        <h1 className="text-3xl sm:text-4xl font-mono font-bold text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-zinc-400 text-sm mb-8">
          Sign in to access your profile and compete on leaderboards
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
            Login successful. Redirecting to your profile...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              Username or Email *
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="Enter your username or email"
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200 placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Enter your password"
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200 placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-matrix-200 text-black font-mono font-bold px-6 py-3 hover:bg-matrix-100 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-matrix-200 hover:text-matrix-100 font-medium transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
