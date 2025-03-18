// Controller for Teacher/Assistant Dashboard
class InstructorDashboardController {
  constructor(dataStore) {
    this.dataStore = dataStore;
    this.currentUser = dataStore.currentUser;
    this.currentView = null;
    this.currentCourse = null;
  }

  // Initialize the dashboard
  init() {
    // Make sure the user is authenticated and is a teacher or assistant
    if (
      !this.currentUser ||
      (this.currentUser.role !== "teacher" &&
        this.currentUser.role !== "assistant")
    ) {
      // Redirect to login
      window.location.href = "index.html";
      return;
    }

    // Render the instructor dashboard
    this.showInstructorDashboard();
  }

  // Show the instructor dashboard
  showInstructorDashboard() {
    // Get courses the instructor is teaching or assisting with
    let instructorCourses = [];

    if (this.currentUser.role === "teacher") {
      instructorCourses = this.dataStore.getCoursesByTeacherId(
        this.currentUser.id
      );
    } else if (this.currentUser.role === "assistant") {
      instructorCourses = this.dataStore.getCoursesByAssistantId(
        this.currentUser.id
      );
    }

    // Create and render the dashboard view
    if (this.currentView) {
      this.currentView.hide();
    }

    const dashboardView = new InstructorDashboardView(
      this,
      this.currentUser,
      instructorCourses
    );
    dashboardView.render();
    this.currentView = dashboardView;
  }

  // Show course details
  showCourseDetails(courseId) {
    const course = this.dataStore.getCourseById(courseId);
    if (!course) {
      alert("Course not found");
      return;
    }

    this.currentCourse = course;

    // Get all students enrolled in the course
    const enrolledStudents = course.getStudents(this.dataStore.users);

    // Create and render the course details view
    if (this.currentView) {
      this.currentView.hide();
    }

    const courseDetailsView = new CourseDetailsView(
      this,
      course,
      enrolledStudents
    );
    courseDetailsView.render();
    this.currentView = courseDetailsView;
  }

  // Show course calendar and attendance
  showCourseCalendar(courseId) {
    const course = this.dataStore.getCourseById(courseId);
    if (!course) {
      alert("Course not found");
      return;
    }

    this.currentCourse = course;

    // Get all students enrolled in the course
    const enrolledStudents = course.getStudents(this.dataStore.users);

    // Create and render the course calendar view
    if (this.currentView) {
      this.currentView.hide();
    }

    const calendarView = new CourseCalendarView(this, course, enrolledStudents);
    calendarView.render();
    this.currentView = calendarView;
  }

  // Show form to create a new course
  showCreateCourseForm() {
    if (this.currentView) {
      this.currentView.hide();
    }

    const createCourseView = new CreateCourseView(this);
    createCourseView.render();
    this.currentView = createCourseView;
  }

  // Create a new course
  createCourse(courseData) {
    try {
      // Add teacher ID if current user is a teacher
      if (this.currentUser.role === "teacher") {
        courseData.teacherId = this.currentUser.id;
      }

      // Add assistant ID if current user is an assistant
      if (this.currentUser.role === "assistant") {
        courseData.assistantIds = [this.currentUser.id];
      }

      const newCourse = this.dataStore.addCourse(courseData);

      if (newCourse) {
        alert("Course created successfully");
        this.showInstructorDashboard();
        return { success: true, course: newCourse };
      } else {
        return { success: false, message: "Failed to create course" };
      }
    } catch (error) {
      console.error("Create course error:", error);
      return {
        success: false,
        message: "An error occurred while creating the course",
      };
    }
  }

  // Show form to edit a course
  showEditCourseForm(courseId) {
    const course = this.dataStore.getCourseById(courseId);
    if (!course) {
      alert("Course not found");
      return;
    }

    this.currentCourse = course;

    if (this.currentView) {
      this.currentView.hide();
    }

    const editCourseView = new EditCourseView(this, course);
    editCourseView.render();
    this.currentView = editCourseView;
  }

  // Update a course
  updateCourse(courseId, courseData) {
    try {
      const updatedCourse = this.dataStore.updateCourse(courseId, courseData);

      if (updatedCourse) {
        alert("Course updated successfully");
        this.showCourseDetails(courseId);
        return { success: true, course: updatedCourse };
      } else {
        return { success: false, message: "Failed to update course" };
      }
    } catch (error) {
      console.error("Update course error:", error);
      return {
        success: false,
        message: "An error occurred while updating the course",
      };
    }
  }

  // Delete a course
  deleteCourse(courseId) {
    if (
      confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        const success = this.dataStore.deleteCourse(courseId);

        if (success) {
          alert("Course deleted successfully");
          this.showInstructorDashboard();
          return { success: true };
        } else {
          return { success: false, message: "Failed to delete course" };
        }
      } catch (error) {
        console.error("Delete course error:", error);
        return {
          success: false,
          message: "An error occurred while deleting the course",
        };
      }
    }
  }

  // Show form to add a class to the calendar
  showAddClassForm(courseId) {
    const course = this.dataStore.getCourseById(courseId);
    if (!course) {
      alert("Course not found");
      return;
    }

    this.currentCourse = course;

    if (this.currentView) {
      this.currentView.hide();
    }

    const addClassView = new AddClassView(this, course);
    addClassView.render();
    this.currentView = addClassView;
  }

  // Add a class to the calendar
  addClassToCalendar(courseId, classData) {
    try {
      const newClass = this.dataStore.addClassToCalendar(
        courseId,
        classData.date,
        classData.topic
      );

      if (newClass) {
        alert("Class added to calendar successfully");
        this.showCourseCalendar(courseId);
        return { success: true, class: newClass };
      } else {
        return { success: false, message: "Failed to add class to calendar" };
      }
    } catch (error) {
      console.error("Add class error:", error);
      return {
        success: false,
        message: "An error occurred while adding the class",
      };
    }
  }

  // Mark student attendance
  markAttendance(courseId, classDate, studentId, isPresent) {
    try {
      console.log(
        `Marking attendance for course ${courseId}, date ${classDate}, student ${studentId}, present: ${isPresent}`
      );
      const success = this.dataStore.markAttendance(
        courseId,
        classDate,
        studentId,
        isPresent
      );

      if (success) {
        console.log("Attendance marked successfully");
        return { success: true };
      } else {
        console.error("Failed to mark attendance");
        return { success: false, message: "Failed to mark attendance" };
      }
    } catch (error) {
      console.error("Mark attendance error:", error);
      return {
        success: false,
        message: "An error occurred while marking attendance",
      };
    }
  }

  // Save all attendance for a class session
  saveAllAttendance(courseId, attendanceData) {
    try {
      let allSuccess = true;

      // Process each attendance record
      for (const record of attendanceData) {
        const success = this.dataStore.markAttendance(
          courseId,
          record.classDate,
          record.studentId,
          record.isPresent
        );

        if (!success) {
          allSuccess = false;
        }
      }

      if (allSuccess) {
        return { success: true };
      } else {
        return {
          success: false,
          message: "Some attendance records failed to update",
        };
      }
    } catch (error) {
      console.error("Save all attendance error:", error);
      return {
        success: false,
        message: "An error occurred while saving attendance",
      };
    }
  }

  // Show student management for a course
  showStudentManagement(courseId) {
    const course = this.dataStore.getCourseById(courseId);
    if (!course) {
      alert("Course not found");
      return;
    }

    this.currentCourse = course;

    // Get all students
    const allStudents = this.dataStore.getStudents();
    const enrolledStudents = course.getStudents(this.dataStore.users);

    // Create and render the student management view
    if (this.currentView) {
      this.currentView.hide();
    }

    const studentManagementView = new StudentManagementView(
      this,
      course,
      allStudents,
      enrolledStudents
    );
    studentManagementView.render();
    this.currentView = studentManagementView;
  }

  // Enroll a student in a course
  enrollStudent(courseId, studentId) {
    try {
      const success = this.dataStore.enrollStudent(courseId, studentId);

      if (success) {
        alert("Student enrolled successfully");
        this.showStudentManagement(courseId);
        return { success: true };
      } else {
        return { success: false, message: "Failed to enroll student" };
      }
    } catch (error) {
      console.error("Enroll student error:", error);
      return {
        success: false,
        message: "An error occurred while enrolling the student",
      };
    }
  }

  // Remove a student from a course
  unenrollStudent(courseId, studentId) {
    if (
      confirm("Are you sure you want to remove this student from the course?")
    ) {
      try {
        const success = this.dataStore.unenrollStudent(courseId, studentId);

        if (success) {
          alert("Student removed from course successfully");
          this.showStudentManagement(courseId);
          return { success: true };
        } else {
          return {
            success: false,
            message: "Failed to remove student from course",
          };
        }
      } catch (error) {
        console.error("Unenroll student error:", error);
        return {
          success: false,
          message: "An error occurred while removing the student",
        };
      }
    }
  }

  // Navigate back to the dashboard
  goToDashboard() {
    this.showInstructorDashboard();
  }
  // Show the courses management view
  showCoursesManagement() {
    // Get courses the instructor is teaching or assisting with
    let instructorCourses = [];

    if (this.currentUser.role === "teacher") {
      instructorCourses = this.dataStore.getCoursesByTeacherId(
        this.currentUser.id
      );
    } else if (this.currentUser.role === "assistant") {
      instructorCourses = this.dataStore.getCoursesByAssistantId(
        this.currentUser.id
      );
    }

    // Create and render the courses view
    if (this.currentView) {
      this.currentView.hide();
    }

    const coursesView = new InstructorCoursesView(
      this,
      this.currentUser,
      instructorCourses
    );
    coursesView.render();
    this.currentView = coursesView;
  }

  // Logout user
  logout() {
    this.dataStore.logout();
    window.location.href = "index.html";
  }
  // Add these new methods right before the closing brace of the class

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
