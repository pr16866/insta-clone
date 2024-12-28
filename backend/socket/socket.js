import express from "express";
import http from "http";
import { Server } from "socket.io";
import { User } from "../models/user.model.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const connectedUsers = {};

// Utility function to get online followers
const getOnlineUsers = async (userId, listType) => {
  try {
    const user = await User.findById(userId).populate(listType, "_id");
    if (!user) return [];

    // Get online users who are in the user's followers or following list
    return user[listType]
      .map((listUser) => listUser._id.toString())
      .filter((listUserId) => connectedUsers[listUserId]);
  } catch (error) {
    console.error(`Error fetching ${listType}:`, error);
    return [];
  }
};

io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
  
    if (!userId) {
      console.error("User ID is missing in handshake query.");
      socket.disconnect();
      return;
    }
  
    // Save connected user
    connectedUsers[userId] = socket.id;
  
    // Fetch online followers and following
    const onlineFollowers = await getOnlineUsers(userId, "followers");
    const onlineFollowing = await getOnlineUsers(userId, "following");
  
    // Merge and remove duplicates
    let onlineUsers = [...new Set([...onlineFollowers, ...onlineFollowing])].flat();
  
    console.log("Online Users:", onlineUsers); // Debugging log
  
    // Emit properly formatted online users to the connected client
    io.to(socket.id).emit("onlineUsers", onlineUsers);
  
    // Handle user disconnect
    socket.on("disconnect", () => {
      delete connectedUsers[userId];
  
      // Optionally notify other users
      io.emit(
        "onlineUsers",
        onlineUsers.filter((id) => id !== userId).flat() // Emit updated list
      );
    });
  });
  

export { app, server, io, connectedUsers };
