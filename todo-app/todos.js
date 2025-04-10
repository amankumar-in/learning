// In-memory store for todos
let todos = [
  {
    id: 1,
    title: "Complete project setup",
    description: "Set up the project structure and deploy to Render",
    completed: true,
    priority: 1,
    image: "./images/image-support.jpg", // Using relative path format with ./
  },
  {
    id: 2,
    title: "Implement todo functionality",
    description: "Create the backend and frontend for the todo app",
    completed: false,
    priority: 2,
    image: "./images/project-setup.jpg", // Using relative path format with ./
  },
  {
    id: 3,
    title: "Add image support",
    description: "Enable image uploads and previews for tasks",
    completed: false,
    priority: 3,
    image: "./images/todo-app.jpg", // Using relative path format with ./
  },
];

module.exports = { todos };
