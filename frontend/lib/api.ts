const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export { API_URL };

// ─── Leads ───────────────────────────────────────────────────

export async function fetchLeads() {
    const res = await fetch(`${API_URL}/api/leads`);
    if (!res.ok) throw new Error("Failed to fetch leads");
    const json = await res.json();
    return json.data; // array of Lead documents
}

export async function updateLeadStatus(leadId: string, status: string) {
    const res = await fetch(`${API_URL}/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update lead status");
    return res.json();
}

export async function deleteLead(leadId: string) {
    const res = await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete lead");
    return res.json();
}

// ─── Callers ─────────────────────────────────────────────────

export async function fetchCallers() {
    const res = await fetch(`${API_URL}/api/callers`);
    if (!res.ok) throw new Error("Failed to fetch callers");
    const json = await res.json();
    return json.data; // array of Caller documents
}

export async function createCaller(data: {
    name: string;
    role?: string;
    languages?: string[];
    assignedStates?: string[];
    dailyLimit?: number;
}) {
    const res = await fetch(`${API_URL}/api/callers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create caller");
    }
    return res.json();
}

export async function deleteCaller(callerId: string) {
    const res = await fetch(`${API_URL}/api/callers/${callerId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete caller");
    return res.json();
}
