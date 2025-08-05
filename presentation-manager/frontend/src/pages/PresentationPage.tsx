import React, { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { usePresentationStore } from "../store/usePresentationStore";
import { useLoadPresentation } from "../hooks/useLoadPresentation";
import { usePresentationSocket } from "../hooks/usePresentationSocket";
import { LoadingView } from "../components/PresentationPage/LoadingView";
import { NoSlidesView } from "../components/PresentationPage/NoSlidesView";
import { PresentationView } from "../components/PresentationPage/PresentationView";
import { Presentation, User } from "../types/types";

export const PresentationPage: React.FC = () => {
  const { id: presentationId, nickname } = useParams<{
    id?: string;
    nickname?: string;
  }>();

  const safePresentationId = presentationId ?? "";
  const safeNickname = nickname ?? "";

  const { presentation, role, setPresentation } = usePresentationStore();

  useLoadPresentation(safePresentationId, safeNickname);
  useEffect(() => {
    if (!safePresentationId || !safeNickname) {
      console.warn("Missing presentationId or nickname, skipping join");
      return;
    }
  }, [safePresentationId, safeNickname]);
  const handlePresentationUpdate = useCallback(
    (updatedPresentation: Presentation) => {
      setPresentation(updatedPresentation);
    },
    [setPresentation]
  );

  const { socket, emitPresentationUpdate, emitChangeUserRole } =
    usePresentationSocket(safePresentationId, {
      nickname: safeNickname,
      onPresentationUpdate: handlePresentationUpdate,
    });

  const handleUsersUpdate = useCallback(
    (updatedUsers: User[]) => {
      if (!presentation) return;
      const updatedPresentation = { ...presentation, users: updatedUsers };
      setPresentation(updatedPresentation);
    },
    [presentation, setPresentation]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("usersUpdate", handleUsersUpdate);

    return () => {
      socket.off("usersUpdate", handleUsersUpdate);
    };
  }, [socket, handleUsersUpdate]);

  if (!presentation || !role || !safeNickname) {
    return <LoadingView />;
  }

  if (!presentation.slides?.length) {
    return (
      <NoSlidesView
        presentationId={safePresentationId}
        presentation={presentation}
        role={role}
        nickname={safeNickname}
        socket={{ socket, emitPresentationUpdate, emitChangeUserRole }}
      />
    );
  }

  return (
    <PresentationView
      presentation={presentation}
      setPresentation={setPresentation}
      presentationId={safePresentationId}
      role={role}
      nickname={safeNickname}
      emitPresentationUpdate={emitPresentationUpdate}
      emitChangeUserRole={emitChangeUserRole}
    />
  );
};
