import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPresentations,
  createPresentation,
  joinPresentation,
} from "../api/presentationApi";
import { PresentationSummary } from "../types/types";
import { ToastContainer, toast } from "react-toastify";
import { FaPlusCircle, FaSignInAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { JoinPresentationForm } from "../components/Forms/JoinPresentationForm";
import { CreatePresentationForm } from "../components/Forms/CreatePresentationForm";
import { socket } from "../lib/socket";

export const PresentationStart: React.FC = () => {
  const [presentations, setPresentations] = useState<PresentationSummary[]>([]);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [joinId, setJoinId] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"create" | "join">("create");

  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "join") {
      const loadPresentations = async () => {
        try {
          setLoading(true);
          const data = await fetchPresentations();
          setPresentations(data);
        } catch {
          toast.error("Failed to fetch presentations");
        } finally {
          setLoading(false);
        }
      };
      loadPresentations();
    }
  }, [mode]);

  const handleCreate = async () => {
    if (!nickname.trim() || !title.trim()) {
      toast.warn("Please enter your nickname and presentation title");
      return;
    }

    try {
      setLoading(true);
      if (!socket.connected) {
        socket.connect();
        await new Promise<void>((resolve) => {
          socket.once("connect", () => resolve());
        });
      }

      if (!socket.id) {
        toast.error("Socket ID not available");
        return;
      }

      const { presentation } = await createPresentation(
        title,
        nickname,
        socket.id
      );
      sessionStorage.setItem("socketId", socket.id);

      navigate(`/presentation/${presentation.id}/${nickname}`);
      toast.success("Presentation created!");
    } catch {
      toast.error("Failed to create presentation");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id: string) => {
    try {
      setLoading(true);

      if (!socket.connected) {
        socket.connect();

        await new Promise<void>((resolve) => {
          socket.once("connect", () => resolve());
        });
      }

      if (!socket.id) {
        toast.error("Socket ID not available");
        return;
      }
      await joinPresentation(id, nickname, socket.id);
      sessionStorage.setItem("socketId", socket.id);
      navigate(`/presentation/${id}/${nickname}`);
      toast.success("Joined presentation!");
    } catch {
      toast.error("Failed to join presentation");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-6 font-sans text-gray-800 space-y-6">
      <ToastContainer />

      <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-600">
        Collaborative Presentations
      </h1>

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

      {mode === "create" ? (
        <CreatePresentationForm
          nickname={nickname}
          title={title}
          loading={loading}
          onNicknameChange={setNickname}
          onTitleChange={setTitle}
          onCreate={handleCreate}
        />
      ) : (
        <JoinPresentationForm
          nickname={nickname}
          joinId={joinId}
          loading={loading}
          onNicknameChange={setNickname}
          onJoin={handleJoin}
          presentations={presentations}
          onSelectPresentation={(id) => {
            setJoinId(id);
          }}
        />
      )}
    </div>
  );
};
