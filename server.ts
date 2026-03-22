import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // State management
  const sessions: Record<string, {
    teacherId: string;
    students: Record<string, { id: string; name: string; status: string }>;
    isLocked: boolean;
    boardData: any;
    currentQuestion: any;
    answers: Record<string, any>;
    gameState: {
      type: 'balloons' | 'sorting';
      level: 'easy' | 'medium' | 'hard';
      active: boolean;
      data: any;
      scores: Record<string, { name: string; score: number }>;
    } | null;
  }> = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create-session", () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      sessions[code] = {
        teacherId: socket.id,
        students: {},
        isLocked: false,
        boardData: { lines: [], images: [], texts: [] },
        currentQuestion: null,
        answers: {},
        gameState: null,
      };
      socket.join(code);
      socket.emit("session-created", code);
    });

    socket.on("join-session", ({ code, name }) => {
      if (sessions[code]) {
        socket.join(code);
        sessions[code].students[socket.id] = { id: socket.id, name, status: "online" };
        socket.emit("joined-success", { 
          isLocked: sessions[code].isLocked, 
          boardData: sessions[code].boardData,
          currentQuestion: sessions[code].currentQuestion,
          gameState: sessions[code].gameState
        });
        io.to(sessions[code].teacherId).emit("student-joined", sessions[code].students);
      } else {
        socket.emit("join-error", "Session not found");
      }
    });

    socket.on("draw", ({ code, data }) => {
      if (sessions[code]) {
        sessions[code].boardData = data;
        // Always sync teacher's board to students
        // Or sync student's board if it's locked (teacher is controlling)
        if (socket.id === sessions[code].teacherId || sessions[code].isLocked) {
          socket.to(code).emit("sync-board", data);
        }
      }
    });

    socket.on("toggle-lock", ({ code, isLocked }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        sessions[code].isLocked = isLocked;
        io.to(code).emit("lock-status", { isLocked, boardData: sessions[code].boardData });
      }
    });

    socket.on("send-question", ({ code, question }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        sessions[code].currentQuestion = question;
        sessions[code].answers = {};
        sessions[code].isLocked = false;
        io.to(code).emit("new-question", question);
        io.to(code).emit("lock-status", { isLocked: false });
      }
    });

    socket.on("submit-answer", ({ code, answer }) => {
      if (sessions[code] && sessions[code].students[socket.id]) {
        sessions[code].answers[socket.id] = {
          studentName: sessions[code].students[socket.id].name,
          answer
        };
        io.to(sessions[code].teacherId).emit("answer-received", sessions[code].answers);
      }
    });

    socket.on("start-game", ({ code, type, level, data }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        sessions[code].gameState = {
          type,
          level,
          active: true,
          data,
          scores: {}
        };
        io.to(code).emit("game-started", sessions[code].gameState);
      }
    });

    socket.on("update-score", ({ code, score }) => {
      if (sessions[code] && sessions[code].students[socket.id]) {
        const student = sessions[code].students[socket.id];
        if (sessions[code].gameState) {
          sessions[code].gameState.scores[socket.id] = {
            name: student.name,
            score
          };
          io.to(sessions[code].teacherId).emit("game-scores", sessions[code].gameState.scores);
        }
      }
    });

    socket.on("stop-game", ({ code }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        if (sessions[code].gameState) {
          sessions[code].gameState.active = false;
          io.to(code).emit("game-stopped");
        }
      }
    });

    socket.on("clear-board", ({ code }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        sessions[code].boardData = { lines: [], images: [], texts: [] };
        io.to(code).emit("sync-board", sessions[code].boardData);
      }
    });

    socket.on("give-feedback", ({ code, studentId, feedback }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        if (sessions[code].answers[studentId]) {
          sessions[code].answers[studentId] = {
            ...sessions[code].answers[studentId],
            ...feedback
          };
          io.to(studentId).emit("feedback-received", feedback);
          io.to(sessions[code].teacherId).emit("answer-received", sessions[code].answers);
        }
      }
    });

    socket.on("send-assignment", ({ code, assignment }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        io.to(code).emit("new-assignment", assignment);
      }
    });

    socket.on("submit-assignment", ({ code, submission }) => {
      if (sessions[code]) {
        io.to(sessions[code].teacherId).emit("assignment-submitted", submission);
      }
    });

    socket.on("grade-assignment", ({ code, submission }) => {
      if (sessions[code] && sessions[code].teacherId === socket.id) {
        io.to(submission.studentId).emit("assignment-graded", submission);
        io.to(sessions[code].teacherId).emit("assignment-submitted", submission);
      }
    });

    socket.on("disconnect", () => {
      // Cleanup logic could be added here
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
