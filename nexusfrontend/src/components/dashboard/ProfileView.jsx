"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  Camera,
  Mail,
  ShieldCheck,
  Fingerprint,
  Save,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import GlassButton from "@/component/Button";
import { useProfile } from "@/store/profileStore";

export function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const avatarInputRef = useRef(null);

  const { user, loading, error, fetchProfile, updateProfile, uploadAvatar, deleteAvatar } =
    useProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (event) => {
    event.preventDefault();
    const result = await updateProfile({
      full_name: nameDraft,
      email: emailDraft,
    });

    if (!result) return;

    toast.success("Identity Reconfigured");
    if (result.emailVerificationRequired) {
      toast.success("Email changed. Verification code sent.");
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    if (result) {
      toast.success("Avatar Updated");
    }
    event.target.value = "";
  };

  const handleAvatarDelete = async () => {
    const result = await deleteAvatar();
    if (result) {
      toast.success("Avatar Removed");
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl overflow-hidden relative select-none p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200 flex items-center justify-center text-rose-600 overflow-hidden shadow-xs">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="Avatar"
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <User size={36} />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              {user?.name || "Anonymous Researcher"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{user?.email || ""}</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/80 hover:bg-rose-100 transition-colors cursor-pointer active:scale-95"
              >
                Change Avatar
              </button>
              {user?.avatar && (
                <button
                  onClick={handleAvatarDelete}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer active:scale-95"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white/80 border border-slate-200/90 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Identity & Credentials
            </h3>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(user?.name || "");
                  setEmailDraft(user?.email || "");
                  setIsEditing(true);
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? nameDraft : user?.name || ""}
                onChange={(e) => setNameDraft(e.target.value)}
                className="w-full bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={isEditing ? emailDraft : user?.email || ""}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="w-full bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-xl text-xs font-bold shadow-xs active:scale-97 cursor-pointer"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProfileView;
