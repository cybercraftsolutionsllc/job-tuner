import { clerkClient } from "@clerk/nextjs/server";
import { toggleProStatus, addCredits } from "./actions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function AdminDashboard() {
  const { userId } = await auth();
  
  // Basic protection: If not signed in, redirect. 
  // You should add ID verification here matching actions.ts
  if (!userId) redirect("/");

  const client = await clerkClient();
  const response = await client.users.getUserList({ limit: 20 });
  const users = response.data;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">User</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Email</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Plan</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Credits</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isPro = user.privateMetadata.plan === "pro";
                const credits = user.privateMetadata.credits || 0;
                const email = user.emailAddresses[0]?.emailAddress;

                return (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-slate-400 font-mono">{user.id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${isPro ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                        {isPro ? "PRO" : "FREE"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{credits as number}</td>
                    <td className="p-4 flex gap-2">
                      <form action={toggleProStatus.bind(null, user.id, isPro)}>
                        <button className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-white transition-colors">
                          {isPro ? "Demote" : "Make Pro"}
                        </button>
                      </form>
                      <form action={addCredits.bind(null, user.id, 50)}>
                        <button className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                          +50 Credits
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}