import { useState } from "react";
import { createCaller } from "@/lib/api";

interface AddCallerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCallerAdded?: () => void;
}

export default function AddCallerModal({
    isOpen,
    onClose,
    onCallerAdded,
}: AddCallerModalProps) {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [languageInput, setLanguageInput] = useState("");
    const [languages, setLanguages] = useState<string[]>([]);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [dailyLimit, setDailyLimit] = useState(80);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const availableStates = [
        "Maharashtra",
        "Karnataka",
        "Delhi",
        "Tamil Nadu",
        "Gujarat",
        "Rajasthan",
        "Kerala",
        "Uttar Pradesh",
        "West Bengal",
        "Telangana",
    ];

    const resetForm = () => {
        setName("");
        setRole("");
        setLanguageInput("");
        setLanguages([]);
        setSelectedStates([]);
        setDailyLimit(80);
        setError("");
    };

    const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const lang = languageInput.trim();
            if (lang && !languages.includes(lang)) {
                setLanguages((prev) => [...prev, lang]);
            }
            setLanguageInput("");
        }
    };

    const handleRemoveLanguage = (lang: string) => {
        setLanguages((prev) => prev.filter((l) => l !== lang));
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        if (state && !selectedStates.includes(state)) {
            setSelectedStates((prev) => [...prev, state]);
        }
        e.target.value = ""; // Reset the select
    };

    const handleRemoveState = (state: string) => {
        setSelectedStates((prev) => prev.filter((s) => s !== state));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Caller name is required");
            return;
        }
        setError("");
        setSaving(true);
        try {
            await createCaller({
                name: name.trim(),
                role: role.trim() || undefined,
                languages,
                assignedStates: selectedStates,
                dailyLimit,
            });
            resetForm();
            onCallerAdded?.();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save caller");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            {/* Modal Content */}
            <div className="modal-enter w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Add New Caller
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Enter caller details and assign territories.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">
                                error
                            </span>
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {/* Personal Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Full Name *
                                    </span>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">
                                                person
                                            </span>
                                        </div>
                                        <input
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 pl-10 focus:border-primary focus:ring-primary py-2.5"
                                            placeholder="Ex: Rajesh Kumar"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </label>
                                <label className="block">
                                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Role
                                    </span>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">
                                                badge
                                            </span>
                                        </div>
                                        <input
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 pl-10 focus:border-primary focus:ring-primary py-2.5"
                                            placeholder="Ex: Senior Agent"
                                            type="text"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                    </div>
                                </label>
                            </div>
                            <label className="block">
                                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Languages Spoken
                                </span>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">
                                            translate
                                        </span>
                                    </div>
                                    <div className="w-full min-h-[46px] rounded-xl border border-slate-200 bg-slate-50 text-slate-900 pl-10 pr-2 py-1.5 flex flex-wrap gap-2 items-center cursor-text focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                                        {languages.map((lang) => (
                                            <span
                                                key={lang}
                                                className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-md"
                                            >
                                                {lang}
                                                <button
                                                    className="hover:text-primary-700"
                                                    type="button"
                                                    onClick={() => handleRemoveLanguage(lang)}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        close
                                                    </span>
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            className="bg-transparent border-none p-0 focus:ring-0 text-sm w-32 placeholder-slate-400"
                                            placeholder="Type & press Enter..."
                                            type="text"
                                            value={languageInput}
                                            onChange={(e) => setLanguageInput(e.target.value)}
                                            onKeyDown={handleAddLanguage}
                                        />
                                    </div>
                                </div>
                            </label>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Assignment Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                Territory &amp; Limits
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Target States
                                    </span>
                                    <div className="relative">
                                        <select
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 pl-3 pr-10 focus:border-primary focus:ring-primary py-2.5 appearance-none"
                                            onChange={handleStateChange}
                                            defaultValue=""
                                        >
                                            <option value="">Select states...</option>
                                            {availableStates
                                                .filter((s) => !selectedStates.includes(s))
                                                .map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                                            <span className="material-symbols-outlined">
                                                expand_more
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedStates.map((state) => (
                                            <span
                                                key={state}
                                                className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-md border border-slate-200"
                                            >
                                                {state}
                                                <button
                                                    className="hover:text-red-500 transition-colors"
                                                    type="button"
                                                    onClick={() => handleRemoveState(state)}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        close
                                                    </span>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </label>
                                <label className="block">
                                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Daily Call Limit
                                    </span>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">
                                                speed
                                            </span>
                                        </div>
                                        <input
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 pl-10 focus:border-primary focus:ring-primary py-2.5"
                                            placeholder="Ex: 100"
                                            type="number"
                                            value={dailyLimit}
                                            onChange={(e) => setDailyLimit(Number(e.target.value))}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                                            calls/day
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-end gap-3">
                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm shadow-sm shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">
                                    check
                                </span>
                                Save Caller
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
