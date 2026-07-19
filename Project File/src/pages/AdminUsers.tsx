import { useState, useEffect } from "react";
import { User } from "../types";
import { ShieldCheck, User as UserIcon } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="border-b border-gray-50 pb-3">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          Registered Platform Users
        </h2>
        <p className="text-xs text-gray-400 mt-1">Review active system logins and credentials for customers and managers.</p>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse font-medium">Fetching users collection...</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50 text-gray-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-400">
                      {u._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        u.usertype === "Admin" ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"
                      }`}>
                        <UserIcon size={14} />
                      </div>
                      <span>{u.username}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold rounded-md border ${
                        u.usertype === "Admin"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-indigo-50 text-indigo-600 border-indigo-200"
                      }`}>
                        {u.usertype === "Admin" && <ShieldCheck size={12} />}
                        {u.usertype}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
