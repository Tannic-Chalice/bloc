import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { fetchLeads, updateLeadStatus } from "@/lib/api";
import { getSocket } from "@/lib/socket";

// ─── Type for a lead coming from the backend ────────────────
interface BackendLead {
  _id: string;
  name: string;
  phone?: string;
  city?: string;
  state?: string;
  leadSource?: string;
  status: "pending" | "calling" | "completed" | "no-answer" | "failed";
  assignedCallerId?: { _id: string; name: string } | null;
  assignedAt?: string;
  createdAt: string;
}

// ─── Mapped lead for the UI ─────────────────────────────────
interface Lead {
  id: string;
  initials: string;
  name: string;
  location: string;
  phone: string;
  source: string;
  sourceIcon: string;
  sourceColor: string;
  status: string;
  statusColor: string;
  assignedTo: string;
  time: string;
  isCalling: boolean;
  isFailed: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const sourceIconMap: Record<string, { icon: string; color: string }> = {
  "Web Form": { icon: "language", color: "purple" },
  Referral: { icon: "campaign", color: "blue" },
  "Cold Call": { icon: "ac_unit", color: "slate" },
  "Ad Campaign": { icon: "ads_click", color: "pink" },
};

const statusDisplayMap: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "amber" },
  calling: { label: "Calling", color: "primary" },
  completed: { label: "Completed", color: "emerald" },
  "no-answer": { label: "No Answer", color: "orange" },
  failed: { label: "Failed", color: "red" },
};

function mapBackendLead(lead: BackendLead): Lead {
  const statusInfo = statusDisplayMap[lead.status] || {
    label: lead.status,
    color: "slate",
  };
  const sourceInfo = sourceIconMap[lead.leadSource || ""] || {
    icon: "description",
    color: "slate",
  };

  return {
    id: lead._id,
    initials: getInitials(lead.name),
    name: lead.name,
    location: [lead.city, lead.state].filter(Boolean).join(", ") || "—",
    phone: lead.phone || "—",
    source: lead.leadSource || "Unknown",
    sourceIcon: sourceInfo.icon,
    sourceColor: sourceInfo.color,
    status: statusInfo.label,
    statusColor: statusInfo.color,
    assignedTo: lead.assignedCallerId?.name || "Unassigned",
    time: formatTime(lead.createdAt),
    isCalling: lead.status === "calling",
    isFailed: lead.status === "failed",
  };
}

// ─── Style maps ─────────────────────────────────────────────
const statusBgMap: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700 border border-amber-100",
  primary: "bg-primary text-white shadow-sm shadow-blue-200 animate-pulse",
  orange: "bg-orange-50 text-orange-700 border border-orange-100",
  red: "bg-red-50 text-red-700 border border-red-100",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  slate: "bg-slate-100 text-slate-600 border border-slate-200",
};
const statusDotMap: Record<string, string> = {
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-400",
};
const sourceBgMap: Record<string, string> = {
  purple: "bg-purple-50 text-purple-700 border border-purple-100",
  blue: "bg-blue-50 text-blue-700 border border-blue-100",
  slate: "bg-slate-100 text-slate-600 border border-slate-200",
  pink: "bg-pink-50 text-pink-700 border border-pink-100",
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLeads = useCallback(async () => {
    try {
      const data: BackendLead[] = await fetchLeads();
      setLeads(data.map(mapBackendLead));
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // ─── WebSocket real-time updates ───────────────────────────
  useEffect(() => {
    const socket = getSocket();

    socket.on("newLead", (lead: BackendLead) => {
      setLeads((prev) => [mapBackendLead(lead), ...prev]);
    });

    socket.on("leadStatusUpdated", (lead: BackendLead) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === lead._id ? mapBackendLead(lead) : l))
      );
    });

    socket.on("leadCompleted", ({ leadId }: { leadId: string }) => {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    });

    socket.on("leadDeleted", ({ leadId }: { leadId: string }) => {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    });

    return () => {
      socket.off("newLead");
      socket.off("leadStatusUpdated");
      socket.off("leadCompleted");
      socket.off("leadDeleted");
    };
  }, []);

  // ─── Action handlers ──────────────────────────────────────
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      // WebSocket will handle the UI update, but we can also update optimistically
    } catch (err) {
      console.error("Error updating lead status:", err);
    }
  };

  // ─── Computed stats ────────────────────────────────────────
  const totalActive = leads.length;
  const pendingCount = leads.filter((l) => l.status === "Pending").length;
  const callingCount = leads.filter((l) => l.status === "Calling").length;
  const noAnswerCount = leads.filter((l) => l.status === "No Answer").length;
  const failedCount = leads.filter((l) => l.status === "Failed").length;

  // ─── Filtered leads ───────────────────────────────────────
  const filteredLeads = searchQuery
    ? leads.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : leads;

  return (
    <Layout activePage="dashboard">
      <Head>
        <title>Live Leads Dashboard - Overview</title>
        <meta
          name="description"
          content="Monitor live leads, call statuses, and agent assignments in real-time."
        />
      </Head>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Active */}
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Total Active</p>
            <span className="material-symbols-outlined text-slate-400">
              groups
            </span>
          </div>
          <p className="text-slate-900 text-3xl font-bold tracking-tight">
            {totalActive}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            All current leads
          </p>
        </div>

        {/* Pending */}
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-white shadow-sm border-l-4 border-l-amber-400 border-y border-r border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Pending</p>
            <span className="material-symbols-outlined text-amber-400">
              hourglass_empty
            </span>
          </div>
          <p className="text-slate-900 text-3xl font-bold tracking-tight">
            {pendingCount}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Waiting assignment
          </p>
        </div>

        {/* Live Calling */}
        <div className="relative flex flex-col gap-1 rounded-xl p-5 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow overflow-hidden group">
          <div className="absolute -right-6 -top-6 size-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10">
            <p className="text-blue-100 text-sm font-medium">Live Calling</p>
            <span className="material-symbols-outlined text-white animate-pulse">
              phone_in_talk
            </span>
          </div>
          <p className="text-white text-3xl font-bold tracking-tight relative z-10">
            {callingCount}
          </p>
          <p className="text-xs text-blue-100 font-medium relative z-10">
            Currently connected
          </p>
        </div>

        {/* No-Answer */}
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-white shadow-sm border-l-4 border-l-orange-500 border-y border-r border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">No-Answer</p>
            <span className="material-symbols-outlined text-orange-500">
              phone_missed
            </span>
          </div>
          <p className="text-slate-900 text-3xl font-bold tracking-tight">
            {noAnswerCount}
          </p>
          <p className="text-xs text-slate-400 font-medium">Retry queue</p>
        </div>

        {/* Failed */}
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-white shadow-sm border-l-4 border-l-red-500 border-y border-r border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Failed</p>
            <span className="material-symbols-outlined text-red-500">
              phonelink_erase
            </span>
          </div>
          <p className="text-slate-900 text-3xl font-bold tracking-tight">
            {failedCount}
          </p>
          <p className="text-xs text-slate-400 font-medium">Invalid numbers</p>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Active Leads Queue
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-full sm:w-64"
              placeholder="Search leads..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              filter_list
            </span>
            Filter
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">
                  Lead Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Source
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">
                  Time
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 text-sm">Loading leads...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">
                        inbox
                      </span>
                      <p className="text-slate-500 text-sm">
                        {searchQuery ? "No leads match your search" : "No leads found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`transition-colors group ${lead.isCalling
                        ? "bg-blue-50/50 hover:bg-blue-50 border-l-4 border-l-primary"
                        : lead.isFailed
                          ? "hover:bg-slate-50 opacity-75"
                          : "hover:bg-slate-50"
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-9 rounded-full flex items-center justify-center font-bold text-sm ${lead.isCalling
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {lead.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {lead.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {lead.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          call
                        </span>
                        <span
                          className={`text-sm font-medium ${lead.isFailed
                              ? "line-through decoration-slate-400"
                              : ""
                            }`}
                        >
                          {lead.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sourceBgMap[lead.sourceColor] || sourceBgMap.slate
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {lead.sourceIcon}
                        </span>
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBgMap[lead.statusColor] || statusBgMap.slate
                          }`}
                      >
                        {lead.isCalling ? (
                          <span className="material-symbols-outlined text-[14px]">
                            phone_in_talk
                          </span>
                        ) : (
                          <span
                            className={`size-1.5 rounded-full ${statusDotMap[lead.statusColor] || "bg-slate-400"
                              }`}
                          ></span>
                        )}
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${lead.assignedTo === "Unassigned"
                              ? "bg-slate-100 text-slate-400"
                              : "bg-primary/10 text-primary"
                            }`}
                        >
                          {lead.assignedTo === "Unassigned"
                            ? "?"
                            : getInitials(lead.assignedTo)}
                        </div>
                        <span
                          className={`text-sm ${lead.assignedTo === "Unassigned"
                              ? "text-slate-400 italic"
                              : lead.isCalling
                                ? "font-medium text-slate-900"
                                : "text-slate-600"
                            }`}
                        >
                          {lead.assignedTo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <span
                        className={`text-sm ${lead.isCalling
                            ? "font-medium text-primary"
                            : "text-slate-500"
                          }`}
                      >
                        {lead.time}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {lead.status === "Pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(lead.id, "calling")
                              }
                              className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Start Call"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                call
                              </span>
                            </button>
                            <button
                              className="flex items-center justify-center size-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                              title="More options"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                more_horiz
                              </span>
                            </button>
                          </>
                        )}
                        {lead.status === "Calling" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(lead.id, "completed")
                              }
                              className="flex items-center justify-center size-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="End Call"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                call_end
                              </span>
                            </button>
                            <button
                              className="flex items-center justify-center size-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                              title="View Details"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>
                          </>
                        )}
                        {lead.status === "No Answer" && (
                          <button
                            onClick={() =>
                              handleStatusChange(lead.id, "pending")
                            }
                            className="flex items-center justify-center px-3 h-8 gap-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-xs font-medium"
                            title="Retry"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              replay
                            </span>
                            Retry
                          </button>
                        )}
                        {lead.status === "Failed" && (
                          <button
                            className="flex items-center justify-center size-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            title="Archive"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              archive
                            </span>
                          </button>
                        )}
                        {lead.status === "Completed" && (
                          <button
                            className="flex items-center justify-center size-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            title="View Notes"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              description
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="hidden sm:flex flex-1 items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-900">
                  {filteredLeads.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {leads.length}
                </span>{" "}
                results
              </p>
            </div>
          </div>
          <div className="flex sm:hidden w-full justify-center">
            <p className="text-sm text-slate-500">
              {filteredLeads.length} leads
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
