import React from "react";

interface Props {
  nickname: string;
  title: string;
  loading: boolean;
  onNicknameChange: (val: string) => void;
  onTitleChange: (val: string) => void;
  onCreate: () => void;
}

export const CreatePresentationForm: React.FC<Props> = ({
  nickname,
  title,
  loading,
  onNicknameChange,
  onTitleChange,
  onCreate,
}) => {
  return (
    <section className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        Create Presentation
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your nickname
          </label>
          <input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Presentation title
          </label>
          <input
            type="text"
            placeholder="Enter presentation title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:bg-gray-100"
          />
        </div>

        <button
          onClick={onCreate}
          disabled={loading || !nickname.trim() || !title.trim()}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition ${
            loading || !nickname.trim() || !title.trim()
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </section>
  );
};
