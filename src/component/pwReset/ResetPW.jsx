import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";
import { LoaderCircle } from "lucide-react";

const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    // Used to trigger pure Tailwind entrance animations on mount
    const [isMounted, setIsMounted] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);
    const [valid, setValid] = useState({ valid: null, message: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Trigger mount animation
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        VerifyToken();
    }, [token]);

    const VerifyToken = async () => {
        if (!token) {
            setError("Invalid reset token.");
            setValid({ valid: false, message: "Invalid reset token." });
            setTokenValid(false);
            return;
        }

        try {
            const res = await api.get(`api/verify-reset-token/${token}`);
            // console.log(res.data);
            setValid({ valid: true, message: res.data?.message || "" });
            setTokenValid(true);
        } catch (error) {
            const data = error.response?.data || {};
            // console.log(data || error.message);
            setValid({
                valid: false,
                message: data.message || "Reset link expired or invalid."
            });
            setError(data.message || "Reset link expired or invalid.");
            setTokenValid(false);
        }
    };
    // console.log(valid)

    const handleChange = (e) => {
        setError("");
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password.length < 8) {
            return setError("Password must be at least 8 characters long.");
        }
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }

        try {
            setLoading(true);
            await api.post(`api/reset-password/${token}`, {
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            setSuccess(true);

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Failed to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center 
        justify-center p-4 relative overflow-hidden" style={fontLight}>

            {/* Subtle background ambient glow for the professional theme */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

            {/* Container with Tailwind transition for the mount animation */}
            <div
                className={`w-full max-w-md bg-white rounded-3xl  border border-slate-100 p-8 sm:p-10 relative z-10 transition-all duration-700 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                {/* Header Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg shadow-orange-500/20 mb-5 text-white" style={fontBold}>
                        <Lock size={28} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight" style={fontBold}>
                        Secure your account
                    </h2>
                    <p className="text-center text-slate-500 text-sm leading-relaxed" style={fontLight}>
                        Please enter a new password below. Make sure it's at least 8 characters long.
                    </p>
                </div>

                {/* Status Messages with standard conditional rendering */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${error || success ? 'max-h-24 mb-6' : 'max-h-0 mb-0'}`}>
                    {error && (
                        <div className="p-4 bg-red-50/80 border border-red-100 rounded-xl flex items-start">
                            <AlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" size={18} />
                            <p className="text-sm text-red-700 font-medium" style={fontLight}>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-start">
                            <CheckCircle2 className="text-emerald-600 mt-0.5 mr-3 shrink-0" size={18} />
                            <p className="text-sm text-emerald-700 font-medium" style={fontLight}>
                                Password updated successfully! Redirecting...
                            </p>
                        </div>
                    )}                </div>

                {/* Either show the reset form or an expiration message based on token validity */}
                {tokenValid === null ? (
                    <div className="py-20 text-center text-slate-500">Verifying reset link...</div>
                ) : tokenValid && valid.valid ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-slate-700 mb-2"
                                style={fontBold}
                            >
                                New Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading || success}
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-semibold text-slate-700 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    disabled={loading || success}
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="w-full bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center"
                            >
                                {loading && (
                                    <LoaderCircle className="mr-2 h-3 w-3 animate-spin text-white" strokeWidth={2.5} />
                                )}
                                Reset Password
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-3xl border border-slate-100 bg-red-50/70 p-8 text-center">
                        <AlertCircle className="mx-auto text-red-500 mb-4" size={36} />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2" style={fontBold}>
                            Reset link expired or invalid
                        </h3>
                        <p className="text-sm text-slate-600 mb-4" style={fontLight}>
                            Your password reset link is no longer valid. Please request a new reset link and continue from there.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="mt-2 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            Request New Link
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResetPassword;