import { Server, Socket } from "socket.io";
import { prisma } from "../prisma/prisma.ts";
import { UserRoles } from "../types.ts";
import {
  getSession,
  isCreator,
  isEditor,
  validateStringField,
  validatePosition,
  validateSize,
} from "../utils/utils.ts";

export async function emitUserList(io: Server, presentationId: string) {
  const users = await prisma.userSession.findMany({
    where: { presentationId },
    select: { id: true, nickname: true, role: true },
  });
  io.to(presentationId).emit("usersUpdate", users);
}

export function handlePresentationEvents(socket: Socket, io: Server) {
  let currentPresentationId: string | null = null;

  socket.on("join_presentation", async ({ presentationId, nickname }) => {
    try {
      validateStringField(presentationId, "presentationId");
      validateStringField(nickname, "nickname");

      const existingSession = await prisma.userSession.findFirst({
        where: { presentationId, nickname },
      });

      if (existingSession) {
        if (existingSession.socketId !== socket.id) {
          await prisma.userSession.update({
            where: { id: existingSession.id },
            data: { socketId: socket.id },
          });
        }
        socket.join(presentationId);
        currentPresentationId = presentationId;
        await emitUserList(io, presentationId);
        return;
      }

      await prisma.userSession.create({
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

  socket.on(
    "add_element",
    async ({ slideId, content, pos, size }, callback) => {
      try {
        validateStringField(slideId, "slideId");
        validateStringField(content, "content");
        validatePosition(pos);
        validateSize(size);
        console.log("aaa");

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

        console.log(element);

        if (!session?.presentationId) return;
        io.to(session.presentationId).emit("element_added", element);
        callback?.({ element });
      } catch (error: any) {
        socket.emit("error", error.message || "Add element failed");
        callback?.({ error: error.message });
      }
    }
  );

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

  socket.on("get_slide_elements", async ({ slideId }, callback) => {
    try {
      const elements = await prisma.slideElement.findMany({
        where: { slideId },
      });
      callback({ elements });
    } catch (error: any) {
      callback({ error: error.message || "Failed to get elements" });
    }
  });

  socket.on("presentationUpdate", async (data) => {
    try {
      const session = await getSession(socket.id);
      if (!isCreator(session)) return;

      const presentationId = data?.id;
      validateStringField(presentationId, "presentationId");

      socket.to(presentationId).emit("presentationUpdate", data);
    } catch (error: any) {
      socket.emit("error", error.message || "Presentation update failed");
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
      const delay = 1000;

      setTimeout(async () => {
        const stillConnected = io.sockets.sockets.get(socket.id);
        if (!stillConnected) {
          await prisma.userSession.deleteMany({
            where: { socketId: socket.id },
          });
          if (currentPresentationId) {
            await emitUserList(io, currentPresentationId);
          }
        }
      }, delay);
    } catch (error) {
      console.error("Error on disconnect cleanup:", error);
    }
  });
}
