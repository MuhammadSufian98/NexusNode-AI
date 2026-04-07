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

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const avatarInputRef = useRef(null);

  const { user, loading, error, fetchProfile, updateProfile, uploadAvatar } =
    useProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setNameDraft(user?.name || "");
    setEmailDraft(user?.email || "");
  }, [user?.name, user?.email]);

  useEffect(() => {
    if (user?.avatarUrl) {
      console.log("[PROFILE][AVATAR_URL]", user.avatarUrl);
    }
  }, [user?.avatarUrl]);

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
      console.log("[PROFILE][AVATAR_UPLOAD]", result?.user?.avatarUrl || result?.user?.avatar || "");
      toast.success("Avatar Updated");
    }
    event.target.value = "";
  };

  // Animation Variants
  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full h-102.5 flex gap-4 p-1 select-none overflow-hidden"
    >
      {/* 1. IDENTITY NODE (LEFT COLUMN) */}
      <motion.div
        variants={containerVariants}
        className="flex-[0.4] bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm"
      >
        <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-rose-500/10 to-orange-500/10" />

        <div className="relative mb-4">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div className="w-28 h-28 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative overflow-hidden group/avatar">
            {user?.avatarUrl || user?.avatar ? (
              <Image
                src={user.avatarUrl || user.avatar}
                alt="Profile avatar"
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <User size={48} />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <button
                type="button"
                disabled={loading}
                onClick={() => avatarInputRef.current?.click()}
                className="p-2 rounded-lg"
              >
                <Camera size={24} />
              </button>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white shadow-lg">
            <BadgeCheck size={16} />
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          {user?.name || "Operator"}
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
          {user?.clearance || "Lvl 4"}
        </p>

        <div className="w-full space-y-2 mt-2">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase">
              Nodes Managed
            </span>
            <span className="text-sm font-black text-slate-800">
              {user?.nodesCount || 0}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase">
              Security Clearance
            </span>
            <span className="text-[10px] font-black text-emerald-600 uppercase">
              {user?.clearance || "Lvl 4"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. CONFIGURATION HUB (RIGHT COLUMN) */}
      <motion.div
        variants={containerVariants}
        className="flex-[0.6] bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col shadow-sm relative"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Fingerprint size={14} className="text-rose-600" /> Identity
              Configuration
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Update your operator credentials.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
          >
            <RefreshCw size={18} className={isEditing ? "rotate-180" : ""} />
          </button>
        </div>

        <form className="flex-1 space-y-5" onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Full Identity
              </label>
              <div className="relative group">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                  size={14}
                />
                <input
                  disabled={!isEditing}
                  type="text"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 text-sm font-bold focus:border-rose-600 focus:bg-white outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Neural Mail
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                  size={14}
                />
                <input
                  disabled={!isEditing}
                  type="email"
                  value={emailDraft}
                  onChange={(event) => setEmailDraft(event.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 text-sm font-bold focus:border-rose-600 focus:bg-white outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
              {error}
            </p>
          )}

          <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-900 uppercase">
                Privacy Shield Active
              </p>
              <p className="text-[9px] text-rose-700 font-medium">
                Your PII is being masked using AES-256 protocols before
                visualization.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-50 flex justify-end">
            <GlassButton
              disabled={!isEditing}
              type="submit"
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-all disabled:opacity-30"
            >
              <Save size={14} /> Save Configuration
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
