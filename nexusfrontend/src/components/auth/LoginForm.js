"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Fingerprint } from "lucide-react";
import GlassButton from "@/component/Button";
import { useAuth } from "@/store/authStore";

const LoginFormInput = ({
  icon,
  label,
  placeholder,
  type = "text",
  isPassword,
  showPass,
  onTogglePass,
  value,
  onChange,
}) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 ml-0.5">
      {label}
    </label>
    <div className="form-input-container group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input-field"
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={onTogglePass}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
        >
          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  </div>
);

const LoginForm = () => {
  const router = useRouter();
  const {
    loginForm,
    loginShowPass,
    loading,
    error,
    setLoginField,
    toggleLoginPass,
    login,
    switchView,
  } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login();
    if (ok) {
      router.push("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="w-full lg:w-1/2 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-88 p-6 lg:p-8 bg-white/20 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[2.5rem]">
        <header className="mb-6">
          <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-rose-200">
            <Fingerprint className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            System Login
          </h1>
          <p className="text-slate-500 text-[13px] font-medium leading-tight">
            Access decentralized neural nodes.
          </p>
        </header>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <LoginFormInput
            icon={<Mail size={14} />}
            label="Node ID"
            placeholder="admin@nexus.ai"
            value={loginForm.email}
            onChange={(e) => setLoginField("email", e.target.value)}
          />
          <LoginFormInput
            icon={<Lock size={14} />}
            label="Access Key"
            placeholder="••••••••"
            type={loginShowPass ? "text" : "password"}
            isPassword
            showPass={loginShowPass}
            onTogglePass={toggleLoginPass}
            value={loginForm.password}
            onChange={(e) => setLoginField("password", e.target.value)}
          />
          {error ? (
            <p className="text-xs text-rose-600 font-semibold">{error}</p>
          ) : null}
          <GlassButton
            type="submit"
            className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg mt-2 group"
          >
            {loading ? "Connecting..." : "Connect"}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </GlassButton>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200/50 flex flex-col items-center">
          <button
            onClick={() => switchView("signup")}
            className="group text-slate-400 font-bold text-[10px] uppercase tracking-widest"
          >
            New Operator?
            <span className="text-rose-600 group-hover:underline ml-1">
              Initialize
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
