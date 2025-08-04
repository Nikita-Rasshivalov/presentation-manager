import { Server, Socket } from "socket.io";
import { prisma } from "../prisma/prisma.ts";
import { UserRoles } from "../types.ts";
import {
  getSession,
  isCreator,
  isEditor,
  emitUserList,
  validateStringField,
  validatePosition,
  validateSize,
} from "../utils/utils.ts";

export function handlePresentationEvents(socket: Socket, io: Server) {
  let currentPresentationId: string | null = null;

  socket.on("join_presentation", async ({ presentationId, nickname }) => {
    try {
      validateStringField(presentationId, "presentationId");
      validateStringField(nickname, "nickname");

      const exists = await prisma.userSession.findFirst({
        where: { presentationId, nickname },
      });
      if (exists) {
        socket.emit("join_error", "Nickname already taken");
        return;
      }

      const session = await prisma.userSession.create({
        data: {
          nickname,
          role: UserRoles.VIEWER,
          presentationId,
          socketId: socket.id,
        },
      });

      socket.join(presentationId);
      currentPresentationId = presentationId;

      await emitUserList(io, presentationId);
    } catch (error: any) {
      socket.emit("join_error", error.message || "Join failed");
    }
  });

  socket.on("add_element", async ({ slideId, content, pos, size }) => {
    try {
      validateStringField(slideId, "slideId");
      validateStringField(content, "content");
      validatePosition(pos);
      validateSize(size);

      const session = await getSession(socket.id);
      if (!isEditor(session)) return;

      const element = await prisma.slideElement.create({
        data: {
          slideId,
          content,
          posX: pos.x,
          posY: pos.y,
          width: size.width,
          height: size.height,
        },
      });

      if (!session?.presentationId) return;
      io.to(session.presentationId).emit("element_added", element);
    } catch (error: any) {
      socket.emit("error", error.message || "Add element failed");
    }
  });

  socket.on("edit_element", async ({ elementId, content, pos }) => {
    try {
      validateStringField(elementId, "elementId");
      validateStringField(content, "content");
      validatePosition(pos);

      const session = await getSession(socket.id);
      if (!isEditor(session)) return;

      const updated = await prisma.slideElement.update({
        where: { id: elementId },
        data: { content, posX: pos.x, posY: pos.y },
      });

      if (!session?.presentationId) return;
      io.to(session.presentationId).emit("element_updated", updated);
    } catch (error: any) {
      socket.emit("error", error.message || "Edit element failed");
    }
  });

  socket.on("delete_element", async ({ elementId }) => {
    try {
      validateStringField(elementId, "elementId");

      const session = await getSession(socket.id);
      if (!isEditor(session)) return;

      await prisma.slideElement.delete({
        where: { id: elementId },
      });

      if (!session?.presentationId) return;
      io.to(session.presentationId).emit("element_deleted", { elementId });
    } catch (error: any) {
      socket.emit("error", error.message || "Delete element failed");
    }
  });

  socket.on("update_role", async ({ userId, newRole, presentationId }) => {
    try {
      validateStringField(userId, "userId");
      validateStringField(newRole, "newRole");
      validateStringField(presentationId, "presentationId");

      const session = await getSession(socket.id);
      if (!isCreator(session)) return;

      await prisma.userSession.update({
        where: { id: userId },
        data: { role: newRole },
      });

      await emitUserList(io, presentationId);
    } catch (error: any) {
      socket.emit("error", error.message || "Update role failed");
    }
  });

  socket.on("get_my_role", async (_, callback) => {
    try {
      const session = await getSession(socket.id);
      if (!session) return callback({ error: "Session not found" });
      callback({ role: session.role });
    } catch {
      callback({ error: "Failed to get role" });
    }
  });

  socket.on("disconnect", async () => {
    try {
      await prisma.userSession.deleteMany({ where: { socketId: socket.id } });

      if (currentPresentationId) {
        await emitUserList(io, currentPresentationId);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    } catch (error) {
      console.error("Error on disconnect cleanup:", error);
    }
  });
}
