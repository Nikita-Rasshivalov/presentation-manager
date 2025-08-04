import { Server, Socket } from "socket.io";
import { handlePresentationEvents } from "./presentationSocket.ts";

export default function registerSocketHandlers(socket: Socket, io: Server) {
  console.log(`Socket connected: ${socket.id}`);

  handlePresentationEvents(socket, io);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
}
