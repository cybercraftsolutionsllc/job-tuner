import { clerkClient } from "@clerk/nextjs/server";
import { toggleProStatus, addCredits } from "./actions";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { userId } = await auth();
  const user = await currentUser();
  
  // --- SECURITY CONFIG ---
  // REPLACE THIS with the ID displayed on the screen if you see "Access Denied"
  const ADMIN_IDS = [
    "user_36FJn8KEujWD2PbD6360WxqF5i5", 
  ];
  
  // If not logged in at all
  if (!userId || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Admin Login Required</h1>
          <p className="mb-4 text-slate-500">Please sign in to access the dashboard.</p>
          <a href="/" className="text-blue-600 underline">Go Home</a>
        </div>
      </div>
    );
  }

  // If logged in but NOT an admin
  if (!ADMIN_IDS.includes(userId)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-6 text-sm">
            You are logged in as <strong>{user.firstName}</strong> but do not have admin permissions.
          </p>
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-600 break-all select-all mb-4">
            {userId}
          </div>
          <p className="text-xs text-slate-400">
            Copy the ID above and add it to the <code>ADMIN_IDS</code> array in <code>src/app/admin/page.tsx</code> and <code>src/app/admin/actions.ts</code>.
          </p>
          <a href="/" className="inline-block mt-6 text-sm font-bold text-slate-600 hover:text-slate-800">← Back to App</a>
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW ---
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
            <p className="text-slate-500 mt-1">Manage user plans and credits.</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200">
            Admin Mode Active
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Credits</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isPro = user.privateMetadata.plan === "pro";
                  const credits = user.privateMetadata.credits ?? 5;
                  const email = user.emailAddresses[0]?.emailAddress || "No Email";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                          <div>
                            <div className="font-semibold text-sm text-slate-900">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-slate-500 font-mono">{email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {isPro ? (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-200">PRO</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">FREE</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-sm font-medium">{credits as number}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <form action={toggleProStatus.bind(null, user.id, isPro)}>
                            <button className="px-3 py-1 text-xs font-medium border border-slate-300 rounded hover:bg-white hover:text-slate-900 transition-colors">
                              {isPro ? "Downgrade" : "Make Pro"}
                            </button>
                          </form>
                          <form action={addCredits.bind(null, user.id, 50)}>
                            <button className="px-3 py-1 text-xs font-medium bg-white text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
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