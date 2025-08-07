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

export function validateStringField(field: any, fieldName: string) {
  if (typeof field !== "string" || field.trim() === "") {
    throw new Error(`Invalid or missing field: ${fieldName}`);
  }
}

export function validateStringOrEmpty(field: any, fieldName: string) {
  if (typeof field !== "string") {
    throw new Error(`Invalid field: ${fieldName} must be a string`);
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
