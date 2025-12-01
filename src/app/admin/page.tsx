import { clerkClient } from "@clerk/nextjs/server";
import { toggleProStatus, addCredits } from "./actions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { userId } = await auth();
  
  if (!userId) redirect("/");

  const client = await clerkClient();
  const response = await client.users.getUserList({ 
    limit: 50,
    orderBy: '-created_at' 
  });
  
  const users = response.data;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage user plans and credit balances directly.</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            Admin Mode Active
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Credits</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isPro = user.privateMetadata.plan === "pro";
                  const credits = user.privateMetadata.credits ?? 5;
                  const email = user.emailAddresses[0]?.emailAddress || "No Email";
                  const joinedDate = new Date(user.createdAt).toLocaleDateString();

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.imageUrl} 
                            alt="" 
                            className="w-10 h-10 rounded-full border border-slate-200" 
                          />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {email}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isPro 
                            ? "bg-purple-50 text-purple-700 border-purple-200" 
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {isPro ? "⚡ PRO" : "Free Tier"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">{credits as number}</span>
                          <span className="text-xs text-slate-400">credits</span>
                        </div>
                      </td>

                      <td className="p-4 text-sm text-slate-500">
                        {joinedDate}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <form action={toggleProStatus.bind(null, user.id, isPro)}>
                            <button className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all ${
                              isPro
                                ? "border-slate-300 text-slate-600 hover:bg-slate-100"
                                : "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                            }`}>
                              {isPro ? "Downgrade" : "Upgrade to Pro"}
                            </button>
                          </form>

                          <form action={addCredits.bind(null, user.id, 50)}>
                            <button className="px-3 py-1.5 text-xs font-semibold bg-white text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-all">
                              +50 Credits
                            </button>
                          </form>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}