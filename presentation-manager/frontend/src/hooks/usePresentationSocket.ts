import { useEffect, useState, useRef, useCallback } from "react";
import { socket as globalSocket } from "../lib/socket";
import { Presentation, User, UserRole } from "../types/types";

export interface PresentationSocketOptions {
  nickname: string;
  onPresentationUpdate: (presentation: Presentation) => void;
  onUsersUpdate?: (users: User[]) => void;
  onOwnRoleChange?: (newRole: UserRole) => void;
}

export const usePresentationSocket = (
  presentationId: string,
  options: PresentationSocketOptions
) => {
  const { onPresentationUpdate, onUsersUpdate, onOwnRoleChange, nickname } =
    options;
  const [connected, setConnected] = useState(false);
  const lastOwnRoleRef = useRef<UserRole | null>(null);

  const handlePresentationUpdate = useCallback(
    (presentation: Presentation) => {
      onPresentationUpdate(presentation);
    },
    [onPresentationUpdate]
  );

  const handleUsersUpdate = useCallback(
    (users: User[]) => {
      if (onUsersUpdate) {
        onUsersUpdate(users);
      }

      const me = users.find((u) => u.nickname === nickname);
      if (me && me.role !== lastOwnRoleRef.current) {
        lastOwnRoleRef.current = me.role;
        if (onOwnRoleChange) {
          onOwnRoleChange(me.role);
        }
      }
    },
    [nickname, onUsersUpdate, onOwnRoleChange]
  );

  useEffect(() => {
    if (!presentationId || !nickname) return;

    if (!globalSocket.connected) {
      globalSocket.connect();
    }

    globalSocket.emit("join_presentation", { presentationId, nickname });

    globalSocket.on("presentationUpdate", handlePresentationUpdate);
    globalSocket.on("usersUpdate", handleUsersUpdate);

    setConnected(true);

    return () => {
      globalSocket.off("presentationUpdate", handlePresentationUpdate);
      globalSocket.off("usersUpdate", handleUsersUpdate);
      globalSocket.emit("leave_presentation", { presentationId, nickname });
      setConnected(false);
    };
  }, [presentationId, nickname, handlePresentationUpdate, handleUsersUpdate]);

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
