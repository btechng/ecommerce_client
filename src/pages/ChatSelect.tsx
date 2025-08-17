import React from "react";

interface User {
  _id: string;
  username: string;
  avatarUrl?: string;
}

interface Props {
  users: User[];
  onClose: () => void;
  onSelect: (u: User) => void;
}

const ChatSelect: React.FC<Props> = ({ users, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded shadow-lg w-80 max-h-96 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Select User</h2>
          <button onClick={onClose} className="text-red-500 font-bold">
            X
          </button>
        </div>
        {(users || []).length > 0 ? (
          (users || []).map((u: User) => (
            <div
              key={u._id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => onSelect(u)}
            >
              <img
                src={u.avatarUrl || "https://placehold.co/32"}
                className="w-8 h-8 rounded-full"
                alt={u.username}
              />
              <span>{u.username}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatSelect;
