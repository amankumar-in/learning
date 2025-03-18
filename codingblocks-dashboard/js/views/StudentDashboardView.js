// Student Dashboard View
class StudentDashboardView {
  constructor(controller, user, courses) {
    this.controller = controller;
    this.user = user;
    this.courses = courses;
  }

  render() {
    // Get the main container
    const main = document.querySelector("main");
    main.innerHTML = "";

    // Create the dashboard welcome section
    const welcomeSection = document.createElement("div");
    welcomeSection.className = "welcome-banner student-banner";

    welcomeSection.innerHTML = `
      <div class="welcome-content">
        <h2>Welcome back, ${this.user.name}!</h2>
        <p class="welcome-subtitle">Track your learning progress and attendance</p>
      </div>
    `;

    main.appendChild(welcomeSection);

    // Create analytics section
    const analyticsSection = document.createElement("section");
    analyticsSection.className = "dashboard-section analytics-section";

    // Calculate analytics values
    const overallAttendance = this.calculateOverallAttendance();
    const courseProgressData = this.calculateCourseProgress();
    const upcomingDeadlines = this.getUpcomingDeadlines();

    // Calculate average progress manually
    const averageProgress = this.calculateAverageProgress();

    analyticsSection.innerHTML = `
      <div class="student-metrics">
        <div class="metric-card attendance-metric">
          <div class="metric-header">
            <h4>My Attendance</h4>
          </div>
          <div class="metric-content">
            <div class="attendance-chart">
              ${this.renderCircleProgress(overallAttendance)}
            </div>
            <div class="attendance-insights">
              <div class="insight-item">
                <span class="insight-label">Overall Attendance</span>
                <span class="insight-value">${overallAttendance}%</span>
              </div>
              <div class="insight-item">
                <span class="insight-label">Classes Attended</span>
                <span class="insight-value">${this.calculateTotalClassesAttended()} / ${this.calculateTotalClasses()}</span>
              </div>
              <div class="insight-item">
                <span class="insight-label">Target</span>
                <span class="insight-value">85%</span>
              </div>
            </div>
          </div>
          ${this.renderAttendanceMessage(overallAttendance)}
        </div>
        
        <div class="metric-card progress-metric">
          <div class="metric-header">
            <h4>My Progress</h4>
          </div>
          <div class="metric-content">
            <div class="progress-chart">
              ${this.renderCircleProgress(averageProgress)}
            </div>
            <div class="progress-insights">
              <div class="insight-item">
                <span class="insight-label">Overall Progress</span>
                <span class="insight-value">${averageProgress}%</span>
              </div>
              <div class="insight-item">
                <span class="insight-label">Courses Enrolled</span>
                <span class="insight-value">${this.courses.length}</span>
              </div>
              <div class="insight-item">
                <span class="insight-label">Rankings</span>
                <span class="insight-value">Top 30%</span>
              </div>
            </div>
          </div>
          ${this.renderProgressMessage(averageProgress)}
        </div>
        
        <div class="metric-card upcoming-metric">
          <div class="metric-header">
            <h4>Upcoming Deadlines</h4>
            <button class="view-all-btn">View All</button>
          </div>
          <div class="metric-content">
            ${this.renderUpcomingDeadlines(upcomingDeadlines)}
          </div>
        </div>
      </div>
      
      <div class="learning-insights">
        <div class="insights-header">
          <h3>Learning Insights</h3>
        </div>
        <div class="insights-chart-container">
          <div class="insights-chart-wrapper">
            <h4>Course Completion Progress</h4>
            <div class="course-progress-bars">
              ${this.renderCourseProgressBars(courseProgressData)}
            </div>
          </div>
          <div class="insights-chart-wrapper">
            <h4>Learning Activity</h4>
            <div class="activity-heatmap">
              ${this.renderActivityHeatmap()}
            </div>
          </div>
        </div>
      </div>
    `;

    // Add the analytics section to the main content
    main.appendChild(analyticsSection);

    // Add logout button
    const logoutButton = document.createElement("button");
    logoutButton.id = "logout-btn";
    logoutButton.className = "btn-secondary logout-btn";
    logoutButton.innerHTML = '<i class="icon-logout"></i> Logout';
    logoutButton.addEventListener("click", () => this.controller.logout());
    main.appendChild(logoutButton);
  }

  calculateOverallAttendance() {
    const totalClasses = this.calculateTotalClasses();
    const attendedClasses = this.calculateTotalClassesAttended();

    return totalClasses > 0
      ? Math.round((attendedClasses / totalClasses) * 100)
      : 0;
  }

  calculateTotalClasses() {
    return this.courses.reduce(
      (sum, course) => sum + course.attendance.total,
      0
    );
  }

  calculateTotalClassesAttended() {
    return this.courses.reduce(
      (sum, course) => sum + course.attendance.attended,
      0
    );
  }

  calculateCourseProgressValue(course) {
    if (
      !course.calendar ||
      !Array.isArray(course.calendar) ||
      course.calendar.length === 0
    ) {
      return 0;
    }

    const totalPlannedClasses = this.estimateTotalPlannedClasses(course);
    const completedClasses = course.calendar.length;

    return Math.min(
      100,
      Math.round((completedClasses / totalPlannedClasses) * 100)
    );
  }

  estimateTotalPlannedClasses(course) {
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const daysBetween = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    const weeksCount = Math.ceil(daysBetween / 7);
    const classesPerWeek = course.schedule ? course.schedule.length : 2;

    return weeksCount * classesPerWeek;
  }

  calculateAverageProgress() {
    if (this.courses.length === 0) return 0;

    const totalProgress = this.courses.reduce((sum, course) => {
      return sum + this.calculateCourseProgressValue(course);
    }, 0);

    return Math.round(totalProgress / this.courses.length);
  }

  calculateCourseProgress() {
    return this.courses
      .map((course) => ({
        courseName: course.name,
        progress: this.calculateCourseProgressValue(course),
        id: course.id,
      }))
      .sort((a, b) => b.progress - a.progress);
  }

  getUpcomingDeadlines() {
    return [
      {
        title: "Assignment 1: HTML Basics",
        course: "Web Development Fundamentals",
        dueDate: "2023-06-20",
        daysLeft: 5,
      },
      {
        title: "Project Proposal",
        course: "Data Science with Python",
        dueDate: "2023-06-25",
        daysLeft: 10,
      },
      {
        title: "Quiz: JavaScript Functions",
        course: "Web Development Fundamentals",
        dueDate: "2023-06-15",
        daysLeft: 0,
      },
    ];
  }

  renderCircleProgress(percentage) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - percentage / 100);

    let progressColor = "#1e90ff";

    if (percentage < 70) {
      progressColor = "#dc3545";
    } else if (percentage < 85) {
      progressColor = "#ffc107";
    } else {
      progressColor = "#28a745";
    }

    return `
      <svg class="circle-progress" width="120" height="120" viewBox="0 0 120 120">
        <circle class="progress-ring-bg" cx="60" cy="60" r="${radius}" fill="transparent" stroke="#e6e6e6" stroke-width="8"></circle>
        <circle class="progress-ring" cx="60" cy="60" r="${radius}" fill="transparent" 
          stroke="${progressColor}" stroke-width="8" 
          stroke-dasharray="${circumference}" 
          stroke-dashoffset="${dashOffset}"
          transform="rotate(-90 60 60)"></circle>
        <text x="60" y="60" text-anchor="middle" dominant-baseline="middle" class="progress-text">
          <tspan x="60" y="60" class="progress-percentage">${percentage}%</tspan>
        </text>
      </svg>
    `;
  }

  renderAttendanceMessage(attendance) {
    let message = "";
    let messageClass = "";

    if (attendance < 70) {
      message =
        "Your attendance is low. Try to attend more classes to improve your learning.";
      messageClass = "message-danger";
    } else if (attendance < 85) {
      message = "Your attendance is good, but there's room for improvement.";
      messageClass = "message-warning";
    } else {
      message = "Excellent attendance! Keep up the good work.";
      messageClass = "message-success";
    }

    return `
      <div class="metric-message ${messageClass}">
        ${message}
      </div>
    `;
  }

  renderProgressMessage(progress) {
    let message = "";
    let messageClass = "";

    if (progress < 40) {
      message = "You're just getting started. Keep going with your courses!";
      messageClass = "message-warning";
    } else if (progress < 75) {
      message =
        "You're making good progress. Stay consistent with your learning.";
      messageClass = "message-info";
    } else {
      message =
        "Great progress! You're well on your way to completing your courses.";
      messageClass = "message-success";
    }

    return `
      <div class="metric-message ${messageClass}">
        ${message}
      </div>
    `;
  }

  renderUpcomingDeadlines(deadlines) {
    if (!deadlines || deadlines.length === 0) {
      return `
        <div class="empty-deadlines">
          <p>No upcoming deadlines. You're all caught up!</p>
        </div>
      `;
    }

    return `
      <div class="deadlines-list">
        ${deadlines
          .map((deadline) => {
            let statusClass = "";
            let statusText = "";

            if (deadline.daysLeft === 0) {
              statusClass = "deadline-due-today";
              statusText = "Due Today";
            } else if (deadline.daysLeft < 3) {
              statusClass = "deadline-urgent";
              statusText = `${deadline.daysLeft} days left`;
            } else {
              statusClass = "deadline-upcoming";
              statusText = `${deadline.daysLeft} days left`;
            }

            return `
            <div class="deadline-item ${statusClass}">
              <div class="deadline-details">
                <div class="deadline-title">${deadline.title}</div>
                <div class="deadline-course">${deadline.course}</div>
              </div>
              <div class="deadline-status">
                <div class="deadline-date">${deadline.dueDate}</div>
                <div class="deadline-days">${statusText}</div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  renderCourseProgressBars(progressData) {
    if (!progressData || progressData.length === 0) {
      return `
        <div class="empty-progress">
          <p>No course data available.</p>
        </div>
      `;
    }

    return `
      <div class="progress-bars-list">
        ${progressData
          .map((course) => {
            let progressClass = "";

            if (course.progress < 30) {
              progressClass = "progress-low";
            } else if (course.progress < 70) {
              progressClass = "progress-medium";
            } else {
              progressClass = "progress-high";
            }

            return `
            <div class="course-progress-item" data-course-id="${course.id}">
              <div class="course-progress-info">
                <div class="course-progress-name">${course.courseName}</div>
                <div class="course-progress-percent">${course.progress}%</div>
              </div>
              <div class="course-progress-track">
                <div class="course-progress-bar ${progressClass}" style="width: ${course.progress}%"></div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  renderActivityHeatmap() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeks = 4;

    let heatmapHTML = `
      <div class="heatmap-container">
        <div class="heatmap-days">
          ${days
            .map((day) => `<div class="heatmap-day-label">${day}</div>`)
            .join("")}
        </div>
        <div class="heatmap-grid">
    `;

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < days.length; day++) {
        const activityLevel = Math.floor(Math.random() * 4);
        let cellClass = "";

        switch (activityLevel) {
          case 0:
            cellClass = "activity-none";
            break;
          case 1:
            cellClass = "activity-low";
            break;
          case 2:
            cellClass = "activity-medium";
            break;
          case 3:
            cellClass = "activity-high";
            break;
        }

        heatmapHTML += `<div class="heatmap-cell ${cellClass}" data-week="${week}" data-day="${day}"></div>`;
      }
    }

    heatmapHTML += `
        </div>
        <div class="heatmap-legend">
          <div class="legend-item">
            <div class="legend-cell activity-none"></div>
            <span>No Activity</span>
          </div>
          <div class="legend-item">
            <div class="legend-cell activity-low"></div>
            <span>Low</span>
          </div>
          <div class="legend-item">
            <div class="legend-cell activity-medium"></div>
            <span>Medium</span>
          </div>
          <div class="legend-item">
            <div class="legend-cell activity-high"></div>
            <span>High</span>
          </div>
        </div>
      </div>
    `;

    return heatmapHTML;
  }

  hide() {
    // Clear the main container
    const main = document.querySelector("main");
    main.innerHTML = "";
  }
}
