const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_KEY}@cluster0.1bvy3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);
const accountCollection = client.db("taskManagerDB").collection("accounts");
const taskCollection = client.db("taskManagerDB").collection("taskRecords");

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const verifyToken = async (req, res, next) => {
      const token = req.cookies?.token;
      if (!token) return res.status(401).send({ message: "Unauthorized access" });

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Unauthorized access" });
        req.decoded = decoded;
        next();
      });
    };

    // JWT Token generation
    app.post("/jwt", async (req, res) => {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "365d" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
        })
        .json({ success: true });
    });

    // Logout
    app.get("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          maxAge: 0,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Add account
    app.post("/accounts", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exist = await accountCollection.findOne(query);
      if (exist) return res.send({ message: "User already exists", insertedId: null });
      const result = await accountCollection.insertOne(user);
      res.send(result);
    });

    // Fetch all accounts
    app.get("/accounts", async (req, res) => {
      const accounts = await accountCollection.find().toArray();
      res.send(accounts);
    });

    // Add task
    app.post("/records", verifyToken, async (req, res) => {
      const { title, description, category } = req.body;
      if (!title || title.length > 50) return res.status(400).json({ error: "Invalid title" });

      const newTask = {
        userId: req.decoded.email,
        title,
        description,
        category: category || "To-Do",
        createdAt: new Date(),
      };
      const result = await taskCollection.insertOne(newTask);
      io.emit(`task-updated-${req.decoded.email}`);
      res.json({ ...newTask, _id: result.insertedId });
    });

    // Fetch tasks
    app.get("/records/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      if (email !== req.decoded.email) return res.status(403).json({ error: "Unauthorized access" });

      const tasks = await taskCollection.find({ userId: email }).toArray();
      res.send(tasks);
    });

    // Update task
    app.put("/records/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const { title, description, category } = req.body;
      const updateFields = {};
      if (title && title.length <= 50) updateFields.title = title;
      if (description && description.length <= 200) updateFields.description = description;
      if (category) updateFields.category = category;

      const result = await taskCollection.updateOne(
        { _id: new ObjectId(id), userId: req.decoded.email },
        { $set: updateFields }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: "Task not found" });

      io.emit(`task-updated-${req.decoded.email}`);
      res.json({ message: "Task updated", taskId: id });
    });


    
// app.patch("/tasks/:id", verifyToken,validateObjectId, async (req, res) => {
//   try {
//       const { id } = req.params;
      
//       // Validate if id exists
//       if (!id) {
//           return res.status(400).json({ error: "Task ID is required" });
//       }

//       // Validate if id is a valid ObjectId
//       if (!ObjectId.isValid(id)) {
//           return res.status(400).json({ error: "Invalid task ID format" });
//       }

//       const { title, description, category } = req.body;
//       const updateFields = {};

//       if (title && title.length <= 50) updateFields.title = title;
//       if (description && description.length <= 200) updateFields.description = description;
//       if (category) updateFields.category = category;

//       const result = await taskCollection.updateOne(
//           { _id: new ObjectId(id), userId: req.decoded.email },
//           { $set: updateFields }
//       );

//       if (result.matchedCount === 0) {
//           return res.status(404).json({ 
//               error: "Task not found",
//               details: `No task found with ID: ${id} for user: ${req.decoded.email}`
//           });
//       }

//       io.emit(`task-updated-${req.decoded.email}`);
//       res.json({ 
//           message: "Task updated",
//           taskId: id,
//           updatedFields: updateFields
//       });
//   } catch (error) {
//       console.error("Error updating task:", error);
//       res.status(500).json({ 
//           error: "Internal server error",
//           details: error.message
//       });
//   }
// });

app.patch("/tasks/:id", verifyToken, async (req, res) => {
  try {
      const { id } = req.params;
      
      if (!id || !ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid task ID" });
      }

      const { title, description, category } = req.body;
      const updateFields = {};

      if (title && title.length <= 50) updateFields.title = title;
      if (description && description.length <= 200) updateFields.description = description;
      if (category) updateFields.category = category;

      const result = await taskCollection.updateOne(
          { _id: new ObjectId(id), userId: req.decoded.email },
          { $set: updateFields }
      );

      if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Task not found" });
      }

      console.log(`Task updated: ${id}`, updateFields);

      io.emit(`task-updated-${req.decoded.email}`);
      res.json({ message: "Task updated", taskId: id, updatedFields: updateFields });
  } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


    // Delete task
    app.delete("/records/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id), userId: req.decoded.email });
      if (result.deletedCount === 0) return res.status(404).json({ error: "Task not found" });

      io.emit(`task-updated-${req.decoded.email}`);
      res.json({ message: "Task deleted" });
    });

    // Start the server
    httpServer.listen(port, () => console.log(`Server is running on port ${port}`));

    io.on("connection", (socket) => {
      console.log("Client connected");
      socket.on("join-room", (userId) => socket.join(userId));
      socket.on("disconnect", () => console.log("Client disconnected"));
    });

    app.get("/", (req, res) => res.send("Hello from TaskMate Server.."));
  } catch (err) {
    console.error(err);
  }
}

run();
