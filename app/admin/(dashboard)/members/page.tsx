"use client";

import { useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    CreditCard,
    Wallet,
    Power,
    Shield
} from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/modal";
import Notification from "@/components/ui/notification";
import PageLoading from "@/components/ui/page-loading";

interface Member {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    balance: number;
    status: string; // active, suspended
    whatsapp: string;
    created_at: string;
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Pagination & Filter
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Notification
    const [notification, setNotification] = useState<{ message: string | null; type: "success" | "error" | "info" | null }>({
        message: null,
        type: null
    });

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // Form Data
    const [addForm, setAddForm] = useState({
        username: "",
        email: "",
        whatsapp: "",
        password: "",
        full_name: "",
        role: "member" // Not used by backend currently (hardcoded to member), but kept for future
    });

    const [editForm, setEditForm] = useState({
        full_name: "",
        email: "",
        whatsapp: "",
        status: "active"
    });

    const [topupForm, setTopupForm] = useState({
        amount: "",
        description: "" // Optional
    });

    // Initial Fetch
    useEffect(() => {
        fetchMembers();
    }, [page, limit, roleFilter]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());
            if (search) params.append("search", search);
            if (roleFilter !== "all") params.append("role", roleFilter);

            const response: any = await api.get(`/admin/members?${params.toString()}`);
            setMembers(response.members || []);
            setTotal(response.total || 0);
        } catch (error: any) {
            console.error("Failed to fetch members:", error);
            showNotification(error.message || "Gagal mengambil data member", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchMembers();
    };

    const showNotification = (message: string, type: "success" | "error" | "info") => {
        setNotification({ message, type });
    };

    // --- Action Handlers ---

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post("/admin/members", addForm);
            showNotification("Member berhasil ditambahkan", "success");
            setIsAddModalOpen(false);
            setIsAddModalOpen(false);
            setAddForm({ username: "", email: "", whatsapp: "", password: "", full_name: "", role: "member" }); // Reset
            fetchMembers();
        } catch (error: any) {
            showNotification(error.message || "Gagal menambahkan member", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleEditMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMember) return;
        setProcessing(true);
        try {
            await api.put(`/admin/members/${selectedMember.id}`, editForm);
            showNotification("Member berhasil diupdate", "success");
            setIsEditModalOpen(false);
            fetchMembers();
        } catch (error: any) {
            showNotification(error.message || "Gagal update member", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteMember = async (member: Member) => {
        if (!confirm(`Apakah Anda yakin ingin menonaktifkan member ${member.username}?`)) return;

        try {
            await api.delete(`/admin/members/${member.id}`);
            showNotification("Member berhasil dinonaktifkan", "success");
            fetchMembers();
        } catch (error: any) {
            showNotification(error.message || "Gagal menghapus member", "error");
        }
    };

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMember) return;

        // Validation amount
        const amount = parseFloat(topupForm.amount);
        if (isNaN(amount) || amount < 20000) {
            showNotification("Jumlah topup minimal Rp 20.000", "error");
            return;
        }

        setProcessing(true);
        try {
            await api.post(`/admin/members/${selectedMember.id}/topup`, {
                amount: amount,
                description: topupForm.description || "Manual Topup by Admin"
            });
            showNotification(`Topup Rp ${amount.toLocaleString()} berhasil untuk ${selectedMember.username}`, "success");
            setIsTopupModalOpen(false);
            setTopupForm({ amount: "", description: "" });
            fetchMembers(); // Refresh balance
        } catch (error: any) {
            showNotification(error.message || "Gagal topup member", "error");
        } finally {
            setProcessing(false);
        }
    };

    // --- Modal Openers ---

    const openEditModal = (member: Member) => {
        setSelectedMember(member);
        setEditForm({
            full_name: member.full_name,
            email: member.email,
            whatsapp: member.whatsapp || "",
            status: member.status
        });
        setIsEditModalOpen(true);
    };

    const openTopupModal = (member: Member) => {
        setSelectedMember(member);
        setTopupForm({ amount: "", description: "" });
        setIsTopupModalOpen(true);
    };

    // --- UI Helpers ---

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <PageLoading isVisible={loading && members.length === 0} />

            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: null, type: null })}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                        Member Management
                    </h1>
                    <div className="text-sm text-white/50 ml-4">
                        Manage registered members and resellers
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Username / Email..."
                            className="bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 w-full md:w-48 transition-colors"
                        />
                    </form>

                    {/* Filter Role */}
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 cursor-pointer [&>option]:bg-[#280905]"
                    >
                        <option value="all">Role: All</option>
                        <option value="member">Member</option>
                        <option value="reseller">Reseller</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        onClick={() => fetchMembers()}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors border border-white/5"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        Add Member
                    </button>
                </div>
            </div>

            {/* Members Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-white/70">
                        <thead className="bg-white/5 text-white/90 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && members.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-white/50">Loading...</td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-white/50">No members found.</td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-white/40">#{member.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{member.username}</span>
                                                <span className="text-white/40 text-[10px]">{member.email}</span>
                                                {member.whatsapp && <span className="text-emerald-400/70 text-[10px]">
                                                    <span className="i-lucide-phone w-3 h-3"></span>{member.whatsapp}
                                                </span>}
                                                {member.full_name && <span className="text-white/50 text-[10px]">{member.full_name}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${member.role === 'admin'
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : member.role === 'reseller'
                                                    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                {member.role === 'admin' && <Shield className="w-3 h-3" />}
                                                {member.role.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-emerald-400">
                                                Rp {member.balance.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${member.status === 'active'
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                                }`}>
                                                {member.status === 'active' ? "Active" : "Suspended"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/40">
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openTopupModal(member)}
                                                    className="p-1.5 hover:bg-emerald-500/20 rounded-lg text-white/50 hover:text-emerald-400 transition-colors"
                                                    title="Topup Balance"
                                                >
                                                    <Wallet className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(member)}
                                                    className="p-1.5 hover:bg-blue-500/20 rounded-lg text-white/50 hover:text-blue-400 transition-colors"
                                                    title="Edit Member"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(member)}
                                                    className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/50 hover:text-red-400 transition-colors"
                                                    title="Suspend Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white/5 px-6 py-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm text-white/50">
                        Showing {members.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 disabled:opacity-50 text-sm transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-white/70 text-sm flex items-center">
                            Page {page} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 disabled:opacity-50 text-sm transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Add Member Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Member">
                <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Username *</label>
                        <input
                            type="text"
                            required
                            value={addForm.username}
                            onChange={e => setAddForm({ ...addForm, username: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Email *</label>
                        <input
                            type="email"
                            required
                            value={addForm.email}
                            onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Password *</label>
                        <input
                            type="password"
                            required
                            value={addForm.password}
                            onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp</label>
                        <input
                            type="text"
                            value={addForm.whatsapp}
                            onChange={e => setAddForm({ ...addForm, whatsapp: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="e.g. 08123456789"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={addForm.full_name}
                            onChange={e => setAddForm({ ...addForm, full_name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    {/* Role input removed as it is not supported by backend create endpoint */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
                    >
                        {processing ? "Saving..." : "Create Member"}
                    </button>
                </form>
            </Modal>

            {/* Edit Member Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Member">
                <form onSubmit={handleEditMember} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={editForm.full_name}
                            onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                        <input
                            type="email"
                            value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp</label>
                        <input
                            type="text"
                            value={editForm.whatsapp}
                            onChange={e => setEditForm({ ...editForm, whatsapp: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="e.g. 08123456789"
                        />
                    </div>
                    {/* Role edit removed as backend does not support it */}
                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={editForm.status === 'active'}
                            onChange={e => setEditForm({ ...editForm, status: e.target.checked ? 'active' : 'suspended' })}
                            className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary focus:ring-offset-0 focus:ring-primary"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer select-none">
                            Active Account
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
                    >
                        {processing ? "Saving..." : "Update Member"}
                    </button>
                </form>
            </Modal>

            {/* Topup Modal */}
            <Modal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} title="Topup Balance">
                <form onSubmit={handleTopup} className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl text-center mb-4">
                        <span className="block text-sm text-white/50 mb-1">Current Balance</span>
                        <span className="text-2xl font-bold text-emerald-400">
                            Rp {selectedMember?.balance.toLocaleString()}
                        </span>
                        <p className="text-xs text-white/40 mt-1">{selectedMember?.username}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Amount (Rp)</label>
                        <input
                            type="number"
                            required
                            min="1000"
                            value={topupForm.amount}
                            onChange={e => setTopupForm({ ...topupForm, amount: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors font-mono text-lg"
                            placeholder="0"
                        />
                        <p className="text-xs text-white/40 mt-1">Gunakan angka positif untuk menambah saldo.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                        <input
                            type="text"
                            value={topupForm.description}
                            onChange={e => setTopupForm({ ...topupForm, description: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="e.g. Deposit Manual via Admin"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-emerald-900/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <CreditCard className="w-4 h-4" />
                        )}
                        {processing ? "Processing..." : "Confirm Topup"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
