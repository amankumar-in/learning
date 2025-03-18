// Revised Instructor Dashboard View (for Teachers and Assistants)
class InstructorDashboardView {
  constructor(controller, user, courses) {
    this.controller = controller;
    this.user = user;
    this.courses = courses;
    this.analyticsPeriod = "weekly"; // weekly, monthly, yearly
  }

  render() {
    // Get the main container
    const main = document.querySelector("main");
    main.innerHTML = "";

    // Create the dashboard welcome section with quick stats
    const welcomeSection = document.createElement("div");
    welcomeSection.className = "welcome-banner";

    // Get analytics data
    const analyticsData = this.prepareAnalyticsData();

    welcomeSection.innerHTML = `
      <div class="welcome-content">
        <h2>Welcome back, ${this.user.name}!</h2>
        <p class="welcome-subtitle">Manage your courses and track student progress</p>
        
        <div class="quick-stats">
          <div class="quick-stat-item">
            <span class="stat-value">${this.courses.length}</span>
            <span class="stat-label">Courses</span>
          </div>
          <div class="quick-stat-item">
            <span class="stat-value">${analyticsData.totalStudents}</span>
            <span class="stat-label">Students</span>
          </div>
          <div class="quick-stat-item">
            <span class="stat-value">${analyticsData.avgAttendance}%</span>
            <span class="stat-label">Avg. Attendance</span>
          </div>
        </div>
      </div>
    `;

    main.appendChild(welcomeSection);

    // Create analytics section
    const analyticsSection = document.createElement("section");
    analyticsSection.className = "dashboard-section analytics-section";

    analyticsSection.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h3>Dashboard Analytics</h3>
        </div>
        <div class="analytics-period-selector">
          <button class="period-btn ${
            this.analyticsPeriod === "weekly" ? "active" : ""
          }" data-period="weekly">Weekly</button>
          <button class="period-btn ${
            this.analyticsPeriod === "monthly" ? "active" : ""
          }" data-period="monthly">Monthly</button>
          <button class="period-btn ${
            this.analyticsPeriod === "yearly" ? "active" : ""
          }" data-period="yearly">Yearly</button>
        </div>
      </div>
      
      <div class="analytics-summary">
        <div class="summary-card">
          <div class="summary-icon students-icon"></div>
          <div class="summary-data">
            <div class="summary-value">${analyticsData.totalStudents}</div>
            <div class="summary-label">Active Students</div>
          </div>
          <div class="summary-change ${
            analyticsData.studentChange >= 0 ? "positive" : "negative"
          }">
            <i class="arrow-icon ${
              analyticsData.studentChange >= 0 ? "up" : "down"
            }"></i>
            ${Math.abs(analyticsData.studentChange)}%
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon courses-icon"></div>
          <div class="summary-data">
            <div class="summary-value">${this.courses.length}</div>
            <div class="summary-label">Active Courses</div>
          </div>
          <div class="summary-change ${
            analyticsData.courseChange >= 0 ? "positive" : "negative"
          }">
            <i class="arrow-icon ${
              analyticsData.courseChange >= 0 ? "up" : "down"
            }"></i>
            ${Math.abs(analyticsData.courseChange)}%
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon attendance-icon"></div>
          <div class="summary-data">
            <div class="summary-value">${analyticsData.avgAttendance}%</div>
            <div class="summary-label">Avg. Attendance</div>
          </div>
          <div class="summary-change ${
            analyticsData.attendanceChange >= 0 ? "positive" : "negative"
          }">
            <i class="arrow-icon ${
              analyticsData.attendanceChange >= 0 ? "up" : "down"
            }"></i>
            ${Math.abs(analyticsData.attendanceChange)}%
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon completion-icon"></div>
          <div class="summary-data">
            <div class="summary-value">${analyticsData.avgCompletion}%</div>
            <div class="summary-label">Avg. Completion</div>
          </div>
          <div class="summary-change ${
            analyticsData.completionChange >= 0 ? "positive" : "negative"
          }">
            <i class="arrow-icon ${
              analyticsData.completionChange >= 0 ? "up" : "down"
            }"></i>
            ${Math.abs(analyticsData.completionChange)}%
          </div>
        </div>
      </div>
      
      <div class="analytics-charts">
        <div class="chart-container">
          <h4>Attendance Rate by Course</h4>
          <div class="horizontal-bar-chart" id="attendance-chart">
            ${this.renderAttendanceChart(analyticsData.courseAttendance)}
          </div>
        </div>
        
        <div class="chart-container">
          <h4>Course Progress</h4>
          <div class="course-progress-chart" id="progress-chart">
            ${this.renderCourseProgressChart(this.courses)}
          </div>
        </div>
      </div>
      
      <div class="analytics-charts">
        <div class="chart-container">
          <h4>Student Engagement Trend</h4>
          <div class="line-chart" id="engagement-chart">
            ${this.renderEngagementChart(analyticsData.engagementData)}
          </div>
        </div>
        
        <div class="chart-container">
          <h4>Upcoming Schedule</h4>
          <div class="upcoming-schedule" id="schedule-list">
            ${this.renderUpcomingSchedule()}
          </div>
        </div>
      </div>
    `;

    main.appendChild(analyticsSection);

    
  }

  prepareAnalyticsData() {
    // In a real application, this data would come from the server
    // or be calculated based on real course data

    // For demo purposes, we'll generate some mock data
    const totalStudents = this.courses.reduce(
      (sum, course) => sum + course.studentIds.length,
      0
    );

    // Calculate average attendance
    let totalAttendance = 0;
    let totalClasses = 0;

    this.courses.forEach((course) => {
      if (course.calendar && course.calendar.length > 0) {
        course.calendar.forEach((session) => {
          if (session.attendance) {
            const presentCount = Object.values(session.attendance).filter(
              (present) => present
            ).length;
            const totalCount = course.studentIds.length;
            if (totalCount > 0) {
              totalAttendance += presentCount;
              totalClasses += totalCount;
            }
          }
        });
      }
    });

    const avgAttendance =
      totalClasses > 0 ? Math.round((totalAttendance / totalClasses) * 100) : 0;

    // Calculate average completion
    const avgCompletion =
      this.courses.length > 0
        ? Math.round(
            this.courses.reduce(
              (sum, course) => sum + course.calculateProgress(),
              0
            ) / this.courses.length
          )
        : 0;

    // Generate course-specific attendance data
    const courseAttendance = this.courses.map((course) => {
      let attendance = 0;
      let total = 0;

      if (course.calendar && course.calendar.length > 0) {
        course.calendar.forEach((session) => {
          if (session.attendance) {
            const presentCount = Object.values(session.attendance).filter(
              (present) => present
            ).length;
            const studentCount = course.studentIds.length;
            if (studentCount > 0) {
              attendance += presentCount;
              total += studentCount;
            }
          }
        });
      }

      const rate = total > 0 ? Math.round((attendance / total) * 100) : 0;

      return {
        courseName: course.name,
        attendanceRate: rate,
      };
    });

    // Generate mock engagement data (for the line chart)
    const weeksCount = 10;
    const engagementData = [];

    for (let i = 0; i < weeksCount; i++) {
      engagementData.push({
        week: `Week ${i + 1}`,
        attendance: Math.floor(Math.random() * 30) + 70, // 70-100%
        participation: Math.floor(Math.random() * 40) + 60, // 60-100%
      });
    }

    // Mock percentage changes
    const studentChange = Math.floor(Math.random() * 20) - 5; // -5 to +15
    const courseChange = Math.floor(Math.random() * 10); // 0 to +10
    const attendanceChange = Math.floor(Math.random() * 10) - 3; // -3 to +7
    const completionChange = Math.floor(Math.random() * 15) - 2; // -2 to +13

    return {
      totalStudents,
      avgAttendance,
      avgCompletion,
      courseAttendance,
      engagementData,
      studentChange,
      courseChange,
      attendanceChange,
      completionChange,
    };
  }

  renderAttendanceChart(data) {
    // Sort by attendance rate (descending)
    const sortedData = [...data].sort(
      (a, b) => b.attendanceRate - a.attendanceRate
    );

    // Limit to top 5 courses if there are more
    const chartData = sortedData.slice(0, 5);

    let html = `<div class="horizontal-bars">`;

    chartData.forEach((item) => {
      // Determine color based on attendance rate
      let barColor = "#1e90ff"; // Default blue

      if (item.attendanceRate < 70) {
        barColor = "#dc3545"; // Red for low attendance
      } else if (item.attendanceRate < 85) {
        barColor = "#ffc107"; // Yellow for medium attendance
      } else {
        barColor = "#28a745"; // Green for high attendance
      }

      html += `
        <div class="chart-row">
          <div class="chart-label">${this.truncateText(
            item.courseName,
            20
          )}</div>
          <div class="chart-bar-container">
            <div class="chart-bar" style="width: ${
              item.attendanceRate
            }%; background-color: ${barColor}">
              <span class="chart-value">${item.attendanceRate}%</span>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;

    return html;
  }

  renderCourseProgressChart(courses) {
    // Create a donut chart for each course
    let html = `<div class="donut-charts">`;

    // Limit to 4 courses for display
    const displayCourses = courses.slice(0, 4);

    displayCourses.forEach((course) => {
      const progress = course.calculateProgress();
      const circumference = 2 * Math.PI * 40; // Circle circumference (2πr)
      const dashOffset = circumference * (1 - progress / 100);

      let progressColor = "#1e90ff"; // Default blue

      if (progress < 30) {
        progressColor = "#dc3545"; // Red for low progress
      } else if (progress < 70) {
        progressColor = "#ffc107"; // Yellow for medium progress
      } else {
        progressColor = "#28a745"; // Green for high progress
      }

      html += `
        <div class="donut-chart-container">
          <svg class="donut-chart" width="100" height="100" viewBox="0 0 100 100">
            <circle class="donut-ring" cx="50" cy="50" r="40" fill="transparent" stroke="#e6e6e6" stroke-width="10"></circle>
            <circle class="donut-segment" cx="50" cy="50" r="40" fill="transparent" 
              stroke="${progressColor}" stroke-width="10" 
              stroke-dasharray="${circumference}" 
              stroke-dashoffset="${dashOffset}"
              transform="rotate(-90 50 50)"></circle>
            <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" class="donut-text">
              <tspan x="50" dy="-5" class="donut-percent">${progress}%</tspan>
              <tspan x="50" dy="15" class="donut-label">Complete</tspan>
            </text>
          </svg>
          <div class="donut-title">${this.truncateText(course.name, 25)}</div>
        </div>
      `;
    });

    html += `</div>`;

    return html;
  }

  renderEngagementChart(data) {
    // Calculate chart dimensions with fixed width
    const width = 600; // Fixed width for better rendering
    const height = 250; // Fixed height
    const padding = 40; // Increased padding for better appearance
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    // Create SVG
    let html = `
      <div class="line-chart-container">
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
          <!-- Background -->
          <rect x="0" y="0" width="${width}" height="${height}" fill="#f9f9f9" rx="4" ry="4" />
          
          <!-- Y-axis -->
          <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${
      height - padding
    }" stroke="#ccc" stroke-width="1" />
          <!-- X-axis -->
          <line x1="${padding}" y1="${height - padding}" x2="${
      width - padding
    }" y2="${height - padding}" stroke="#ccc" stroke-width="1" />
          
          <!-- Y-axis labels -->
          <text x="${
            padding - 10
          }" y="${padding}" text-anchor="end" dominant-baseline="middle" class="chart-axis-label">100%</text>
          <text x="${padding - 10}" y="${
      height - padding
    }" text-anchor="end" dominant-baseline="middle" class="chart-axis-label">0%</text>
          <text x="${padding - 10}" y="${
      padding + chartHeight / 2
    }" text-anchor="end" dominant-baseline="middle" class="chart-axis-label">50%</text>
    `;

    // Calculate point positions
    const pointSpacing = chartWidth / (data.length - 1);

    // Draw grid lines
    for (let i = 0; i < 5; i++) {
      const y = padding + (chartHeight / 4) * i;
      html += `<line x1="${padding}" y1="${y}" x2="${
        width - padding
      }" y2="${y}" stroke="#eee" stroke-width="1" stroke-dasharray="2,2" />`;
    }

    // Create attendance line
    let attendancePath = `M`;
    let attendancePoints = "";

    data.forEach((point, i) => {
      const x = padding + pointSpacing * i;
      const y = padding + chartHeight - (point.attendance / 100) * chartHeight;

      if (i === 0) {
        attendancePath += `${x},${y}`;
      } else {
        attendancePath += ` L${x},${y}`;
      }

      attendancePoints += `<circle cx="${x}" cy="${y}" r="4" fill="#1e90ff" />`;
    });

    // Create participation line
    let participationPath = `M`;
    let participationPoints = "";

    data.forEach((point, i) => {
      const x = padding + pointSpacing * i;
      const y =
        padding + chartHeight - (point.participation / 100) * chartHeight;

      if (i === 0) {
        participationPath += `${x},${y}`;
      } else {
        participationPath += ` L${x},${y}`;
      }

      participationPoints += `<circle cx="${x}" cy="${y}" r="4" fill="#28a745" />`;
    });

    // Add X-axis labels (only 1st, middle, and last to avoid clutter)
    data.forEach((point, i) => {
      if (
        i === 0 ||
        i === Math.floor(data.length / 2) ||
        i === data.length - 1
      ) {
        const x = padding + pointSpacing * i;
        html += `<text x="${x}" y="${
          height - padding + 15
        }" text-anchor="middle" class="chart-axis-label">${point.week}</text>`;
      }
    });

    // Add lines and points
    html += `
      <path d="${attendancePath}" fill="none" stroke="#1e90ff" stroke-width="2.5" />
      <path d="${participationPath}" fill="none" stroke="#28a745" stroke-width="2.5" />
      ${attendancePoints}
      ${participationPoints}
    `;

    // Add legend
    html += `
          </svg>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #1e90ff;"></div>
              <div class="legend-label">Attendance</div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #28a745;"></div>
              <div class="legend-label">Participation</div>
            </div>
          </div>
        </div>
    `;

    return html;
  }

  renderUpcomingSchedule() {
    // Collect all upcoming classes
    const upcomingClasses = [];

    this.courses.forEach((course) => {
      if (course.calendar && course.calendar.length > 0) {
        course.calendar.forEach((classSession) => {
          const classDate = new Date(classSession.date);
          const now = new Date();

          // Only include future classes
          if (classDate >= now) {
            upcomingClasses.push({
              date: classDate,
              courseName: course.name,
              courseId: course.id,
              topic: classSession.topic,
            });
          }
        });
      }
    });

    // Sort by date
    upcomingClasses.sort((a, b) => a.date - b.date);

    // Limit to 5 upcoming classes
    const displayClasses = upcomingClasses.slice(0, 5);

    if (displayClasses.length === 0) {
      return `
        <div class="empty-schedule">
          <p>No upcoming classes scheduled.</p>
        </div>
      `;
    }

    let html = `<div class="schedule-list">`;

    displayClasses.forEach((classItem) => {
      const formattedDate = classItem.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const formattedTime = classItem.date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      html += `
        <div class="schedule-item" data-course-id="${classItem.courseId}">
          <div class="schedule-date">
            <div class="schedule-day">${formattedDate}</div>
            <div class="schedule-time">${formattedTime}</div>
          </div>
          <div class="schedule-details">
            <div class="schedule-course">${classItem.courseName}</div>
            <div class="schedule-topic">${classItem.topic}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;

    return html;
  }

  updateAnalytics(container) {
    // In a real application, this would fetch new data based on the period
    // For now, we'll just simulate different data
    const analyticsData = this.prepareAnalyticsData();

    // Update summary cards
    const summaryCards = container.querySelectorAll(".summary-card");

    // Update attendance chart
    const attendanceChart = container.querySelector("#attendance-chart");
    if (attendanceChart) {
      attendanceChart.innerHTML = this.renderAttendanceChart(
        analyticsData.courseAttendance
      );
    }

    // Update engagement chart
    const engagementChart = container.querySelector("#engagement-chart");
    if (engagementChart) {
      engagementChart.innerHTML = this.renderEngagementChart(
        analyticsData.engagementData
      );
    }
  }

  filterCourses() {
    const searchTerm = document
      .getElementById("course-search")
      .value.toLowerCase();
    const filterValue = document.getElementById("course-filter").value;

    const courseCards = document.querySelectorAll(".course-card");

    courseCards.forEach((card) => {
      const courseName = card.querySelector("h4").textContent.toLowerCase();
      const courseStatus = card
        .querySelector(".course-badge")
        .textContent.toLowerCase();

      let matchesSearch = courseName.includes(searchTerm);
      let matchesFilter = filterValue === "all" || courseStatus === filterValue;

      card.style.display = matchesSearch && matchesFilter ? "" : "none";
    });
  }

  sortCourses() {
    const sortMethod = document.getElementById("course-sort").value;
    const coursesGrid = document.querySelector(".courses-grid");
    const courseCards = Array.from(document.querySelectorAll(".course-card"));

    switch (sortMethod) {
      case "name":
        courseCards.sort((a, b) => {
          const nameA = a.querySelector("h4").textContent;
          const nameB = b.querySelector("h4").textContent;
          return nameA.localeCompare(nameB);
        });
        break;
      case "date":
        courseCards.sort((a, b) => {
          const dateA = a.querySelector(".course-detail-item span").textContent;
          const dateB = b.querySelector(".course-detail-item span").textContent;
          return (
            new Date(dateA.split(" - ")[0]) - new Date(dateB.split(" - ")[0])
          );
        });
        break;
      case "progress":
        courseCards.sort((a, b) => {
          const progressA = parseInt(
            a.querySelector(".progress-percentage").textContent
          );
          const progressB = parseInt(
            b.querySelector(".progress-percentage").textContent
          );
          return progressB - progressA;
        });
        break;
      case "students":
        courseCards.sort((a, b) => {
          const studentsA = parseInt(
            a.querySelectorAll(".course-detail-item")[1].querySelector("span")
              .textContent
          );
          const studentsB = parseInt(
            b.querySelectorAll(".course-detail-item")[1].querySelector("span")
              .textContent
          );
          return studentsB - studentsA;
        });
        break;
    }

    // Clear and re-append the sorted cards
    coursesGrid.innerHTML = "";
    courseCards.forEach((card) => coursesGrid.appendChild(card));

    // Re-attach event listeners
    this.courses.forEach((course) => {
      const courseCard = document.getElementById(`course-${course.id}`);

      if (courseCard) {
        courseCard
          .querySelector(".view-details-btn")
          .addEventListener("click", () =>
            this.controller.showCourseDetails(course.id)
          );
        courseCard
          .querySelector(".view-calendar-btn")
          .addEventListener("click", () =>
            this.controller.showCourseCalendar(course.id)
          );

        // Add event listener for the entire card to be clickable
        courseCard.addEventListener("click", (e) => {
          // Only trigger if the click wasn't on one of the buttons
          if (!e.target.closest("button")) {
            this.controller.showCourseDetails(course.id);
          }
        });
      }
    });
  }

  truncateText(text, maxLength) {
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + "..."
      : text;
  }

  hide() {
    // Clear the main container
    const main = document.querySelector("main");
    main.innerHTML = "";
  }
}
