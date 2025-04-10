const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
let { todos } = require("./todos");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "public/uploads");
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "image-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});

// Get all todos
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post("/api/todos", (req, res) => {
  const { title, description, image } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1,
    title,
    description: description || "",
    image: image || null,
    completed: false,
    priority:
      todos.length > 0
        ? Math.max(...todos.map((todo) => todo.priority || 0)) + 1
        : 1,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update a todo
app.put("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, completed, image } = req.body;

  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    title: title !== undefined ? title : todos[todoIndex].title,
    description:
      description !== undefined ? description : todos[todoIndex].description,
    completed: completed !== undefined ? completed : todos[todoIndex].completed,
    image: image !== undefined ? image : todos[todoIndex].image,
  };

  res.json(todos[todoIndex]);
});

// Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const deletedTodo = todos[todoIndex];
  todos = todos.filter((todo) => todo.id !== id);

  res.json(deletedTodo);
});

// Root route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Move todo up in priority
app.put("/api/todos/:id/move-up", (req, res) => {
  const id = parseInt(req.params.id);

  // Sort todos by priority
  todos.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  // If already at the top, just return the current list
  if (todoIndex === 0) {
    return res.json(todos);
  }

  // Swap priorities with the todo above
  const temp = todos[todoIndex].priority;
  todos[todoIndex].priority = todos[todoIndex - 1].priority;
  todos[todoIndex - 1].priority = temp;

  // Sort todos by priority
  todos.sort((a, b) => (a.priority || 0) - (b.priority || 0));

  res.json(todos);
});

// Move todo down in priority
app.put("/api/todos/:id/move-down", (req, res) => {
  const id = parseInt(req.params.id);

  // Sort todos by priority
  todos.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  // If already at the bottom, just return the current list
  if (todoIndex === todos.length - 1) {
    return res.json(todos);
  }

  // Swap priorities with the todo below
  const temp = todos[todoIndex].priority;
  todos[todoIndex].priority = todos[todoIndex + 1].priority;
  todos[todoIndex + 1].priority = temp;

  // Sort todos by priority
  todos.sort((a, b) => (a.priority || 0) - (b.priority || 0));

  res.json(todos);
});

// Upload image
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Return the image path relative to public folder
  const imagePath = "/uploads/" + req.file.filename;
  res.json({ imagePath });
});
