import { socket } from "../lib/socket";
import {
  createPresentation,
  joinPresentation,
  fetchPresentations,
} from "../api/presentationApi";
import { toast } from "react-toastify";

export async function connectSocket() {
  if (!socket.connected) {
    socket.connect();
    await new Promise<void>((resolve) =>
      socket.once("connect", () => resolve())
    );
  }
  if (!socket.id) {
    toast.error("Socket ID not available");
    throw new Error("Socket ID not available");
  }
  return socket.id;
}

export async function createNewPresentation(title: string, nickname: string) {
  const socketId = await connectSocket();
  return await createPresentation(title, nickname, socketId);
}

export async function joinExistingPresentation(
  presentationId: string,
  nickname: string
) {
  const socketId = await connectSocket();
  return await joinPresentation(presentationId, nickname, socketId);
}

export async function loadPresentations() {
  try {
    return await fetchPresentations();
  } catch {
    toast.error("Failed to fetch presentations");
    throw new Error("Failed to fetch presentations");
  }
}
