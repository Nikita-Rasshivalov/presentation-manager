import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { PresentationSummary } from "../types/types";
import { CreatePresentationForm } from "../components/Forms/CreatePresentationForm";
import { JoinPresentationForm } from "../components/Forms/JoinPresentationForm";
import {
  createNewPresentation,
  joinExistingPresentation,
  loadPresentations,
} from "../services/presentationService";
import { ModeSelector } from "../components/ModeSelector";

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
      setLoading(true);
      loadPresentations()
        .then(setPresentations)
        .finally(() => setLoading(false));
    }
  }, [mode]);

  const handleCreate = async () => {
    if (!nickname.trim() || !title.trim()) {
      toast.warn("Please enter your nickname and presentation title");
      return;
    }
    try {
      setLoading(true);
      const { presentation } = await createNewPresentation(title, nickname);
      sessionStorage.setItem("socketId", presentation.id);
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
      await joinExistingPresentation(id, nickname);
      sessionStorage.setItem("socketId", id);
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
      <ModeSelector mode={mode} setMode={setMode} />
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
          onSelectPresentation={setJoinId}
        />
      )}
    </div>
  );
};
