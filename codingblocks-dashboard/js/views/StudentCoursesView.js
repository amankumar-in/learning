// Enhanced Student Courses View
class StudentCoursesView {
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
    welcomeSection.className = "welcome-banner student-banner";

    welcomeSection.innerHTML = `
      <div class="welcome-content">
        <h2>My Courses</h2>
        <p class="welcome-subtitle">Track your enrolled courses and learning progress</p>
      </div>
    `;

    main.appendChild(welcomeSection);

    // Create courses section
    const coursesSection = document.createElement("section");
    coursesSection.className = "dashboard-section courses-section";

    // Create filters bar
    const filtersBar = document.createElement("div");
    filtersBar.className = "section-header";

    filtersBar.innerHTML = `
      <div class="section-title">
        <h3>My Enrolled Courses</h3>
        <span class="section-count">${this.courses.length} courses</span>
      </div>
      <div class="course-search-wrapper">
        <input type="text" id="search-courses" placeholder="Search my courses...">
        <i class="search-icon"></i>
      </div>
    `;

    coursesSection.appendChild(filtersBar);

    // Create courses container
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
            <p>You are not currently enrolled in any courses.</p>
            <p>Please contact your instructor to enroll in courses.</p>
          </div>
        </div>
      `;
    } else {
      // Calculate overall attendance and progress stats
      const totalClasses = this.courses.reduce((sum, course) => {
        const attendance = this.user.calculateAttendance(course);
        return sum + attendance.total;
      }, 0);

      const attendedClasses = this.courses.reduce((sum, course) => {
        const attendance = this.user.calculateAttendance(course);
        return sum + attendance.attended;
      }, 0);

      const overallAttendance =
        totalClasses > 0
          ? Math.round((attendedClasses / totalClasses) * 100)
          : 0;

      // Add stats summary
      const statsSummary = document.createElement("div");
      statsSummary.className = "stats-summary";

      statsSummary.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${this.courses.length}</div>
          <div class="stat-label">Enrolled Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${overallAttendance}%</div>
          <div class="stat-label">Overall Attendance</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${attendedClasses}/${totalClasses}</div>
          <div class="stat-label">Classes Attended</div>
        </div>
      `;

      coursesContainer.appendChild(statsSummary);

      // Add filter tabs
      const filterTabs = document.createElement("div");
      filterTabs.className = "course-filter-tabs";
      filterTabs.innerHTML = `
        <button class="filter-tab active" data-filter="all">All Courses</button>
        <button class="filter-tab" data-filter="active">In Progress</button>
        <button class="filter-tab" data-filter="upcoming">Upcoming</button>
        <button class="filter-tab" data-filter="completed">Completed</button>
      `;

      coursesContainer.appendChild(filterTabs);

      // Create courses grid
      const coursesGrid = document.createElement("div");
      coursesGrid.className = "courses-grid";

      this.renderCoursesGrid(coursesGrid);
      coursesContainer.appendChild(coursesGrid);
    }

    coursesSection.appendChild(coursesContainer);
    main.appendChild(coursesSection);

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

    // Add event listeners for course search
    const courseSearch = document.getElementById("search-courses");
    if (courseSearch) {
      courseSearch.addEventListener("input", (e) => {
        this.filterCourses(e.target.value);
      });
    }
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
      const calendarBtn = courseCard.querySelector(
        `#view-calendar-${course.id}`
      );

      // Add event listeners to the buttons
      viewDetailsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.controller.showCourseDetails(course.id);
      });

      calendarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.controller.showCourseCalendar(course.id);
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

    // Calculate attendance for this course
    const attendance = this.user.calculateAttendance(course);

    // Determine attendance status class
    let attendanceStatusClass = "status-excellent";
    if (attendance.percentage < 70) {
      attendanceStatusClass = "status-danger";
    } else if (attendance.percentage < 85) {
      attendanceStatusClass = "status-warning";
    }

    // Calculate course progress (estimate if not available)
    let progress = 0;
    try {
      progress = course.calculateProgress
        ? course.calculateProgress()
        : this.estimateCourseProgress(course);
    } catch (error) {
      progress = this.estimateCourseProgress(course);
    }

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
        <div class="course-progress-container">
          <div class="course-progress-label">Course Progress</div>
          <div class="course-progress-track">
            <div class="course-progress-bar" style="width: ${progress}%"></div>
          </div>
          <div class="course-progress-value">${progress}%</div>
        </div>
        <div class="attendance-container">
          <div class="progress-info">
            <span>Your Attendance</span>
            <span class="attendance-fraction">${attendance.attended}/${
      attendance.total
    } classes</span>
          </div>
          <div class="progress-bar">
            <div class="progress ${attendanceStatusClass}" style="width: ${
      attendance.percentage
    }%"></div>
          </div>
        </div>
      </div>
      <div class="course-actions">
        <button id="view-details-${
          course.id
        }" class="btn-primary view-details-btn">View Details</button>
        <button id="view-calendar-${
          course.id
        }" class="btn-secondary view-calendar-btn">View Calendar</button>
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
