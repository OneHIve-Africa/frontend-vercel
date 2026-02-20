import { create } from "zustand";
import AdminApi, {
  AdminInvestorItem,
  AdminFarmerItem,
} from "@/v1/api/AdminApi";

export type AdminUser = {
  id: number;
  name: string;
  email?: string | null;
  type: "investor" | "farmer";
  user: number;
};

// Types now provided by AdminApi

interface AdminUsersState {
  users: AdminUser[];
  selectedIds: Set<number>;
  isLoading: boolean;
  error?: string | null;
  filter: string;
  // derived
  filteredUsers: AdminUser[];
  // actions
  fetchAll: () => Promise<void>;
  toggleSelect: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  setFilter: (q: string) => void;
  sendCommunication: (payload: {
    user_ids: number[];
    title: string;
    content: string;
    cta_link?: string;
    tag: "Investment Updates" | "Performance Alerts" | "Events" | "Announcements" | "Direct Messages" | "Important";
  }) => Promise<Response>;
}

export const useAdminUsersStore = create<AdminUsersState>((set, get) => ({
  users: [],
  selectedIds: new Set<number>(),
  isLoading: false,
  error: null,
  filter: "",
  get filteredUsers() {
    const q = get().filter.trim().toLowerCase();
    if (!q) return get().users;
    return get().users.filter((u) =>
      [u.name, u.email ?? "", String(u.id), String(u.user), u.type]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  },
  async fetchAll() {
    set({ isLoading: true, error: null });
    try {
      const api = AdminApi.getInstance();
      const [inv, far] = await Promise.all([
        api.getAdminInvestors(),
        api.getAdminFarmers(),
      ]);
      if (inv.error) throw new Error(inv.error);
      if (far.error) throw new Error(far.error);
      const investors = Array.isArray(inv.data) ? inv.data : [];
      const farmers = Array.isArray(far.data) ? far.data : [];
      const mapUser = (
        r: AdminInvestorItem | AdminFarmerItem,
        type: "investor" | "farmer"
      ): AdminUser => {
        const id = Number(r?.id ?? 0);
        const user = Number(
          typeof r?.user === "object" ? r.user?.id : r?.user
        );
        const first = r.first_name ?? r.firstName;
        const last = r.last_name ?? r.lastName;
        const name =
          [first, last].filter(Boolean).join(" ") ||
          r.name ||
          r.full_name ||
          `User ${r.id}`;
        const email =
          r.email ??
          (typeof r.user === "object" ? r.user?.email : undefined) ??
          r.user_email ??
          r.profile_email ??
          null;
        return { id, user, name, email, type };
      };
      const users: AdminUser[] = [
        ...(Array.isArray(investors)
          ? investors.map((r) => mapUser(r, "investor"))
          : []),
        ...(Array.isArray(farmers)
          ? farmers.map((r) => mapUser(r, "farmer"))
          : []),
      ].filter((u) => !!u.id);
      set({ users, isLoading: false });
    } catch (e: unknown) {
      console.error("[AdminUsersStore] fetchAll error", e);
      const message = e instanceof Error ? e.message : "Failed to load users";
      set({ error: message, isLoading: false });
    }
  },
  toggleSelect(id) {
    const next = new Set(get().selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedIds: next });
  },
  selectAll(ids) {
    set({ selectedIds: new Set(ids) });
  },
  clearSelection() {
    set({ selectedIds: new Set() });
  },
  setFilter(q) {
    set({ filter: q });
  },
  async sendCommunication(payload) {
    const api = AdminApi.getInstance();
    const result = await api.sendAdminCommunication(payload);
    // Convert ApiResponse to Response-like minimal shape for current callers
    return new Response(JSON.stringify(result.data ?? { ok: !result.error }), {
      status: result.error ? 400 : 200,
      headers: { "Content-Type": "application/json" },
    });
  },
}));
