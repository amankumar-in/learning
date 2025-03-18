// Enhanced Course Details View for Instructors
class CourseDetailsView {
  constructor(controller, course, enrolledStudents) {
    this.controller = controller;
    this.course = course;
    this.enrolledStudents = enrolledStudents;
    this.activeTab = "overview";
    this.resources = [
      {
        id: 1,
        title: "Course Syllabus",
        type: "pdf",
        size: "245 KB",
        dateAdded: "2023-06-02",
        link: "#",
      },
      {
        id: 2,
        title: "Week 1 Lecture Notes",
        type: "doc",
        size: "1.2 MB",
        dateAdded: "2023-06-05",
        link: "#",
      },
      {
        id: 3,
        title: "Coding Examples",
        type: "zip",
        size: "3.7 MB",
        dateAdded: "2023-06-10",
        link: "#",
      },
    ];
    this.assignments = [
      {
        id: 1,
        title: "Assignment 1: Fundamentals",
        dueDate: "2023-06-15",
        status: "active",
        submissions: 5,
      },
      {
        id: 2,
        title: "Assignment 2: Advanced Topics",
        dueDate: "2023-06-30",
        status: "upcoming",
        submissions: 0,
      },
    ];
  }

  render() {
    // Get the main container
    const main = document.querySelector("main");
    main.innerHTML = "";

    // Create back link
    const backLink = document.createElement("div");
    backLink.className = "back-link";
    backLink.innerHTML = '<span class="back-icon">←</span> Back to Dashboard';
    backLink.addEventListener("click", () => this.controller.goToDashboard());
    main.appendChild(backLink);

    // Create course hero section
    const courseHero = document.createElement("div");
    courseHero.className = "course-hero";

    const progress = this.course.calculateProgress();
    const startDate = this.course.startDate.toLocaleDateString();
    const endDate = this.course.endDate.toLocaleDateString();

    courseHero.innerHTML = `
            <div class="course-hero-content">
                <h2>${this.course.name}</h2>
                <div class="course-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span>${startDate} - ${endDate}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">👥</span>
                        <span>${this.enrolledStudents.length} Students</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🕒</span>
                        <span>${
                          this.course.schedule.length
                        } Sessions per Week</span>
                    </div>
                </div>
                
                <div class="course-progress-container">
                    <div class="progress-info">
                        <span>Course Progress</span>
                        <span class="progress-percentage">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="progress-milestones">
                    <div class="milestone ${progress >= 25 ? "completed" : ""}">
                        <div class="milestone-icon">25%</div>
                        <span>Getting Started</span>
                    </div>
                    <div class="milestone ${progress >= 50 ? "completed" : ""}">
                        <div class="milestone-icon">50%</div>
                        <span>Halfway</span>
                    </div>
                    <div class="milestone ${progress >= 75 ? "completed" : ""}">
                        <div class="milestone-icon">75%</div>
                        <span>Advanced</span>
                    </div>
                    <div class="milestone ${
                      progress >= 100 ? "completed" : ""
                    }">
                        <div class="milestone-icon">100%</div>
                        <span>Complete</span>
                    </div>
                </div>
                
                <div class="course-actions">
                    <button id="edit-course-btn" class="btn-primary">
                        <i class="icon-edit"></i> Edit Course
                    </button>
                    <button id="show-calendar-btn" class="btn-secondary">
                        <i class="icon-calendar"></i> Calendar
                    </button>
                    <button id="manage-students-btn" class="btn-secondary">
                        <i class="icon-users"></i> Manage Students
                    </button>
                    <button id="delete-course-btn" class="btn-danger">
                        <i class="icon-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

    main.appendChild(courseHero);

    // Create course content tabs
    const courseContent = document.createElement("div");
    courseContent.className = "course-content-container";

    // Tabs navigation
    const tabsNav = document.createElement("div");
    tabsNav.className = "course-tabs";
    tabsNav.innerHTML = `
            <button class="tab-btn ${
              this.activeTab === "overview" ? "active" : ""
            }" data-tab="overview">
                Overview
            </button>
            <button class="tab-btn ${
              this.activeTab === "students" ? "active" : ""
            }" data-tab="students">
                Students
            </button>
            <button class="tab-btn ${
              this.activeTab === "resources" ? "active" : ""
            }" data-tab="resources">
                Resources
            </button>
            <button class="tab-btn ${
              this.activeTab === "assignments" ? "active" : ""
            }" data-tab="assignments">
                Assignments
            </button>
            <button class="tab-btn ${
              this.activeTab === "announcements" ? "active" : ""
            }" data-tab="announcements">
                Announcements
            </button>
        `;

    courseContent.appendChild(tabsNav);

    // Tab content container
    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";

    // Render the active tab
    this.renderTabContent(tabContent);

    courseContent.appendChild(tabContent);
    main.appendChild(courseContent);

    // Add event listeners for tabs
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        // Remove active class from all tabs
        tabButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked tab
        e.target.classList.add("active");

        // Set active tab and render content
        this.activeTab = e.target.dataset.tab;
        this.renderTabContent(tabContent);
      });
    });

    // Add event listeners for course actions
    document.getElementById("edit-course-btn").addEventListener("click", () => {
      this.controller.showEditCourseForm(this.course.id);
    });

    document
      .getElementById("show-calendar-btn")
      .addEventListener("click", () => {
        this.controller.showCourseCalendar(this.course.id);
      });

    document
      .getElementById("manage-students-btn")
      .addEventListener("click", () => {
        this.controller.showStudentManagement(this.course.id);
      });

    document
      .getElementById("delete-course-btn")
      .addEventListener("click", () => {
        this.controller.deleteCourse(this.course.id);
      });
  }

  renderTabContent(container) {
    container.innerHTML = "";

    switch (this.activeTab) {
      case "overview":
        this.renderOverviewTab(container);
        break;
      case "students":
        this.renderStudentsTab(container);
        break;
      case "resources":
        this.renderResourcesTab(container);
        break;
      case "assignments":
        this.renderAssignmentsTab(container);
        break;
      case "announcements":
        this.renderAnnouncementsTab(container);
        break;
    }
  }

  renderOverviewTab(container) {
    const overviewContent = document.createElement("div");
    overviewContent.className = "tab-pane";

    overviewContent.innerHTML = `
            <div class="overview-content">
                <div class="overview-section">
                    <h3>Course Description</h3>
                    <p>${this.course.description}</p>
                </div>
                
                <div class="overview-section">
                    <h3>Schedule</h3>
                    <div class="schedule-cards">
                        ${this.course.schedule
                          .map(
                            (schedule) => `
                            <div class="schedule-card">
                                <div class="day-badge">${schedule.day.substring(
                                  0,
                                  3
                                )}</div>
                                <div class="schedule-time">${
                                  schedule.time
                                }</div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="overview-section">
                    <h3>Next Class</h3>
                    ${this.renderNextClass()}
                </div>
                
                <div class="overview-section">
                    <h3>Class Statistics</h3>
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-value">${
                              this.enrolledStudents.length
                            }</div>
                            <div class="stat-label">Active Students</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${
                              this.course.calendar
                                ? this.course.calendar.length
                                : 0
                            }</div>
                            <div class="stat-label">Classes Held</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.calculateAverageAttendance()}%</div>
                            <div class="stat-label">Avg. Attendance</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    container.appendChild(overviewContent);
  }

  renderStudentsTab(container) {
    const studentsContent = document.createElement("div");
    studentsContent.className = "tab-pane";

    let studentsHTML = `
            <div class="tab-header">
                <h3>Enrolled Students</h3>
                <div class="header-actions">
                    <button id="add-students-btn" class="btn-primary">
                        <i class="icon-plus"></i> Add Students
                    </button>
                </div>
            </div>
        `;

    if (this.enrolledStudents.length > 0) {
      studentsHTML += `
                <div class="search-bar">
                    <input type="text" id="student-search" placeholder="Search students...">
                </div>
                
                <div class="students-table-wrapper">
                    <table class="students-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>College</th>
                                <th>Attendance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.enrolledStudents
                              .map((student) => {
                                const attendance = student.calculateAttendance(
                                  this.course
                                );
                                return `
                                    <tr>
                                        <td>
                                            <div class="student-info">
                                                <div class="student-avatar">${student.name.charAt(
                                                  0
                                                )}</div>
                                                <div class="student-name">${
                                                  student.name
                                                }</div>
                                            </div>
                                        </td>
                                        <td>${student.email}</td>
                                        <td>${student.college}</td>
                                        <td>
                                            <div class="mini-progress-container">
                                                <div class="mini-progress-bar">
                                                    <div class="mini-progress" style="width: ${
                                                      attendance.percentage
                                                    }%"></div>
                                                </div>
                                                <span class="mini-percentage">${
                                                  attendance.percentage
                                                }%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button class="btn-sm btn-secondary view-student-btn" data-student-id="${
                                              student.id
                                            }">
                                                View
                                            </button>
                                            <button class="btn-sm btn-danger remove-student-btn" data-student-id="${
                                              student.id
                                            }">
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                `;
                              })
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `;
    } else {
      studentsHTML += `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h4>No Students Enrolled</h4>
                    <p>There are no students enrolled in this course yet.</p>
                </div>
            `;
    }

    studentsContent.innerHTML = studentsHTML;
    container.appendChild(studentsContent);

    // Add event listeners
    const addStudentsBtn = document.getElementById("add-students-btn");
    if (addStudentsBtn) {
      addStudentsBtn.addEventListener("click", () => {
        this.controller.showStudentManagement(this.course.id);
      });
    }

    const searchInput = document.getElementById("student-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll(".students-table tbody tr");

        rows.forEach((row) => {
          const nameCell = row.querySelector(".student-name");
          const emailCell = row.querySelector("td:nth-child(2)");
          const collegeCell = row.querySelector("td:nth-child(3)");

          const nameText = nameCell.textContent.toLowerCase();
          const emailText = emailCell.textContent.toLowerCase();
          const collegeText = collegeCell.textContent.toLowerCase();

          const matchesSearch =
            nameText.includes(searchTerm) ||
            emailText.includes(searchTerm) ||
            collegeText.includes(searchTerm);

          row.style.display = matchesSearch ? "" : "none";
        });
      });
    }

    // Add event listeners for student actions
    const viewButtons = document.querySelectorAll(".view-student-btn");
    viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const studentId = e.target.dataset.studentId;
        alert(`View student details for ID: ${studentId}`);
        // In a real implementation, you'd navigate to student details
        // this.controller.viewStudentDetails(studentId);
      });
    });

    const removeButtons = document.querySelectorAll(".remove-student-btn");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const studentId = e.target.dataset.studentId;
        if (
          confirm(
            "Are you sure you want to remove this student from the course?"
          )
        ) {
          this.controller.unenrollStudent(this.course.id, studentId);
        }
      });
    });
  }

  renderResourcesTab(container) {
    const resourcesContent = document.createElement("div");
    resourcesContent.className = "tab-pane";

    resourcesContent.innerHTML = `
            <div class="tab-header">
                <h3>Course Resources</h3>
                <div class="header-actions">
                    <button id="add-resource-btn" class="btn-primary">
                        <i class="icon-plus"></i> Add Resource
                    </button>
                </div>
            </div>
            
            <div class="resources-container">
                ${
                  this.resources.length > 0
                    ? `
                    <div class="resources-table-wrapper">
                        <table class="resources-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Date Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.resources
                                  .map(
                                    (resource) => `
                                    <tr>
                                        <td>
                                            <div class="resource-info">
                                                <div class="resource-icon ${
                                                  resource.type
                                                }"></div>
                                                <div class="resource-title">${
                                                  resource.title
                                                }</div>
                                            </div>
                                        </td>
                                        <td>${resource.type.toUpperCase()}</td>
                                        <td>${resource.size}</td>
                                        <td>${resource.dateAdded}</td>
                                        <td>
                                            <button class="btn-sm btn-secondary download-resource-btn" data-resource-id="${
                                              resource.id
                                            }">
                                                Download
                                            </button>
                                            <button class="btn-sm btn-danger delete-resource-btn" data-resource-id="${
                                              resource.id
                                            }">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                `
                    : `
                    <div class="empty-state">
                        <div class="empty-icon">📚</div>
                        <h4>No Resources Added</h4>
                        <p>There are no resources added to this course yet.</p>
                    </div>
                `
                }
            </div>
        `;

    container.appendChild(resourcesContent);

    // Add event listeners
    const addResourceBtn = document.getElementById("add-resource-btn");
    if (addResourceBtn) {
      addResourceBtn.addEventListener("click", () => {
        alert("Add resource feature will be implemented soon");
        // In a real implementation, you'd show a form to add resources
        // this.controller.showAddResourceForm(this.course.id);
      });
    }

    const downloadButtons = document.querySelectorAll(".download-resource-btn");
    downloadButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const resourceId = e.target.dataset.resourceId;
        alert(`Download resource ID: ${resourceId}`);
        // In a real implementation, you'd trigger the download
        // this.controller.downloadResource(resourceId);
      });
    });

    const deleteButtons = document.querySelectorAll(".delete-resource-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const resourceId = e.target.dataset.resourceId;
        if (confirm("Are you sure you want to delete this resource?")) {
          alert(`Delete resource ID: ${resourceId}`);
          // In a real implementation, you'd delete the resource
          // this.controller.deleteResource(resourceId);
        }
      });
    });
  }

  renderAssignmentsTab(container) {
    const assignmentsContent = document.createElement("div");
    assignmentsContent.className = "tab-pane";

    assignmentsContent.innerHTML = `
            <div class="tab-header">
                <h3>Course Assignments</h3>
                <div class="header-actions">
                    <button id="add-assignment-btn" class="btn-primary">
                        <i class="icon-plus"></i> Create Assignment
                    </button>
                </div>
            </div>
            
            <div class="assignments-container">
                ${
                  this.assignments.length > 0
                    ? `
                    <div class="assignments-list">
                        ${this.assignments
                          .map(
                            (assignment) => `
                            <div class="assignment-card ${assignment.status}">
                                <div class="assignment-header">
                                    <h4>${assignment.title}</h4>
                                    <div class="assignment-status">${this.formatAssignmentStatus(
                                      assignment.status
                                    )}</div>
                                </div>
                                <div class="assignment-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Due Date:</span>
                                        <span class="detail-value">${
                                          assignment.dueDate
                                        }</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Submissions:</span>
                                        <span class="detail-value">${
                                          assignment.submissions
                                        } / ${
                              this.enrolledStudents.length
                            }</span>
                                    </div>
                                </div>
                                <div class="assignment-actions">
                                    <button class="btn-secondary view-submissions-btn" data-assignment-id="${
                                      assignment.id
                                    }">
                                        View Submissions
                                    </button>
                                    <button class="btn-secondary edit-assignment-btn" data-assignment-id="${
                                      assignment.id
                                    }">
                                        Edit
                                    </button>
                                    <button class="btn-danger delete-assignment-btn" data-assignment-id="${
                                      assignment.id
                                    }">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h4>No Assignments Created</h4>
                        <p>There are no assignments created for this course yet.</p>
                    </div>
                `
                }
            </div>
        `;

    container.appendChild(assignmentsContent);

    // Add event listeners
    const addAssignmentBtn = document.getElementById("add-assignment-btn");
    if (addAssignmentBtn) {
      addAssignmentBtn.addEventListener("click", () => {
        alert("Create assignment feature will be implemented soon");
        // In a real implementation, you'd show a form to create assignments
        // this.controller.showCreateAssignmentForm(this.course.id);
      });
    }

    const viewSubmissionsButtons = document.querySelectorAll(
      ".view-submissions-btn"
    );
    viewSubmissionsButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const assignmentId = e.target.dataset.assignmentId;
        alert(`View submissions for assignment ID: ${assignmentId}`);
        // In a real implementation, you'd navigate to submissions view
        // this.controller.viewAssignmentSubmissions(assignmentId);
      });
    });

    const editAssignmentButtons = document.querySelectorAll(
      ".edit-assignment-btn"
    );
    editAssignmentButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const assignmentId = e.target.dataset.assignmentId;
        alert(`Edit assignment ID: ${assignmentId}`);
        // In a real implementation, you'd show a form to edit the assignment
        // this.controller.showEditAssignmentForm(assignmentId);
      });
    });

    const deleteAssignmentButtons = document.querySelectorAll(
      ".delete-assignment-btn"
    );
    deleteAssignmentButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const assignmentId = e.target.dataset.assignmentId;
        if (confirm("Are you sure you want to delete this assignment?")) {
          alert(`Delete assignment ID: ${assignmentId}`);
          // In a real implementation, you'd delete the assignment
          // this.controller.deleteAssignment(assignmentId);
        }
      });
    });
  }

  renderAnnouncementsTab(container) {
    const announcementsContent = document.createElement("div");
    announcementsContent.className = "tab-pane";

    announcementsContent.innerHTML = `
            <div class="tab-header">
                <h3>Course Announcements</h3>
                <div class="header-actions">
                    <button id="create-announcement-btn" class="btn-primary">
                        <i class="icon-plus"></i> Create Announcement
                    </button>
                </div>
            </div>
            
            <div class="announcements-container">
                <div class="empty-state">
                    <div class="empty-icon">📢</div>
                    <h4>No Announcements</h4>
                    <p>There are no announcements posted for this course yet.</p>
                </div>
                
                <div class="new-announcement-form" style="display: none;">
                    <h4>Create New Announcement</h4>
                    <div class="form-group">
                        <label for="announcement-title">Title</label>
                        <input type="text" id="announcement-title" placeholder="Announcement title">
                    </div>
                    <div class="form-group">
                        <label for="announcement-content">Message</label>
                        <textarea id="announcement-content" rows="5" placeholder="Announcement content"></textarea>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="send-email">
                            <label for="send-email">Send email notification to students</label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button id="post-announcement-btn" class="btn-primary">Post Announcement</button>
                        <button id="cancel-announcement-btn" class="btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;

    container.appendChild(announcementsContent);

    // Add event listeners
    const createAnnouncementBtn = document.getElementById(
      "create-announcement-btn"
    );
    if (createAnnouncementBtn) {
      createAnnouncementBtn.addEventListener("click", () => {
        const form = document.querySelector(".new-announcement-form");
        const emptyState = document.querySelector(".empty-state");

        form.style.display = "block";
        emptyState.style.display = "none";
      });
    }

    const cancelAnnouncementBtn = document.getElementById(
      "cancel-announcement-btn"
    );
    if (cancelAnnouncementBtn) {
      cancelAnnouncementBtn.addEventListener("click", () => {
        const form = document.querySelector(".new-announcement-form");
        const emptyState = document.querySelector(".empty-state");

        form.style.display = "none";
        emptyState.style.display = "flex";

        // Reset form
        document.getElementById("announcement-title").value = "";
        document.getElementById("announcement-content").value = "";
        document.getElementById("send-email").checked = false;
      });
    }

    const postAnnouncementBtn = document.getElementById(
      "post-announcement-btn"
    );
    if (postAnnouncementBtn) {
      postAnnouncementBtn.addEventListener("click", () => {
        const title = document.getElementById("announcement-title").value;
        const content = document.getElementById("announcement-content").value;
        const sendEmail = document.getElementById("send-email").checked;

        if (!title || !content) {
          alert("Please fill in all fields");
          return;
        }

        alert(`Creating announcement: ${title}\nSend email: ${sendEmail}`);
        // In a real implementation, you'd create the announcement
        // this.controller.createAnnouncement(this.course.id, title, content, sendEmail);

        // Reset form and show empty state
        document.querySelector(".new-announcement-form").style.display = "none";
        document.querySelector(".empty-state").style.display = "flex";

        document.getElementById("announcement-title").value = "";
        document.getElementById("announcement-content").value = "";
        document.getElementById("send-email").checked = false;
      });
    }
  }

  renderNextClass() {
    if (!this.course.calendar || this.course.calendar.length === 0) {
      return `
                <div class="empty-info">
                    <p>No upcoming classes scheduled.</p>
                </div>
            `;
    }

    // Sort classes by date to find the next one
    const sortedClasses = [...this.course.calendar].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Find the next class (assuming the dates are in the format 'YYYY-MM-DD')
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingClass = sortedClasses.find((c) => {
      const classDate = new Date(c.date);
      return classDate >= today;
    });

    if (!upcomingClass) {
      return `
                <div class="empty-info">
                    <p>No upcoming classes scheduled.</p>
                </div>
            `;
    }

    // Find the day of the week for this class
    const classDate = new Date(upcomingClass.date);
    const dayOfWeek = classDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Find the schedule time for this day
    const scheduleForDay = this.course.schedule.find(
      (s) => s.day === dayOfWeek
    );
    const timeSlot = scheduleForDay
      ? scheduleForDay.time
      : "Time not specified";

    return `
            <div class="next-class-card">
                <div class="next-class-date">
                    <div class="date-day">${classDate.getDate()}</div>
                    <div class="date-month">${classDate.toLocaleDateString(
                      "en-US",
                      { month: "short" }
                    )}</div>
                </div>
                <div class="next-class-details">
                    <h4>${upcomingClass.topic}</h4>
                    <div class="next-class-info">
                        <span class="info-item"><i class="icon-calendar"></i> ${dayOfWeek}</span>
                        <span class="info-item"><i class="icon-clock"></i> ${timeSlot}</span>
                    </div>
                </div>
            </div>
        `;
  }

  calculateAverageAttendance() {
    if (
      !this.course.calendar ||
      this.course.calendar.length === 0 ||
      this.enrolledStudents.length === 0
    ) {
      return 0;
    }

    // Count total possible attendances (students × classes)
    const totalPossible =
      this.enrolledStudents.length * this.course.calendar.length;

    // Count actual attendances
    let totalActual = 0;

    this.course.calendar.forEach((classSession) => {
      if (classSession.attendance) {
        for (const studentId in classSession.attendance) {
          if (classSession.attendance[studentId]) {
            totalActual++;
          }
        }
      }
    });

    // Calculate percentage
    return Math.round((totalActual / totalPossible) * 100);
  }

  formatAssignmentStatus(status) {
    switch (status) {
      case "active":
        return "Active";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  hide() {
    // Clear the main container
    const main = document.querySelector("main");
    main.innerHTML = "";
  }
}
