// Controller for Student Dashboard
class StudentDashboardController {
  constructor(dataStore) {
    this.dataStore = dataStore;
    this.currentUser = dataStore.currentUser;
    this.currentView = null;
    this.currentCourse = null;
  }

  // Initialize the dashboard
  init() {
    // Make sure the user is authenticated and is a student
    if (!this.currentUser || this.currentUser.role !== "student") {
      // Redirect to login
      window.location.href = "index.html";
      return;
    }

    // Render the student dashboard
    this.showStudentDashboard();
  }
  // Show the courses view
  showCoursesView() {
    // Get courses the student is enrolled in
    const enrolledCourses = this.dataStore.getCoursesByStudentId(
      this.currentUser.id
    );

    // Create and render the courses view
    if (this.currentView) {
      this.currentView.hide();
    }

    const coursesView = new StudentCoursesView(
      this,
      this.currentUser,
      enrolledCourses
    );
    coursesView.render();
    this.currentView = coursesView;
  }

  // Show the student dashboard
  showStudentDashboard() {
    // Get courses the student is enrolled in
    const enrolledCourses = this.dataStore.getCoursesByStudentId(
      this.currentUser.id
    );

    // Calculate attendance for each course
    const coursesWithAttendance = enrolledCourses.map((course) => {
      const student = this.currentUser;
      const attendance = student.calculateAttendance(course);
      return { ...course, attendance };
    });

    // Create and render the dashboard view
    if (this.currentView) {
      this.currentView.hide();
    }

    const dashboardView = new StudentDashboardView(
      this,
      this.currentUser,
      coursesWithAttendance
    );
    dashboardView.render();
    this.currentView = dashboardView;
  }

  // Show course details for a student
  showCourseDetails(courseId) {
    const course = this.dataStore.getCourseById(courseId);
    if (!course) {
      alert("Course not found");
      return;
    }

    this.currentCourse = course;

    // Calculate attendance for this course
    const attendance = this.currentUser.calculateAttendance(course);

    // Get teacher and assistants for this course
    const teacher = course.getTeacher(this.dataStore.users);
    const assistants = course.getAssistants(this.dataStore.users);

    // Create and render the student course view
    if (this.currentView) {
      this.currentView.hide();
    }

    const courseView = new StudentCourseView(
      this,
      course,
      attendance,
      teacher,
      assistants
    );
    courseView.render();
    this.currentView = courseView;
  }

  // Show course calendar for a student
  showCourseCalendar(courseId) {
    const course = this.dataStore.getCourseById(courseId);
    if (!course) {
      alert("Course not found");
      return;
    }

    this.currentCourse = course;

    // Get student attendance for this course
    const studentId = this.currentUser.id;

    // Create array of classes with attendance status for this student
    const classesWithAttendance = course.calendar.map((classSession) => ({
      ...classSession,
      present:
        classSession.attendance && classSession.attendance[studentId] === true,
    }));

    // Create and render the student calendar view
    if (this.currentView) {
      this.currentView.hide();
    }

    const calendarView = new StudentCalendarView(
      this,
      course,
      classesWithAttendance
    );
    calendarView.render();
    this.currentView = calendarView;
  }

  // Navigate back to the dashboard
  goToDashboard() {
    this.showStudentDashboard();
  }

  // Logout user
  logout() {
    this.dataStore.logout();
    window.location.href = "index.html";
  }
  // Add this new method to the StudentDashboardController class

  // Show user profile
  showUserProfile() {
    if (this.currentView) {
      this.currentView.hide();
    }

    const profileView = new UserProfileView(this, this.currentUser);
    profileView.render();
    this.currentView = profileView;
  }

  // Add this method to handle profile updates
  updateProfile(updatedData) {
    try {
      const updatedUser = this.dataStore.updateUser(
        this.currentUser.id,
        updatedData
      );

      if (updatedUser) {
        this.currentUser = updatedUser;
        return { success: true, user: updatedUser };
      } else {
        return { success: false, message: "Failed to update profile" };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: "An error occurred while updating your profile",
      };
    }
  }

  // Add this method to handle password changes
  changePassword(currentPassword, newPassword) {
    try {
      // Verify current password
      if (currentPassword !== this.currentUser.password) {
        return { success: false, message: "Current password is incorrect" };
      }

      // Update password
      const updatedUser = this.dataStore.updateUser(this.currentUser.id, {
        password: newPassword,
      });

      if (updatedUser) {
        this.currentUser = updatedUser;
        return { success: true };
      } else {
        return { success: false, message: "Failed to change password" };
      }
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message: "An error occurred while changing your password",
      };
    }
  }
}
