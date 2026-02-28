import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import AddCallerModal from "@/components/AddCallerModal";
import { fetchCallers, deleteCaller } from "@/lib/api";

interface BackendCaller {
    _id: string;
    name: string;
    role?: string;
    languages: string[];
    assignedStates: string[];
    dailyLimit: number;
    todayAssignedCount: number;
}

interface Caller {
    id: string;
    name: string;
    role: string;
    languages: string[];
    locations: string[];
    current: number;
    limit: number;
    limitReached: boolean;
    barColor: string;
    barPercent: string;
}

function mapBackendCaller(c: BackendCaller): Caller {
    const percent =
        c.dailyLimit > 0 ? Math.round((c.todayAssignedCount / c.dailyLimit) * 100) : 0;
    const limitReached = c.dailyLimit > 0 && c.todayAssignedCount >= c.dailyLimit;

    let barColor = "bg-emerald-500";
    if (percent >= 100) barColor = "bg-red-500";
    else if (percent >= 80) barColor = "bg-orange-400";
    else if (percent >= 60) barColor = "bg-primary";

    return {
        id: c._id,
        name: c.name,
        role: c.role || "Agent",
        languages: c.languages,
        locations: c.assignedStates,
        current: c.todayAssignedCount,
        limit: c.dailyLimit,
        limitReached,
        barColor,
        barPercent: `${Math.min(percent, 100)}%`,
    };
}

export default function Callers() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [callers, setCallers] = useState<Caller[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCallers = useCallback(async () => {
        try {
            const data: BackendCaller[] = await fetchCallers();
            setCallers(data.map(mapBackendCaller));
        } catch (err) {
            console.error("Error fetching callers:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCallers();
    }, [loadCallers]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this caller?")) return;
        try {
            await deleteCaller(id);
            setCallers((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Error deleting caller:", err);
        }
    };

    const handleCallerAdded = () => {
        loadCallers(); // Re-fetch after adding
    };

    // ─── Computed stats ────────────────────────────────────────
    const activeAgents = callers.length;
    const callsToday = callers.reduce((sum, c) => sum + c.current, 0);
    const limitReachedCount = callers.filter((c) => c.limitReached).length;

    return (
        <Layout activePage="callers">
            <Head>
                <title>Callers Management Dashboard</title>
                <meta
                    name="description"
                    content="Monitor performance and manage agent assignments in real-time."
                />
            </Head>

            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight mb-2">
                        Callers Management
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Monitor performance and manage agent assignments in real-time.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Add Caller</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                            Active Agents
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                            {activeAgents}
                        </p>
                    </div>
                    <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <span className="material-symbols-outlined">support_agent</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                            Calls Today
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                            {callsToday.toLocaleString()}
                        </p>
                    </div>
                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <span className="material-symbols-outlined">call_made</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                            Avg Duration
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">—</p>
                    </div>
                    <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                        <span className="material-symbols-outlined">schedule</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                            Limit Reached
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                            {limitReachedCount}
                        </p>
                    </div>
                    <div className="size-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                </div>
            </div>

            {/* Callers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
                        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm">Loading callers...</p>
                    </div>
                ) : (
                    <>
                        {callers.map((caller) => (
                            <div
                                key={caller.id}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                            >
                                <div
                                    className={`absolute top-0 left-0 w-1 h-full ${caller.limitReached ? "bg-red-500" : "bg-emerald-500"
                                        }`}
                                ></div>
                                {caller.limitReached && (
                                    <div className="absolute top-3 right-3 bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-red-100">
                                        Limit Reached
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                            {caller.name
                                                .split(" ")
                                                .map((w) => w[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="text-slate-900 font-bold text-base">
                                                {caller.name}
                                            </h3>
                                            <p className="text-slate-500 text-xs font-medium">
                                                {caller.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">
                                                edit
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(caller.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                delete
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {/* Language/Location Chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {caller.languages.map((lang, i) => (
                                            <span
                                                key={lang}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                                            >
                                                {i === 0 && (
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        language
                                                    </span>
                                                )}
                                                {lang}
                                            </span>
                                        ))}
                                        {caller.locations.map((loc, i) => (
                                            <span
                                                key={loc}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700"
                                            >
                                                {i === 0 && (
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        location_on
                                                    </span>
                                                )}
                                                {loc}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-xs font-medium mb-1.5">
                                            <span className="text-slate-600">Daily Limit</span>
                                            <span
                                                className={
                                                    caller.limitReached
                                                        ? "text-red-600 font-bold"
                                                        : "text-slate-900"
                                                }
                                            >
                                                {caller.current}/{caller.limit} Calls
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${caller.barColor} rounded-full transition-all duration-500`}
                                                style={{ width: caller.barPercent }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Placeholder Card */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-300 hover:border-primary hover:bg-slate-100 flex flex-col items-center justify-center gap-3 transition-all min-h-[220px] group"
                        >
                            <div className="size-14 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-3xl">add</span>
                            </div>
                            <p className="text-slate-500 font-semibold group-hover:text-primary transition-colors">
                                Add New Caller
                            </p>
                        </button>
                    </>
                )}
            </div>

            {/* Add Caller Modal */}
            <AddCallerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCallerAdded={handleCallerAdded}
            />
        </Layout>
    );
}
