import {
  useDemoteToUser,
  useListAllUsers,
  usePromoteToAdmin,
} from "@/hooks/useAdmin";
import { CivPrimaryButton } from "./CivPrimaryButton";

/**
 * Admin panel to manage user roles
 * Only visible to admin users
 */
export const AdminPanel = () => {
  const users = useListAllUsers();
  const promoteToAdmin = usePromoteToAdmin();
  const demoteToUser = useDemoteToUser();

  const handlePromote = async (clerkId: string) => {
    try {
      await promoteToAdmin({ clerkId });
      alert("User promoted to admin");
    } catch (error) {
      alert("Error promoting user: " + error);
    }
  };

  const handleDemote = async (clerkId: string) => {
    try {
      await demoteToUser({ clerkId });
      alert("User demoted to regular user");
    } catch (error) {
      alert("Error demoting user: " + error);
    }
  };

  if (!users || users.length === 0) {
    return <div>No users found</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Email
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Role
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Created
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {user.email}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {user.role === "admin" ? (
                    <span className="text-red-600">Admin</span>
                  ) : (
                    <span className="text-blue-600">User</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-2">
                    {user.role !== "admin" ? (
                      <CivPrimaryButton
                        onClick={() => handlePromote(user.clerkId)}
                      >
                        Promote
                      </CivPrimaryButton>
                    ) : (
                      <CivPrimaryButton
                        onClick={() => handleDemote(user.clerkId)}
                      >
                        Demote
                      </CivPrimaryButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
