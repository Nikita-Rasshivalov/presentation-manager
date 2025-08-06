import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { User, UserRole } from "../types/types";

interface UserListProps {
  users: User[];
  currentUserRole: UserRole;
  currentUserNickname: string;
  onChangeUserRole: (userId: string, newRole: UserRole) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users = [],
  currentUserRole,
  currentUserNickname,
  onChangeUserRole,
}) => {
  return (
    <section className="flex flex-col rounded-2xl border border-gray-200 shadow-xl bg-white h-full max-h-[600px]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 rounded-t-2xl bg-gray-50">
        <h2 className="text-xl font-semibold text-purple-700 select-none">
          Users
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {users.length === 0 ? (
          <p className="text-center text-gray-400 italic select-none mt-8">
            No users connected
          </p>
        ) : (
          users.map((user) => {
            const isDisabled =
              currentUserRole !== UserRole.CREATOR ||
              user.nickname === currentUserNickname;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition cursor-default rounded-lg"
              >
                <div className="flex items-center gap-2 text-gray-800 font-medium truncate">
                  <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span title={user.nickname} className="truncate">
                    {user.nickname}
                  </span>
                </div>

                <select
                  value={user.role}
                  onChange={(e) =>
                    !isDisabled &&
                    onChangeUserRole(user.id, e.target.value as UserRole)
                  }
                  disabled={isDisabled}
                  aria-label={`Change role for ${user.nickname}`}
                  className={`text-sm rounded-lg px-3 py-1 border focus:outline-none transition
                    ${
                      isDisabled
                        ? "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200"
                        : "bg-white cursor-pointer border-gray-300 hover:ring-1 hover:ring-purple-400 focus:ring-2 focus:ring-purple-400"
                    }
                  `}
                >
                  <option value="CREATOR">Creator</option>
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
