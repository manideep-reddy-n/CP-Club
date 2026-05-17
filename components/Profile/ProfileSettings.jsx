"use client";

import React, { useState } from "react";
import { Edit, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const normalizeProfileData = (value) => ({
  _id: value?._id || null,
  username: value?.username || null,
  cf_username: value?.cf_username ?? value?.platforms?.cf_username ?? "",
  lc_username: value?.lc_username ?? value?.platforms?.lc_username ?? "",
  cc_username: value?.cc_username ?? value?.platforms?.cc_username ?? "",
  cses_id: value?.cses_id ?? value?.platforms?.cses_id ?? "",
  year: value?.year ?? "",
});

const ProfileSettings = ({ userData, onUpdate }) => {
  const { updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    cf_username: userData.cf_username || "",
    lc_username: userData.lc_username || "",
    cc_username: userData.cc_username || "",
    cses_id: userData.cses_id || "",
    year: userData.year || "",
  });
  const [displayData, setDisplayData] = useState(normalizeProfileData(userData));

  React.useEffect(() => {
    const normalized = normalizeProfileData(userData);
    setDisplayData(normalized);
    setFormData({
      cf_username: normalized.cf_username || "",
      lc_username: normalized.lc_username || "",
      cc_username: normalized.cc_username || "",
      cses_id: normalized.cses_id || "",
      year: normalized.year || "",
    });
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccess("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Prepare form data with proper null handling
      const submitData = {
        userId: userData._id,
        cf_username: formData.cf_username?.trim() || "",
        lc_username: formData.lc_username?.trim() || "",
        cc_username: formData.cc_username?.trim() || "",
        cses_id: formData.cses_id?.trim() || "",
        year: formData.year?.toString().trim() || "",
      };

      const response = await fetch(`/api/members/${userData.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Failed to update profile. Please try again.");
        return;
      }

      if (!data?.member) {
        setError("Invalid response from server. Please refresh and try again.");
        return;
      }

      setSuccess("Profile updated successfully!");

      // Update auth context with proper data
      updateUser({
        platforms: {
          cf_username: data.member.platforms?.cf_username || null,
          lc_username: data.member.platforms?.lc_username || null,
          cc_username: data.member.platforms?.cc_username || null,
          cses_id: data.member.platforms?.cses_id || null,
        },
        year: data.member.year ?? null,
      });

      // update local display immediately with response data
      setDisplayData(normalizeProfileData(data.member));

      // Call parent callback if provided
      if (onUpdate) {
        onUpdate(data.member);
      }

      // Small delay to ensure UI updates before closing edit mode
      setTimeout(() => {
        setIsEditing(false);
        router.refresh();
      }, 500);
    } catch (_err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      cf_username: displayData.cf_username || "",
      lc_username: displayData.lc_username || "",
      cc_username: displayData.cc_username || "",
      cses_id: displayData.cses_id || "",
      year: displayData.year || "",
    });
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  if (!isEditing) {
    return (
      <div className="glass-card rounded-xl px-6 py-6 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-white font-mono text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-matrix-200" />
            Coding Platforms
          </p>
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-matrix-200/10 text-matrix-200 hover:bg-matrix-200/20 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="space-y-3">
          {[
            { key: "cf_username", label: "Codeforces", icon: "🔴" },
            { key: "lc_username", label: "LeetCode", icon: "🟡" },
            { key: "cc_username", label: "CodeChef", icon: "🟤" },
            { key: "cses_id", label: "CSES", icon: "🔵" },
          ].map((platform) => (
            <div
              key={platform.key}
              className="px-4 py-3 rounded-lg bg-zinc-900/50 border border-white/10"
            >
              <p className="text-xs text-zinc-400 mb-1">{platform.label}</p>
              <p className="text-sm text-white font-mono">
                {displayData[platform.key] ? (
                  <span className="flex items-center gap-2">
                    <span>{platform.icon}</span>
                    {displayData[platform.key]}
                  </span>
                ) : (
                  <span className="text-zinc-500 italic">Not set</span>
                )}
              </p>
            </div>
          ))}

          {/* Year card */}
          <div className="px-4 py-3 rounded-lg bg-zinc-900/50 border border-white/10">
            <p className="text-xs text-zinc-400 mb-1">Year (B.Tech)</p>
            <p className="text-sm text-white font-mono">
              {displayData.year ? (
                <span>{displayData.year}</span>
              ) : (
                <span className="text-zinc-500 italic">Not set</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <p className="font-semibold text-white font-mono text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-matrix-200" />
          Edit Coding Platforms
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200 flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-2">
            Codeforces Username
          </label>
          <input
            type="text"
            name="cf_username"
            value={formData.cf_username}
            onChange={handleChange}
            placeholder="Leave empty to remove"
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200 placeholder:text-zinc-600"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-2">
            LeetCode Username
          </label>
          <input
            type="text"
            name="lc_username"
            value={formData.lc_username}
            onChange={handleChange}
            placeholder="Leave empty to remove"
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200 placeholder:text-zinc-600"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-2">
            CodeChef Username
          </label>
          <input
            type="text"
            name="cc_username"
            value={formData.cc_username}
            onChange={handleChange}
            placeholder="Leave empty to remove"
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200 placeholder:text-zinc-600"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-2">
            CSES User ID
          </label>
          <input
            type="text"
            name="cses_id"
            value={formData.cses_id}
            onChange={handleChange}
            placeholder="Leave empty to remove"
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200 placeholder:text-zinc-600"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-2">
            Year of B.Tech (optional)
          </label>
          <input
            type="text"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="e.g., 2024"
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-matrix-200 placeholder:text-zinc-600"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-matrix-200 text-black font-mono font-bold px-4 py-3 hover:bg-matrix-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 font-mono font-bold px-4 py-3 hover:border-matrix-200/40 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
