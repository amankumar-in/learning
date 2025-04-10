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
  const headerAddBtn = document.getElementById("header-add-btn");
  const imageModal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const imageClose = document.querySelector(".image-close");
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("image-preview");
  const editImageInput = document.getElementById("edit-image");
  const editImagePreview = document.getElementById("edit-image-preview");

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
  // Add task button in header
  headerAddBtn.addEventListener("click", () => {
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
    const imageFile = document.getElementById("image").files[0];

    let imagePath = null;

    // Upload image if one is selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const imageData = await uploadResponse.json();
          imagePath = imageData.imagePath;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    const newTodo = {
      title: titleInput.value,
      description: descriptionInput.value,
      image: imagePath,
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
      document.getElementById("image").value = "";
      imagePreview.innerHTML = "";

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

  // Fixed openEditModal function
  function openEditModal(todo) {
    document.getElementById("edit-id").value = todo.id;
    document.getElementById("edit-title").value = todo.title;
    document.getElementById("edit-description").value = todo.description;

    // Clear previous image preview
    editImagePreview.innerHTML = "";

    // Show current image if exists
    if (todo.image) {
      const img = document.createElement("img");
      img.src = todo.image;
      editImagePreview.appendChild(img);
    }

    // Show the modal
    editModal.style.display = "block";

    // Add visible class to make it actually appear (this was missing)
    setTimeout(() => editModal.classList.add("visible"), 10);

    // Show the overlay
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.add("visible"), 10);
  }

  // Also fix the closeBtn event listener
  closeBtn.addEventListener("click", () => {
    editModal.classList.remove("visible");
    overlay.classList.remove("visible");

    // Hide after animation completes
    setTimeout(() => {
      editModal.style.display = "none";
      overlay.classList.add("hidden");
    }, 300);
  });

  // Update todo
  async function updateTodo(e) {
    e.preventDefault();

    const id = document.getElementById("edit-id").value;
    const title = document.getElementById("edit-title").value;
    const description = document.getElementById("edit-description").value;
    const imageFile = document.getElementById("edit-image").files[0];

    // Find the current todo to get the existing image if no new one is selected
    const currentTodo = todos.find((todo) => todo.id === parseInt(id));

    let imagePath = currentTodo.image;

    // Upload new image if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const imageData = await uploadResponse.json();
          imagePath = imageData.imagePath;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          image: imagePath,
        }),
      });

      const updatedTodo = await response.json();
      todos = todos.map((todo) =>
        todo.id === parseInt(id) ? updatedTodo : todo
      );
      renderTodos();

      // Clear the form and close modal
      document.getElementById("edit-image").value = "";
      editImagePreview.innerHTML = "";

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

    // Sort todos by priority first
    let filteredTodos = [...todos];
    filteredTodos.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    // Then apply filter
    if (currentFilter === "pending") {
      filteredTodos = filteredTodos.filter((todo) => !todo.completed);
    } else if (currentFilter === "completed") {
      filteredTodos = filteredTodos.filter((todo) => todo.completed);
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

      // Add image if exists
      if (todo.image) {
        const imageContainer = todoElement.querySelector(
          ".todo-image-container"
        );
        const img = document.createElement("img");
        img.src = todo.image;
        img.alt = todo.title;
        img.className = "todo-image";
        img.addEventListener("click", () => openImageModal(todo.image));
        imageContainer.appendChild(img);
      }

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

      // Add priority button event listeners
      todoElement
        .querySelector(".move-up-btn")
        .addEventListener("click", () => moveTodoUp(todo.id));
      todoElement
        .querySelector(".move-down-btn")
        .addEventListener("click", () => moveTodoDown(todo.id));

      todosContainer.appendChild(todoElement);
    });
  }

  // Move todo up in priority
  async function moveTodoUp(id) {
    try {
      const response = await fetch(`/api/todos/${id}/move-up`, {
        method: "PUT",
      });

      todos = await response.json();
      renderTodos();
    } catch (error) {
      console.error("Error moving todo up:", error);
    }
  }

  // Move todo down in priority
  async function moveTodoDown(id) {
    try {
      const response = await fetch(`/api/todos/${id}/move-down`, {
        method: "PUT",
      });

      todos = await response.json();
      renderTodos();
    } catch (error) {
      console.error("Error moving todo down:", error);
    }
  }
  // Close image modal
  imageClose.addEventListener("click", () => {
    imageModal.style.display = "none";
    overlay.classList.remove("visible");
    setTimeout(() => overlay.classList.add("hidden"), 300);
  });

  // Image preview for add form
  imageInput.addEventListener("change", function () {
    previewImage(this, imagePreview);
  });

  // Image preview for edit form
  editImageInput.addEventListener("change", function () {
    previewImage(this, editImagePreview);
  });
  // Preview selected image
  function previewImage(input, previewElement) {
    previewElement.innerHTML = "";
    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        previewElement.appendChild(img);
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  function openImageModal(imageSrc) {
    modalImage.src = imageSrc;
    imageModal.style.display = "block";

    // Add this line to make the modal visible
    setTimeout(() => imageModal.classList.add("visible"), 10);

    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.add("visible"), 10);
  }
});
