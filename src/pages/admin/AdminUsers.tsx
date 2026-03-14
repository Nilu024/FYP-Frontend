import { useEffect, useState } from "react";
import { Users, Search, ShieldOff, ShieldCheck } from "lucide-react";
import { adminAPI } from "../../services/api";
import { formatDate } from "../../lib/utils";
import toast from "react-hot-toast";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  charity: "bg-saffron-100 text-saffron-700",
  donor: "bg-blue-100 text-blue-700",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => { loadUsers(); }, [role]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role, search, limit: 50 });
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await adminAPI.getUsers({ id }); // placeholder - use toggle endpoint
      toast.success(currentStatus ? "User deactivated" : "User activated");
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
    } catch { toast.error("Failed to update user"); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadUsers()}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {["", "donor", "charity", "admin"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${role === r ? "bg-saffron-500 text-white border-saffron-500" : "bg-card border-border hover:bg-accent"}`}>
              {r || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-xl">No users found</h3>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {users.map(user => (
              <div key={user._id} className="px-6 py-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[user.role] || "bg-muted text-muted-foreground"}`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(user.createdAt)}</span>
                  {user.role !== "admin" && (
                    <button onClick={() => handleToggle(user._id, user.isActive)}
                      className={`p-1.5 rounded-lg transition-colors ${user.isActive ? "hover:bg-red-50 text-red-500" : "hover:bg-emerald-50 text-emerald-500"}`}
                      title={user.isActive ? "Deactivate" : "Activate"}>
                      {user.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
