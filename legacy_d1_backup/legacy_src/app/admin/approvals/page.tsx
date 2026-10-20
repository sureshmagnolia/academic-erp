export const dynamic = 'force-dynamic';
import { getPendingApprovals, approveUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export default async function AdminApprovalsPage() {
  const { users, error } = await getPendingApprovals();

  async function handleApprove(formData: FormData) {
    'use server';
    const userId = formData.get('userId') as string;
    // In a real app, 'approverId' would come from the logged-in admin's session.
    // For now, we simulate with a hardcoded Admin ID.
    const approverId = 'admin_1'; 
    await approveUser(userId, approverId);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard: Pending Approvals</h1>
        
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">Error loading approvals: {error}</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <li key={user.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">
                          Role: <span className="font-semibold">{user.role}</span> | Dept: {user.department_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Email: {user.email} | Mobile: {user.mobile_number}
                        </p>
                      </div>
                      <div>
                        <form action={handleApprove}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Approve
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-6 text-center text-gray-500">No pending approvals at this time.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
