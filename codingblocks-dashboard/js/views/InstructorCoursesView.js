// Enhanced Instructor Courses View
class InstructorCoursesView {
  constructor(controller, user, courses) {
    this.controller = controller;
    this.user = user;
    this.courses = courses;
    this.filteredCourses = [...courses];
    this.filterStatus = "all"; // all, active, upcoming, completed
  }

  render() {
    // Get the main container
    const main = document.querySelector("main");
    main.innerHTML = "";

    // Create the welcome section
    const welcomeSection = document.createElement("div");
    welcomeSection.className = "welcome-banner";

    welcomeSection.innerHTML = `
      <div class="welcome-content">
        <h2>Course Management</h2>
        <p class="welcome-subtitle">${
          this.user.role === "teacher"
            ? "Manage your teaching courses"
            : "Manage your assistant courses"
        }</p>
      </div>
    `;

    main.appendChild(welcomeSection);

    // Create courses management section
    const coursesSection = document.createElement("section");
    coursesSection.className = "dashboard-section courses-management-section";

    // Create filters and actions bar
    const actionsBar = document.createElement("div");
    actionsBar.className = "section-header";

    actionsBar.innerHTML = `
      <div class="section-title">
        <h3>My Courses</h3>
        <span class="section-count">${this.courses.length} courses</span>
      </div>
      <div class="primary-actions">
        <div class="course-search-wrapper">
          <input type="text" id="search-courses" placeholder="Search courses...">
          <i class="search-icon"></i>
        </div>
        <button id="create-course-btn" class="btn-primary">
          <i class="icon-plus"></i> Create New Course
        </button>
      </div>
    `;

    coursesSection.appendChild(actionsBar);

    // Create courses grid container
    const coursesContainer = document.createElement("div");
    coursesContainer.id = "courses-container";
    coursesContainer.className = "courses-grid-container";

    if (this.courses.length === 0) {
      // No courses message
      coursesContainer.innerHTML = `
        <div class="no-courses">
          <div class="empty-state">
            <div class="empty-icon">📚</div>
            <h4>No Courses Yet</h4>
            <p>${
              this.user.role === "teacher"
                ? "You are not teaching any courses yet."
                : "You are not assisting any courses yet."
            }</p>
            <p>Click the "Create New Course" button to get started.</p>
          </div>
        </div>
      `;
    } else {
      // Add course stats
      const statsSummary = document.createElement("div");
      statsSummary.className = "stats-summary";

      // Calculate statistics
      const activeCourses = this.courses.filter((course) => {
        const now = new Date();
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        return now >= startDate && now <= endDate;
      }).length;

      const totalStudents = this.courses.reduce(
        (sum, course) => sum + course.studentIds.length,
        0
      );

      statsSummary.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${this.courses.length}</div>
          <div class="stat-label">Total Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${activeCourses}</div>
          <div class="stat-label">Active Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalStudents}</div>
          <div class="stat-label">Total Students</div>
        </div>
      `;

      coursesContainer.appendChild(statsSummary);

      // Add filter tabs
      const filterTabs = document.createElement("div");
      filterTabs.className = "course-filter-tabs";
      filterTabs.innerHTML = `
        <button class="filter-tab active" data-filter="all">All Courses</button>
        <button class="filter-tab" data-filter="active">Active</button>
        <button class="filter-tab" data-filter="upcoming">Upcoming</button>
        <button class="filter-tab" data-filter="completed">Completed</button>
      `;

      coursesContainer.appendChild(filterTabs);

      // Render the courses grid
      const coursesGrid = document.createElement("div");
      coursesGrid.className = "courses-grid";

      this.renderCoursesGrid(coursesGrid);
      coursesContainer.appendChild(coursesGrid);
    }

    coursesSection.appendChild(coursesContainer);
    main.appendChild(coursesSection);

    // Add event listeners
    document
      .getElementById("create-course-btn")
      .addEventListener("click", () => {
        this.controller.showCreateCourseForm();
      });

    // Add event listeners for filter tabs
    const filterTabs = document.querySelectorAll(".filter-tab");
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        // Remove active class from all tabs
        filterTabs.forEach((t) => t.classList.remove("active"));

        // Add active class to clicked tab
        e.target.classList.add("active");

        // Set the filter status and apply filtering
        this.filterStatus = e.target.dataset.filter;
        this.filterCourses();
      });
    });

    // Add event listener for search
    document
      .getElementById("search-courses")
      ?.addEventListener("input", (e) => {
        this.filterCourses(e.target.value);
      });
  }

  renderCoursesGrid(container) {
    container.innerHTML = "";

    this.filteredCourses.forEach((course) => {
      const courseCard = this.createCourseCard(course);
      container.appendChild(courseCard);

      // Get the buttons directly from the course card we just added
      const viewDetailsBtn = courseCard.querySelector(
        `#view-details-${course.id}`
      );
      const editCourseBtn = courseCard.querySelector(
        `#edit-course-${course.id}`
      );
      const deleteCourseBtn = courseCard.querySelector(
        `#delete-course-${course.id}`
      );

      // Add event listeners to the buttons
      viewDetailsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.controller.showCourseDetails(course.id);
      });

      editCourseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.controller.showEditCourseForm(course.id);
      });

      deleteCourseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (
          confirm(
            `Are you sure you want to delete "${course.name}"? This action cannot be undone.`
          )
        ) {
          this.controller.deleteCourse(course.id);
        }
      });

      // Make the whole card clickable
      courseCard.addEventListener("click", () => {
        this.controller.showCourseDetails(course.id);
      });
    });
  }

  createCourseCard(course) {
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);

    let status = "active";
    let statusClass = "status-active";
    let statusText = "Active";

    if (startDate > now) {
      status = "upcoming";
      statusClass = "status-upcoming";
      statusText = "Upcoming";
    } else if (endDate < now) {
      status = "completed";
      statusClass = "status-completed";
      statusText = "Completed";
    }

    // Calculate progress safely
    let progress = 0;
    try {
      progress = course.calculateProgress
        ? course.calculateProgress()
        : this.estimateCourseProgress(course);
    } catch (error) {
      progress = this.estimateCourseProgress(course);
    }

    const studentCount = course.studentIds.length;

    const courseCard = document.createElement("div");
    courseCard.id = `course-${course.id}`;
    courseCard.className = "course-card";
    courseCard.dataset.status = status;

    courseCard.innerHTML = `
      <div class="course-card-header">
        <h4>${course.name}</h4>
        <span class="course-badge ${statusClass}">${statusText}</span>
      </div>
      <p class="course-description">${course.description}</p>
      <div class="course-details">
        <div class="course-detail-item">
          <i class="icon-calendar"></i>
          <span>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
        </div>
        <div class="course-stats">
          <div class="course-stat">
            <span class="stat-label">Students</span>
            <span class="stat-value">${studentCount}</span>
          </div>
          <div class="course-stat">
            <span class="stat-label">Progress</span>
            <span class="stat-value">${progress}%</span>
          </div>
        </div>
        <div class="course-progress-container">
          <div class="course-progress-label">Course Progress</div>
          <div class="progress-bar">
            <div class="progress" style="width: ${progress}%"></div>
          </div>
        </div>
      </div>
      <div class="course-actions">
        <button id="view-details-${
          course.id
        }" class="btn-primary">View Details</button>
        <button id="edit-course-${
          course.id
        }" class="btn-secondary">Edit</button>
        <button id="delete-course-${
          course.id
        }" class="btn-danger">Delete</button>
      </div>
    `;

    return courseCard;
  }

  estimateCourseProgress(course) {
    // Calculate based on calendar entries if available
    if (course.calendar && Array.isArray(course.calendar)) {
      // Calculate total planned classes
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      const daysBetween = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );
      const weeksCount = Math.ceil(daysBetween / 7);

      // If we have schedule, use it, otherwise assume 2 classes per week
      const classesPerWeek = course.schedule ? course.schedule.length : 2;
      const totalPlannedClasses = weeksCount * classesPerWeek;

      // Calculate progress based on completed classes
      const completedClasses = course.calendar.length;
      return Math.min(
        100,
        Math.round((completedClasses / totalPlannedClasses) * 100)
      );
    }

    // If no calendar data, estimate based on date range
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);

    if (now < startDate) {
      return 0; // Course hasn't started
    }

    if (now > endDate) {
      return 100; // Course has ended
    }

    // Calculate progress based on timeline
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    return Math.min(
      100,
      Math.max(0, Math.round((elapsed / totalDuration) * 100))
    );
  }

  filterCourses(searchQuery = "") {
    const query = searchQuery.toLowerCase();
    const now = new Date();

    this.filteredCourses = this.courses.filter((course) => {
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      // Determine course status
      let status = "active";
      if (startDate > now) {
        status = "upcoming";
      } else if (endDate < now) {
        status = "completed";
      }

      // Filter by status
      if (this.filterStatus !== "all" && status !== this.filterStatus) {
        return false;
      }

      // Filter by search query
      if (query) {
        return (
          course.name.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Re-render the courses grid
    const coursesContainer = document.getElementById("courses-container");
    if (coursesContainer) {
      const coursesGrid = coursesContainer.querySelector(".courses-grid");
      if (coursesGrid) {
        this.renderCoursesGrid(coursesGrid);
      }
    }
  }

  hide() {
    // Clear the main container
    const main = document.querySelector("main");
    main.innerHTML = "";
  }
}
