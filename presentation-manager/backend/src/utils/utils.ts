import { Server, Socket } from "socket.io";
import { prisma } from "../prisma/prisma.ts";
import { UserRoles } from "../types.ts";

export async function getSession(socketId: string) {
  return await prisma.userSession.findFirst({ where: { socketId } });
}

export function isCreator(session: { role: string } | null) {
  return session?.role === UserRoles.CREATOR;
}

export function isEditor(session: { role: string } | null) {
  return session && session.role !== UserRoles.VIEWER;
}

export async function emitUserList(io: Server, presentationId: string) {
  const users = await prisma.userSession.findMany({
    where: { presentationId },
    select: { id: true, nickname: true, role: true },
  });
  io.to(presentationId).emit("user_list_update", users);
}

export function validateStringField(field: any, fieldName: string) {
  if (typeof field !== "string" || field.trim() === "") {
    throw new Error(`Invalid or missing field: ${fieldName}`);
  }
}

export function validatePosition(pos: any) {
  if (
    typeof pos !== "object" ||
    typeof pos.x !== "number" ||
    typeof pos.y !== "number"
  ) {
    throw new Error("Invalid position");
  }
}

export function validateSize(size: any) {
  if (
    typeof size !== "object" ||
    typeof size.width !== "number" ||
    typeof size.height !== "number"
  ) {
    throw new Error("Invalid size");
  }
}
