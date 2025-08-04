import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import registerSocketHandlers from "./sockets/index.ts";
import presentationRoutes from "./routes/presentationRouter.ts";

const app = express();

const allowedOrigins = ["http://localhost:3000"];

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/presentations", presentationRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  registerSocketHandlers(socket, io);
});

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
