document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const todoForm = document.getElementById("todo-form");
  const todosContainer = document.getElementById("todos-container");
  const todoTemplate = document.getElementById("todo-template");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const closeBtn = document.querySelector(".close");
  const addTaskBtn = document.getElementById("add-task-btn");
  const addTodoForm = document.getElementById("add-todo-form");
  const closeFormBtn = document.getElementById("close-form-btn");
  const overlay = document.getElementById("overlay");
  const emptyState = document.getElementById("empty-state");

  let currentFilter = "all";
  let todos = [];

  // Fetch all todos on page load
  fetchTodos();

  // Event listeners
  todoForm.addEventListener("submit", addTodo);
  editForm.addEventListener("submit", updateTodo);

  // Close modal events
  closeBtn.addEventListener("click", () => {
    editModal.style.display = "none";
    overlay.classList.remove("visible");
    setTimeout(() => overlay.classList.add("hidden"), 300);
  });

  // Add task form events
  addTaskBtn.addEventListener("click", () => {
    addTodoForm.classList.remove("hidden");
    setTimeout(() => addTodoForm.classList.add("visible"), 10);
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.add("visible"), 10);
  });

  closeFormBtn.addEventListener("click", () => {
    addTodoForm.classList.remove("visible");
    overlay.classList.remove("visible");
    setTimeout(() => {
      overlay.classList.add("hidden");
      addTodoForm.classList.add("hidden");
    }, 300);
  });

  // Overlay click to close
  overlay.addEventListener("click", () => {
    if (addTodoForm.classList.contains("visible")) {
      addTodoForm.classList.remove("visible");
      setTimeout(() => addTodoForm.classList.add("hidden"), 300);
    }
    if (editModal.style.display === "block") {
      editModal.style.display = "none";
    }
    overlay.classList.remove("visible");
    setTimeout(() => overlay.classList.add("hidden"), 300);
  });

  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      renderTodos();
    });
  });

  // Fetch todos from API
  async function fetchTodos() {
    try {
      const response = await fetch("/api/todos");
      todos = await response.json();
      renderTodos();
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }

  // Add new todo
  async function addTodo(e) {
    e.preventDefault();

    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");

    const newTodo = {
      title: titleInput.value,
      description: descriptionInput.value,
    };

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      const addedTodo = await response.json();
      todos.push(addedTodo);
      renderTodos();

      // Clear the form
      titleInput.value = "";
      descriptionInput.value = "";

      // Close the form
      addTodoForm.classList.remove("visible");
      overlay.classList.remove("visible");
      setTimeout(() => {
        overlay.classList.add("hidden");
        addTodoForm.classList.add("hidden");
      }, 300);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }

  // Toggle todo completion status
  async function toggleTodoStatus(id, completed) {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });

      const updatedTodo = await response.json();
      todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo));
      renderTodos();
    } catch (error) {
      console.error("Error toggling todo status:", error);
    }
  }

  // Delete todo
  async function deleteTodo(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      todos = todos.filter((todo) => todo.id !== id);
      renderTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  // Open edit modal
  function openEditModal(todo) {
    document.getElementById("edit-id").value = todo.id;
    document.getElementById("edit-title").value = todo.title;
    document.getElementById("edit-description").value = todo.description;

    editModal.style.display = "block";
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.add("visible"), 10);
  }

  // Update todo
  async function updateTodo(e) {
    e.preventDefault();

    const id = document.getElementById("edit-id").value;
    const title = document.getElementById("edit-title").value;
    const description = document.getElementById("edit-description").value;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      const updatedTodo = await response.json();
      todos = todos.map((todo) =>
        todo.id === parseInt(id) ? updatedTodo : todo
      );
      renderTodos();

      // Close the modal
      editModal.style.display = "none";
      overlay.classList.remove("visible");
      setTimeout(() => overlay.classList.add("hidden"), 300);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  // Render todos based on filter
  function renderTodos() {
    todosContainer.innerHTML = "";

    let filteredTodos = todos;

    if (currentFilter === "pending") {
      filteredTodos = todos.filter((todo) => !todo.completed);
    } else if (currentFilter === "completed") {
      filteredTodos = todos.filter((todo) => todo.completed);
    }

    // Show/hide empty state
    if (filteredTodos.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }

    filteredTodos.forEach((todo) => {
      const todoElement = todoTemplate.content.cloneNode(true);
      const todoItem = todoElement.querySelector(".todo-item");

      if (todo.completed) {
        todoItem.classList.add("completed");
      }

      todoElement.querySelector(".todo-title").textContent = todo.title;
      todoElement.querySelector(".todo-description").textContent =
        todo.description || "No description";

      const toggleBtn = todoElement.querySelector(".toggle-btn");
      toggleBtn.title = todo.completed ? "Mark Pending" : "Mark Complete";
      toggleBtn.querySelector("i").className = todo.completed
        ? "fas fa-undo"
        : "fas fa-check";
      toggleBtn.addEventListener("click", () =>
        toggleTodoStatus(todo.id, todo.completed)
      );

      todoElement
        .querySelector(".edit-btn")
        .addEventListener("click", () => openEditModal(todo));
      todoElement
        .querySelector(".delete-btn")
        .addEventListener("click", () => deleteTodo(todo.id));

      todosContainer.appendChild(todoElement);
    });
  }
});
