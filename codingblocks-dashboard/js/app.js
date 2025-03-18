// Main Application Entry Point

// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Coding Blocks Dashboard initializing...");

  try {
    // Initialize the data store
    await dataStore.initialize();

    // Create and initialize the auth controller
    const authController = new AuthController(dataStore);
    await authController.init();

    // Add event listeners for navigation
    setupNavigation();

    console.log("Coding Blocks Dashboard initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    showErrorMessage(
      "Failed to initialize the application. Please refresh the page and try again."
    );
  }
});

// Set up navigation event listeners
function setupNavigation() {
  // Desktop navigation
  const navDashboard = document.getElementById("nav-dashboard");
  const navCourses = document.getElementById("nav-courses");
  const userMenuToggle = document.getElementById("user-menu-toggle");

  // Mobile navigation
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileNavDashboard = document.getElementById("mobile-nav-dashboard");
  const mobileNavCourses = document.getElementById("mobile-nav-courses");
  const mobileNavProfile = document.getElementById("mobile-nav-profile");
  const mobileNavLogout = document.getElementById("mobile-nav-logout");

  // Mobile menu toggle
  mobileMenuToggle.addEventListener("click", function () {
    mobileMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!mobileMenu.contains(e.target) && e.target !== mobileMenuToggle) {
      mobileMenu.classList.remove("active");
    }
  });

  // Update nav link active states
  function setActiveNavLink(id) {
    // Desktop nav
    document
      .querySelectorAll("nav a")
      .forEach((link) => link.classList.remove("active"));
    document.getElementById(id)?.classList.add("active");

    // Mobile nav
    document
      .querySelectorAll(".mobile-menu a")
      .forEach((link) => link.classList.remove("active"));
    document.getElementById(`mobile-${id}`)?.classList.add("active");
  }

  // Check if user is authenticated
  const user = dataStore.checkAuthentication();

  // Set initial user avatar
  if (user) {
    userMenuToggle.textContent = user.name.charAt(0);
  }

  if (user) {
    // Desktop Navigation
    // Dashboard link
    navDashboard.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveNavLink("nav-dashboard");
      navigateToDashboard(user);
      mobileMenu.classList.remove("active");
    });

    // Courses link
    navCourses.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveNavLink("nav-courses");
      navigateToCourses(user);
      mobileMenu.classList.remove("active");
    });

    // User menu toggle
    userMenuToggle.addEventListener("click", function () {
      const dropdown = document.getElementById("user-menu-dropdown");
      dropdown.classList.toggle("active");

      // Close dropdown when clicking elsewhere
      document.addEventListener("click", function closeMenu(e) {
        if (
          !userMenuToggle.contains(e.target) &&
          !dropdown.contains(e.target)
        ) {
          dropdown.classList.remove("active");
          document.removeEventListener("click", closeMenu);
        }
      });
    });

    // Profile link in dropdown menu
    const navProfile = document.getElementById("nav-profile");
    if (navProfile) {
      navProfile.addEventListener("click", function () {
        if (user.role === "teacher" || user.role === "assistant") {
          const dashboardController = new InstructorDashboardController(
            dataStore
          );
          dashboardController.showUserProfile();
        } else if (user.role === "student") {
          const dashboardController = new StudentDashboardController(dataStore);
          dashboardController.showUserProfile();
        }
        document
          .getElementById("user-menu-dropdown")
          .classList.remove("active");
      });
    }

    // Logout link in dropdown menu
    const navLogout = document.getElementById("nav-logout");
    if (navLogout) {
      navLogout.addEventListener("click", function () {
        dataStore.logout();
        window.location.href = "index.html";
      });
    }

    // Mobile Navigation
    // Dashboard link
    mobileNavDashboard.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveNavLink("nav-dashboard");
      navigateToDashboard(user);
      mobileMenu.classList.remove("active");
    });

    // Courses link
    mobileNavCourses.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveNavLink("nav-courses");
      navigateToCourses(user);
      mobileMenu.classList.remove("active");
    });

    // Profile link
    mobileNavProfile.addEventListener("click", function (e) {
      e.preventDefault();
      if (user.role === "teacher" || user.role === "assistant") {
        const dashboardController = new InstructorDashboardController(
          dataStore
        );
        dashboardController.showUserProfile();
      } else if (user.role === "student") {
        const dashboardController = new StudentDashboardController(dataStore);
        dashboardController.showUserProfile();
      }
      mobileMenu.classList.remove("active");
    });

    // Logout link
    mobileNavLogout.addEventListener("click", function (e) {
      e.preventDefault();
      dataStore.logout();
      window.location.href = "index.html";
    });
  } else {
    // If not authenticated, all links should redirect to login
    const allLinks = [
      navDashboard,
      navCourses,
      mobileNavDashboard,
      mobileNavCourses,
      mobileNavProfile,
    ];

    allLinks.forEach((link) => {
      if (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();

          // Create and initialize the auth controller
          const authController = new AuthController(dataStore);
          authController.init();

          // Close mobile menu
          mobileMenu.classList.remove("active");
        });
      }
    });

    // Logout should still work
    if (mobileNavLogout) {
      mobileNavLogout.addEventListener("click", function (e) {
        e.preventDefault();

        // Create and initialize the auth controller
        const authController = new AuthController(dataStore);
        authController.init();

        // Close mobile menu
        mobileMenu.classList.remove("active");
      });
    }
  }
}

// Navigate to dashboard based on user role
function navigateToDashboard(user) {
  if (user.role === "teacher" || user.role === "assistant") {
    const dashboardController = new InstructorDashboardController(dataStore);
    dashboardController.init();
  } else if (user.role === "student") {
    const dashboardController = new StudentDashboardController(dataStore);
    dashboardController.init();
  }
}

// Navigate to courses based on user role
function navigateToCourses(user) {
  if (user.role === "teacher" || user.role === "assistant") {
    const dashboardController = new InstructorDashboardController(dataStore);
    dashboardController.showCoursesManagement();
  } else if (user.role === "student") {
    const dashboardController = new StudentDashboardController(dataStore);
    dashboardController.showCoursesView();
  }
}

// Show an error message
function showErrorMessage(message) {
  const main = document.querySelector("main");

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-container";
  errorDiv.innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
        <button class="btn-primary" onclick="location.reload()">Refresh Page</button>
    `;

  main.innerHTML = "";
  main.appendChild(errorDiv);
}
