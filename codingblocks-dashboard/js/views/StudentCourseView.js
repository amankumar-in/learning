// Enhanced Student Course View
class StudentCourseView {
  constructor(controller, course, attendance, teacher, assistants) {
    this.controller = controller;
    this.course = course;
    this.attendance = attendance;
    this.teacher = teacher;
    this.assistants = assistants;
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
        status: "pending",
        submitted: false,
      },
      {
        id: 2,
        title: "Assignment 2: Advanced Topics",
        dueDate: "2023-06-30",
        status: "upcoming",
        submitted: false,
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
    courseHero.className = "course-hero student-view";

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
                        <span class="meta-icon">👨‍🏫</span>
                        <span>Instructor: ${
                          this.teacher ? this.teacher.name : "Not assigned"
                        }</span>
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
                
                <div class="attendance-stats">
                    <div class="attendance-card">
                        <div class="attendance-value">${
                          this.attendance.percentage
                        }%</div>
                        <div class="attendance-label">Your Attendance</div>
                        <div class="attendance-details">${
                          this.attendance.attended
                        }/${this.attendance.total} classes attended</div>
                    </div>
                    
                    <div class="progress-milestones">
                        <div class="milestone ${
                          progress >= 25 ? "completed" : ""
                        }">
                            <div class="milestone-icon">25%</div>
                            <span>Getting Started</span>
                        </div>
                        <div class="milestone ${
                          progress >= 50 ? "completed" : ""
                        }">
                            <div class="milestone-icon">50%</div>
                            <span>Halfway</span>
                        </div>
                        <div class="milestone ${
                          progress >= 75 ? "completed" : ""
                        }">
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
                </div>
                
                <div class="course-actions">
                    <button id="show-calendar-btn" class="btn-primary">
                        <i class="icon-calendar"></i> View Calendar & Attendance
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
              this.activeTab === "instructors" ? "active" : ""
            }" data-tab="instructors">
                Instructors
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

    // Add event listener for calendar button
    document
      .getElementById("show-calendar-btn")
      .addEventListener("click", () => {
        this.controller.showCourseCalendar(this.course.id);
      });
  }

  renderTabContent(container) {
    container.innerHTML = "";

    switch (this.activeTab) {
      case "overview":
        this.renderOverviewTab(container);
        break;
      case "resources":
        this.renderResourcesTab(container);
        break;
      case "assignments":
        this.renderAssignmentsTab(container);
        break;
      case "instructors":
        this.renderInstructorsTab(container);
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
                    <h3>Course Statistics</h3>
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-value">${this.course.calculateProgress()}%</div>
                            <div class="stat-label">Course Completion</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${
                              this.attendance.percentage
                            }%</div>
                            <div class="stat-label">Your Attendance</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.calculateCompletedAssignments()}</div>
                            <div class="stat-label">Assignments Completed</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    container.appendChild(overviewContent);
  }

  renderResourcesTab(container) {
    const resourcesContent = document.createElement("div");
    resourcesContent.className = "tab-pane";

    resourcesContent.innerHTML = `
            <div class="tab-header">
                <h3>Course Resources</h3>
                <div class="search-bar">
                    <input type="text" id="resource-search" placeholder="Search resources...">
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
                                            <button class="btn-sm btn-primary download-resource-btn" data-resource-id="${
                                              resource.id
                                            }">
                                                Download
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
                        <h4>No Resources Available</h4>
                        <p>There are no resources available for this course yet.</p>
                    </div>
                `
                }
            </div>
        `;

    container.appendChild(resourcesContent);

    // Add event listeners
    const searchInput = document.getElementById("resource-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll(".resources-table tbody tr");

        rows.forEach((row) => {
          const titleCell = row.querySelector(".resource-title");
          const typeCell = row.querySelector("td:nth-child(2)");

          const titleText = titleCell.textContent.toLowerCase();
          const typeText = typeCell.textContent.toLowerCase();

          const matchesSearch =
            titleText.includes(searchTerm) || typeText.includes(searchTerm);

          row.style.display = matchesSearch ? "" : "none";
        });
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
  }

  renderAssignmentsTab(container) {
    const assignmentsContent = document.createElement("div");
    assignmentsContent.className = "tab-pane";

    assignmentsContent.innerHTML = `
            <div class="tab-header">
                <h3>Course Assignments</h3>
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
                                        <span class="detail-label">Status:</span>
                                        <span class="detail-value ${
                                          assignment.submitted
                                            ? "submitted"
                                            : ""
                                        }">
                                            ${
                                              assignment.submitted
                                                ? "Submitted"
                                                : "Not Submitted"
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div class="assignment-actions">
                                    ${
                                      !assignment.submitted
                                        ? `
                                        <button class="btn-primary submit-assignment-btn" data-assignment-id="${assignment.id}">
                                            Submit Assignment
                                        </button>
                                    `
                                        : `
                                        <button class="btn-secondary view-submission-btn" data-assignment-id="${assignment.id}">
                                            View Submission
                                        </button>
                                    `
                                    }
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
                        <h4>No Assignments</h4>
                        <p>There are no assignments for this course yet.</p>
                    </div>
                `
                }
            </div>
        `;

    container.appendChild(assignmentsContent);

    // Add event listeners
    const submitButtons = document.querySelectorAll(".submit-assignment-btn");
    submitButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const assignmentId = e.target.dataset.assignmentId;
        alert(`Submit assignment ID: ${assignmentId}`);
        // In a real implementation, you'd show a form to submit the assignment
        // this.controller.showAssignmentSubmissionForm(assignmentId);
      });
    });

    const viewButtons = document.querySelectorAll(".view-submission-btn");
    viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const assignmentId = e.target.dataset.assignmentId;
        alert(`View submission for assignment ID: ${assignmentId}`);
        // In a real implementation, you'd navigate to submission details
        // this.controller.viewAssignmentSubmission(assignmentId);
      });
    });
  }

  renderInstructorsTab(container) {
    const instructorsContent = document.createElement("div");
    instructorsContent.className = "tab-pane";

    let instructorsHTML = `
            <div class="tab-header">
                <h3>Course Instructors</h3>
            </div>
            
            <div class="instructors-grid">
        `;

    // Add the main teacher
    if (this.teacher) {
      instructorsHTML += `
                <div class="instructor-profile-card">
                    <div class="instructor-avatar teacher-avatar">
                        ${this.teacher.name.charAt(0)}
                    </div>
                    <div class="instructor-details">
                        <h4>${this.teacher.name}</h4>
                        <div class="instructor-role">Teacher</div>
                        <div class="instructor-info">
                            <div class="info-row">
                                <span class="info-label">Specialization:</span>
                                <span class="info-value">${
                                  this.teacher.specialization
                                }</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Experience:</span>
                                <span class="info-value">${
                                  this.teacher.experience
                                } years</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Email:</span>
                                <span class="info-value">${
                                  this.teacher.email
                                }</span>
                            </div>
                        </div>
                        <button class="btn-secondary contact-instructor-btn" data-instructor-id="${
                          this.teacher.id
                        }">
                            Contact
                        </button>
                    </div>
                </div>
            `;
    }

    // Add teaching assistants
    if (this.assistants && this.assistants.length > 0) {
      this.assistants.forEach((assistant) => {
        instructorsHTML += `
                    <div class="instructor-profile-card">
                        <div class="instructor-avatar assistant-avatar">
                            ${assistant.name.charAt(0)}
                        </div>
                        <div class="instructor-details">
                            <h4>${assistant.name}</h4>
                            <div class="instructor-role">Teaching Assistant</div>
                            <div class="instructor-info">
                                <div class="info-row">
                                    <span class="info-label">Specialization:</span>
                                    <span class="info-value">${
                                      assistant.specialization
                                    }</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Experience:</span>
                                    <span class="info-value">${
                                      assistant.experience
                                    } years</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Email:</span>
                                    <span class="info-value">${
                                      assistant.email
                                    }</span>
                                </div>
                            </div>
                            <button class="btn-secondary contact-instructor-btn" data-instructor-id="${
                              assistant.id
                            }">
                                Contact
                            </button>
                        </div>
                    </div>
                `;
      });
    }

    // If no instructors assigned
    if (!this.teacher && (!this.assistants || this.assistants.length === 0)) {
      instructorsHTML += `
                <div class="empty-state">
                    <div class="empty-icon">👨‍🏫</div>
                    <h4>No Instructors Assigned</h4>
                    <p>There are no instructors assigned to this course yet.</p>
                </div>
            `;
    }

    instructorsHTML += `
            </div>
        `;

    instructorsContent.innerHTML = instructorsHTML;
    container.appendChild(instructorsContent);

    // Add event listeners
    const contactButtons = document.querySelectorAll(".contact-instructor-btn");
    contactButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const instructorId = e.target.dataset.instructorId;
        alert(`Contact instructor ID: ${instructorId}`);
        // In a real implementation, you'd show a contact form
        // this.controller.showContactInstructorForm(instructorId);
      });
    });
  }

  renderAnnouncementsTab(container) {
    const announcementsContent = document.createElement("div");
    announcementsContent.className = "tab-pane";

    announcementsContent.innerHTML = `
            <div class="tab-header">
                <h3>Course Announcements</h3>
            </div>
            
            <div class="announcements-container">
                <div class="empty-state">
                    <div class="empty-icon">📢</div>
                    <h4>No Announcements</h4>
                    <p>There are no announcements posted for this course yet.</p>
                </div>
            </div>
        `;

    container.appendChild(announcementsContent);
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

    // Find the next class
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

    // Check if the student is marked as present for this class
    const isPresent =
      upcomingClass.attendance &&
      upcomingClass.attendance[this.controller.currentUser.id] === true;

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
                        ${
                          isPresent
                            ? `<span class="attendance-tag present">You're marked present</span>`
                            : `<span class="attendance-tag absent">Attendance not marked yet</span>`
                        }
                    </div>
                </div>
            </div>
        `;
  }

  calculateCompletedAssignments() {
    if (!this.assignments || this.assignments.length === 0) {
      return "0/0";
    }

    const completed = this.assignments.filter((a) => a.submitted).length;
    return `${completed}/${this.assignments.length}`;
  }

  formatAssignmentStatus(status) {
    switch (status) {
      case "pending":
        return "Pending";
      case "upcoming":
        return "Upcoming";
      case "submitted":
        return "Submitted";
      case "graded":
        return "Graded";
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
