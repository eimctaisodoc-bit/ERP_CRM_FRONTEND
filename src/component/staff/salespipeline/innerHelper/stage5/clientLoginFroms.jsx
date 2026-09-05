import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    X, User, Mail, Lock, KeyRound, ChevronRight,
    Loader2, RefreshCw, ShieldCheck, Building2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import CreatableSelect from "react-select/creatable";
// ClientCredit_

import { waitingNotify, ErrorNotify, SuccessNotify } from "../../../../hotToaster"; // Assuming same path
import { UseAdd } from "../../../../hooks/useadd";

// Inline Style Objects for Roboto Slab
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

export const ClientCreateCredential = ({
    onClose,
    onSuccess,
    organizations = []
}) => {
    const { ClientCredit_ } = UseAdd()
    // console.log('from createCredential', organizations)
    // --------------------- Initial State ---------------------
    const [formData, setFormData] = useState({
        email: null, // Stores the CreatableSelect object
        userName: "",
        password: "",
        confirmPassword: "",
        role: "client" // Default fixed role
    });

    const [loading, setLoading] = useState(false);

    // --------------------- Options Mapping ---------------------
    // Extract unique emails from the organizations array
    const emailOptions = useMemo(() => {
        const emailSet = new Set();
        organizations.forEach(org => {
            if (org.orgEmail) emailSet.add(org.orgEmail);
            if (org.contactPersonEmail) emailSet.add(org.contactPersonEmail);
        });

        return Array.from(emailSet).map(email => ({
            value: email,
            label: email
        }));
    }, [organizations]);
    console.log(emailOptions)
    const [regenerating, setRegenerating] = useState(false);
    // --------------------- Generators ---------------------
    const handleRegeneratePassword = async () => {
        setRegenerating(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
        let newPass = "";
        for (let i = 0; i < 10; i++) {
            newPass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        let newUserName = formData.userName;
        if (formData.email?.value) {
            const baseName = formData.email.value.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
            newUserName = `${baseName}${Math.floor(100 + Math.random() * 900)}`;
        }
        // Both passwords auto-generate and match perfectly
        setFormData(prev => ({
            ...prev,
            password: newPass,
            confirmPassword: newPass,
            userName: newUserName
        }));
        setRegenerating(false);
    };

    // Auto-generate on component mount
    useEffect(() => {
        handleRegeneratePassword();
    }, []);

    // --------------------- Handlers ---------------------
    const handleEmailChange = (selectedOption) => {
        setFormData(prev => {
            let newUserName = prev.userName;

            // Auto-generate a username based on the email if username is currently empty
            if (selectedOption && !prev.userName) {
                const baseName = selectedOption.value.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
                newUserName = `${baseName}${Math.floor(100 + Math.random() * 900)}`;
            }

            return { ...prev, email: selectedOption, userName: newUserName };
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --------------------- API Submit ---------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            ErrorNotify("Please select or enter an email address.");
            return;
        }

        if (!formData.userName) {
            ErrorNotify("Username is required.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            ErrorNotify("Passwords do not match. Please regenerate.");
            return;
        }

        setLoading(true);
        waitingNotify("Creating client credentials...");

        try {
            // Find the matching organization based on the selected email value
            const selectedEmail = formData.email.value;
            const matchedOrg = organizations.find(
                (org) => org.orgEmail === selectedEmail || org.contactPersonEmail === selectedEmail
            );

            const payload = {
                email: selectedEmail,
                userName: formData.userName,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: formData.role,
                // Appended Organization Fields (falling back to null if it's a completely custom email)
                orgEmail: matchedOrg?.orgEmail || null,
                orgTelephone: matchedOrg?.orgTelephone || null,
                contactPersonEmail: matchedOrg?.contactPersonEmail || null,
                contactPersonName: matchedOrg?.contactPersonName || null,
                contactPersonNumber: matchedOrg?.contactPersonNumber || null,
                refID: matchedOrg?._id || null
            };
            // console.log('credential api::', payload)

            ClientCredit_.mutate({ payload }, {
                onSuccess: (res) => {
                    console.log(res)
                    SuccessNotify(res.data?.message || "Client credentials created successfully!");
                },
                onError: (err) => {
                    console.log(err)
                    ErrorNotify(err.response?.data?.message || "Something went wrong.");
                }
            })

            if (onSuccess) onSuccess();
            onClose();

        } catch (err) {
            console.error("Submission Error:", err);
            ErrorNotify(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------- Styles ---------------------
    const customSelectStyles = {
        control: (base, state) => ({
            ...base, backgroundColor: "white", borderColor: state.isFocused ? "#f59e0b" : "#cbd5e1", borderRadius: "0.75rem", padding: "2px 6px", minHeight: "46px", fontSize: "13px", boxShadow: state.isFocused ? "0 0 0 2px rgba(245, 158, 11, 0.15)" : "none", "&:hover": { borderColor: "#f59e0b" }
        }),
        option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? "#f59e0b" : state.isFocused ? "#fef3c7" : "white", color: state.isSelected ? "white" : "#1e293b", fontSize: "13px" }),
    };

    const inputClass = "w-full py-2.5 pl-11 pr-4 rounded-xl border border-slate-300 outline-none text-sm bg-white hover:border-amber-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all";
    const disabledInputClass = "w-full py-2.5 pl-11 pr-10 rounded-xl border border-slate-200 outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed opacity-90 font-medium tracking-widest";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/50 w-full z-50 flex items-center justify-center p-3 backdrop-blur-sm"
            >
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl text-slate-800" style={fontBold}>
                                    Create <span className="text-blue-600">Client Login</span>
                                </h2>
                                <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1" style={fontLight}>
                                    <KeyRound className="w-3 h-3" /> Securely provision access for external clients
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 cursor-pointer hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* Identity & Contact Section */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2" style={fontBold}>
                                <span className="p-1 rounded bg-amber-50 text-amber-500"><User size={14} /></span>
                                Client Identity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs text-slate-600" style={fontBold}>
                                        Client Email <span className="text-red-500">*</span>
                                        <span className="ml-2 text-[10px] font-normal text-slate-400">(Select from organizations or type a new one)</span>
                                    </label>
                                    <CreatableSelect
                                        isClearable
                                        options={emailOptions}
                                        value={formData.email}
                                        onChange={handleEmailChange}
                                        placeholder="Select or type email address..."
                                        formatCreateLabel={(inputValue) => `Use "${inputValue}" as new email`}
                                        styles={customSelectStyles}
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs text-slate-600" style={fontBold}>Username <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><User size={14} /></div>
                                        <input
                                            type="text"
                                            name="userName"
                                            required
                                            value={formData.userName}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            placeholder="client_username"
                                            style={fontLight}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-4 p-5 bg-slate-50/50 border border-slate-100 rounded-xl">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide" style={fontBold}>
                                    <span className="p-1 rounded bg-orange-100 text-orange-600"><ShieldCheck size={14} /></span>
                                    System Generated Credentials
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleRegeneratePassword}
                                    className="flex items-center gap-1.5 text-xs cursor-pointer text-orange-600 hover:text-orange-700 font-medium bg-orange-50 px-2 py-1 rounded-md border border-orange-100 transition-colors"
                                >
                                    <RefreshCw size={12} className={` ${regenerating && "animate-spin duration-200 "}`} /> Regenerate
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Auto-Generated Password</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2
                                         text-orange-500 bg-orange-50 p-1 rounded-md"><Lock size={14} /></div>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            disabled
                                            className={disabledInputClass}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 bg-orange-50 p-1 rounded-md"><Lock size={14} /></div>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            disabled
                                            className={disabledInputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2" style={fontLight}>
                                * Passwords are automatically generated, synchronized, and hidden for security purposes.
                            </p>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || regenerating}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700
                             text-white py-3.5 px-4 text-sm rounded-xl
                              cursor-pointer
                             hover:from-blue-700 hover:to-blue-800
                              transition-all duration-300 disabled:opacity-50 
                              disabled:cursor-not-allowed font-medium 
                              shadow-md hover:shadow-lg group"
                            style={fontBold}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Provisioning Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                                    Create Client Credential
                                    <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};