import { useEffect, useState } from "react";
import { socket as globalSocket } from "../lib/socket";
import { Presentation, UserRole } from "../types/types";

export interface PresentationSocketOptions {
  onPresentationUpdate: (presentation: Presentation) => void;
  nickname: string;
}

export const usePresentationSocket = (
  presentationId: string,
  options: PresentationSocketOptions
) => {
  const { onPresentationUpdate, nickname } = options;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!presentationId || !nickname) return;

    if (!globalSocket.connected) {
      globalSocket.connect();
    }

    globalSocket.emit("join_presentation", { presentationId, nickname });

    globalSocket.on("presentationUpdate", onPresentationUpdate);

    setConnected(true);

    return () => {
      globalSocket.off("presentationUpdate", onPresentationUpdate);
      globalSocket.emit("leave_presentation", { presentationId, nickname });
      setConnected(false);
    };
  }, [presentationId, nickname, onPresentationUpdate]);

  const emitPresentationUpdate = (presentation: Presentation) => {
    if (connected) {
      globalSocket.emit("presentationUpdate", presentation);
    }
  };

  const emitChangeUserRole = (userId: string, newRole: UserRole) => {
    if (connected) {
      globalSocket.emit("update_role", {
        userId,
        newRole,
        presentationId,
      });
    }
  };

  return {
    socket: connected ? globalSocket : null,
    emitPresentationUpdate,
    emitChangeUserRole,
  };
};
