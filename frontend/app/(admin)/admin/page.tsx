"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { AdminStats, AdminUser } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Brain, UserCheck } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const fetchData = async () => {
    adminApi.stats().then(setStats).catch(console.error);
    adminApi.users().then(setUsers).catch(console.error);
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleUser = async (user: AdminUser) => {
    await adminApi.updateUser(user.id, { is_active: !user.is_active });
    fetchData();
  };

  const statCards = [
    { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Active Users", value: stats?.active_users ?? 0, icon: UserCheck, color: "text-green-400" },
    { label: "Total Applications", value: stats?.total_applications ?? 0, icon: Briefcase, color: "text-purple-400" },
    { label: "AI Analyses", value: stats?.total_ai_analyses ?? 0, icon: Brain, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-400 mt-1">System overview and user management.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
              </div>
              <Icon size={28} className={color} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Users</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase">
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Applications</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                <td className="px-6 py-4">
                  <p className="text-white text-sm font-medium">{user.username}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge className={user.role === "admin" ? "bg-purple-600" : "bg-gray-700"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">{user.total_applications}</td>
                <td className="px-6 py-4">
                  <Badge className={user.is_active ? "bg-green-700" : "bg-red-700"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {user.role !== "admin" && (
                    <Button size="sm" variant="outline"
                      onClick={() => handleToggleUser(user)}
                      className={`border-gray-700 text-xs hover:bg-gray-800 ${user.is_active ? "text-red-400" : "text-green-400"}`}>
                      {user.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}