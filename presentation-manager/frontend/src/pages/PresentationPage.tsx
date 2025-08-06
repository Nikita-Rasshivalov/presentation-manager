import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { usePresentationStore } from "../store/usePresentationStore";
import { useLoadPresentation } from "../hooks/useLoadPresentation";
import { usePresentationSocket } from "../hooks/usePresentationSocket";
import { LoadingView } from "../components/PresentationPage/LoadingView";
import { NoSlidesView } from "../components/PresentationPage/NoSlidesView";
import { PresentationView } from "../components/PresentationPage/PresentationView";
import { User, Presentation } from "../types/types";

export const PresentationPage: React.FC = () => {
  const { id: presentationId = "", nickname = "" } = useParams<{
    id?: string;
    nickname?: string;
  }>();

  const { presentation, role, setPresentation, updateUsers, setRole } =
    usePresentationStore();

  useLoadPresentation(presentationId, nickname);

  const handlePresentationUpdate = useCallback(
    (updated: Presentation) => setPresentation(updated),
    [setPresentation]
  );

  const handleUsersUpdate = useCallback(
    (users: User[]) => {
      updateUsers(users);
      const me = users.find((u) => u.nickname === nickname);
      if (me && me.role !== role) setRole(me.role);
    },
    [updateUsers, nickname, role, setRole]
  );

  const { socket, emitPresentationUpdate, emitChangeUserRole } =
    usePresentationSocket(presentationId, {
      nickname,
      onPresentationUpdate: handlePresentationUpdate,
      onUsersUpdate: handleUsersUpdate,
    });

  if (!presentation || !role || !nickname) return <LoadingView />;

  if (!presentation.slides?.length) {
    return (
      <NoSlidesView
        presentationId={presentationId}
        presentation={presentation}
        role={role}
        nickname={nickname}
        socket={{ socket, emitPresentationUpdate, emitChangeUserRole }}
      />
    );
  }

  return (
    <PresentationView
      presentation={presentation}
      setPresentation={setPresentation}
      presentationId={presentationId}
      role={role}
      nickname={nickname}
      emitPresentationUpdate={emitPresentationUpdate}
      emitChangeUserRole={emitChangeUserRole}
      socket={socket}
    />
  );
};
