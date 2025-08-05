import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PresentationSummary } from "../../types/types";

interface Props {
  nickname: string;
  joinId: string;
  loading: boolean;
  onNicknameChange: (val: string) => void;
  onJoin: (id: string) => void;
  presentations: PresentationSummary[];
  onSelectPresentation: (id: string) => void;
}

export const JoinPresentationForm: React.FC<Props> = ({
  nickname,
  joinId,
  loading,
  onNicknameChange,
  onJoin,
  presentations,
  onSelectPresentation,
}) => {
  const [selectedPresentationId, setSelectedPresentationId] = useState(joinId);

  useEffect(() => {
    setSelectedPresentationId(joinId);
  }, [joinId]);

  const handleSelectPresentation = (id: string) => {
    if (nickname.trim() === "") {
      toast.warn("Please enter your nickname before joining");
      return;
    }
    setSelectedPresentationId(id);
    onSelectPresentation(id);
    if (!loading) {
      onJoin(id);
    }
  };

  return (
    <section className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
        Join Presentation
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-100"
          />
        </div>
      </div>

      {presentations.length > 0 && (
        <>
          <h3 className="mt-8 mb-3 text-md font-semibold text-gray-800 border-t pt-4">
            Available Presentations
          </h3>
          <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100 rounded-md border border-gray-200">
            {presentations.map((p) => (
              <li
                key={p.id}
                className={`p-3 cursor-pointer flex justify-between items-center transition
                  ${
                    selectedPresentationId === p.id
                      ? "bg-green-100 text-green-800 font-semibold"
                      : "hover:bg-green-50 text-green-700"
                  }
                `}
                onClick={() => handleSelectPresentation(p.id)}
              >
                <span className="truncate max-w-xs">{p.title}</span>
                <time className="text-sm text-gray-500 ml-4 shrink-0">
                  {new Date(p.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
