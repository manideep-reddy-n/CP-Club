"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const SignupPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    cf_username: "",
    lc_username: "",
    cc_username: "",
    cses_id: "",
    year: "",
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
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Signup failed.");
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
          year: data.member.year ?? null,
        });
      }

      setForm({
        name: "",
        email: "",
        username: "",
        password: "",
        cf_username: "",
        lc_username: "",
        cc_username: "",
        cses_id: "",
        year: "",
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
      <div className="w-full max-w-2xl glass-card rounded-2xl border border-white/10 p-8">
        <h1 className="text-3xl sm:text-4xl font-mono font-bold text-white mb-2">
          Create Your Profile
        </h1>
        <p className="text-zinc-400 text-sm mb-8">
          Required: Name, Email, Site Username, Password. Coding platform handles are optional.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
            Signup successful. Redirecting to your profile...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Site Username *
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-sm text-zinc-400 mb-4 font-mono">
              Optional Coding Platform Handles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="cf_username"
                placeholder="Codeforces username"
                value={form.cf_username}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
              <input
                type="text"
                name="lc_username"
                placeholder="LeetCode username"
                value={form.lc_username}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
              <input
                type="text"
                name="cc_username"
                placeholder="CodeChef username"
                value={form.cc_username}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
              <input
                type="text"
                name="cses_id"
                placeholder="CSES user id"
                value={form.cses_id}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
              <input
                type="text"
                name="year"
                placeholder="Year of B.Tech (optional)"
                value={form.year}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-matrix-200 text-black font-mono font-bold px-6 py-3 hover:bg-matrix-100 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-matrix-200 hover:text-matrix-100 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
