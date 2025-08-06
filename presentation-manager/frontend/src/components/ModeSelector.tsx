import { FaPlusCircle, FaSignInAlt } from "react-icons/fa";

interface ModeSelectorProps {
  mode: "create" | "join";
  setMode: (mode: "create" | "join") => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  setMode,
}) => (
  <div className="flex gap-4 justify-center mb-4">
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition ${
        mode === "create"
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      onClick={() => setMode("create")}
    >
      <FaPlusCircle />
      Create
    </button>
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition ${
        mode === "join"
          ? "bg-green-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      onClick={() => setMode("join")}
    >
      <FaSignInAlt />
      Join
    </button>
  </div>
);
