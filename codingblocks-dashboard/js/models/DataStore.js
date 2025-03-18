// DataStore - Centralized data management for the application
class DataStore {
  constructor() {
    this.users = [];
    this.courses = [];
    this.currentUser = null;
  }

  // Initialize the data store by loading data from local storage or default JSON files
  async initialize() {
    try {
      // Try to load from localStorage first
      const usersData = localStorage.getItem("cb_users");
      const coursesData = localStorage.getItem("cb_courses");

      if (usersData && coursesData) {
        // Load from localStorage
        this.loadFromLocalStorage();
      } else {
        // Load from JSON files
        await this.loadFromFiles();
      }

      console.log("DataStore initialized with:", {
        users: this.users.length,
        courses: this.courses.length,
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize DataStore:", error);
      return false;
    }
  }

  // Load data from localStorage
  loadFromLocalStorage() {
    try {
      const usersData = JSON.parse(localStorage.getItem("cb_users"));
      const coursesData = JSON.parse(localStorage.getItem("cb_courses"));

      if (usersData && usersData.users) {
        this.users = usersData.users.map((userData) => User.fromJSON(userData));
      }

      if (coursesData && coursesData.courses) {
        this.courses = coursesData.courses.map((courseData) =>
          Course.fromJSON(courseData)
        );
      }

      return true;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return false;
    }
  }

  // Load data from JSON files
  async loadFromFiles() {
    try {
      console.log("Loading data from local files");

      // Load the users and courses from local data files
      const usersData = {
        users: [
          {
            id: "t1",
            name: "Kartik Mathur",
            email: "kartik@cb.com",
            password: "password123",
            joinDate: "2021-05-10",
            role: "teacher",
            specialization: "Web Development",
            experience: 5,
          },
          {
            id: "t2",
            name: "Good Assistant",
            email: "assistant@cb.com",
            password: "password123",
            joinDate: "2022-01-15",
            role: "teacher",
            specialization: "Data Science",
            experience: 7,
          },
          {
            id: "a1",
            name: "Aman Kumar",
            email: "student@cb.com",
            password: "password123",
            joinDate: "2022-06-20",
            role: "assistant",
            specialization: "Frontend Development",
            experience: 3,
          },
          {
            id: "s1",
            name: "Alice Johnson",
            email: "alice@example.com",
            password: "password123",
            joinDate: "2023-01-25",
            role: "student",
            age: 21,
            college: "MIT",
          },
          {
            id: "s2",
            name: "Bob Martin",
            email: "bob@example.com",
            password: "password123",
            joinDate: "2023-02-15",
            role: "student",
            age: 23,
            college: "Stanford",
          },
          {
            id: "s3",
            name: "Carol Chen",
            email: "carol@example.com",
            password: "password123",
            joinDate: "2023-03-10",
            role: "student",
            age: 22,
            college: "Harvard",
          },
        ],
      };

      const coursesData = {
        courses: [
          {
            id: "c101",
            name: "Web Development Fundamentals",
            description:
              "Learn the basics of HTML, CSS, and JavaScript to build responsive websites.",
            teacherId: "t1",
            assistantIds: ["a1"],
            studentIds: ["s1", "s2"],
            startDate: "2023-06-01",
            endDate: "2023-08-30",
            schedule: [
              { day: "Monday", time: "10:00 - 12:00" },
              { day: "Wednesday", time: "10:00 - 12:00" },
            ],
            calendar: [
              {
                date: "2023-06-05",
                topic: "Introduction to HTML",
                attendance: { s1: true, s2: true },
              },
              {
                date: "2023-06-07",
                topic: "CSS Basics",
                attendance: { s1: true, s2: false },
              },
              {
                date: "2023-06-12",
                topic: "JavaScript Fundamentals",
                attendance: { s1: true, s2: true },
              },
              {
                date: "2023-06-14",
                topic: "DOM Manipulation",
                attendance: { s1: false, s2: true },
              },
            ],
          },
          {
            id: "c102",
            name: "Data Science with Python",
            description:
              "Learn data analysis, visualization, and machine learning using Python.",
            teacherId: "t2",
            assistantIds: [],
            studentIds: ["s2", "s3"],
            startDate: "2023-07-01",
            endDate: "2023-09-30",
            schedule: [
              { day: "Tuesday", time: "14:00 - 16:00" },
              { day: "Thursday", time: "14:00 - 16:00" },
            ],
            calendar: [
              {
                date: "2023-07-04",
                topic: "Python Basics",
                attendance: { s2: true, s3: true },
              },
              {
                date: "2023-07-06",
                topic: "NumPy and Pandas",
                attendance: { s2: true, s3: true },
              },
              {
                date: "2023-07-11",
                topic: "Data Visualization",
                attendance: { s2: false, s3: true },
              },
              {
                date: "2023-07-13",
                topic: "Intro to Machine Learning",
                attendance: { s2: true, s3: false },
              },
            ],
          },
        ],
      };

      // Transform JSON data to class instances
      console.log("Processing user data");
      if (usersData && usersData.users) {
        this.users = usersData.users.map((userData) => User.fromJSON(userData));
        console.log(`Transformed ${this.users.length} users`);
      }

      if (coursesData && coursesData.courses) {
        this.courses = coursesData.courses.map((courseData) =>
          Course.fromJSON(courseData)
        );
        console.log(`Transformed ${this.courses.length} courses`);
      }

      // Save to localStorage for future use
      this.saveToLocalStorage();

      return true;
    } catch (error) {
      console.error("Error loading from files:", error);
      return false;
    }
  }

  // Save current state to localStorage
  saveToLocalStorage() {
    try {
      // Convert class instances back to plain objects
      const usersData = {
        users: this.users.map((user) => ({
          ...user,
          joinDate: user.joinDate.toISOString().split("T")[0],
        })),
      };

      const coursesData = {
        courses: this.courses.map((course) => ({
          ...course,
          startDate: course.startDate.toISOString().split("T")[0],
          endDate: course.endDate.toISOString().split("T")[0],
        })),
      };

      localStorage.setItem("cb_users", JSON.stringify(usersData));
      localStorage.setItem("cb_courses", JSON.stringify(coursesData));

      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  }

  // Authentication methods
  authenticateUser(email, password) {
    console.log(`Attempting to authenticate user: ${email}`);
    console.log(`Available users: ${this.users.length}`);

    const userData = this.users.find((user) => {
      const emailMatch = user.email === email;
      const passwordMatch = user.password === password;

      if (emailMatch) {
        console.log(
          `Found user with matching email: ${user.name}, password match: ${passwordMatch}`
        );
      }

      return emailMatch && passwordMatch;
    });

    if (userData) {
      console.log(
        `Authentication successful for: ${userData.name} (${userData.role})`
      );
      this.currentUser = userData;
      localStorage.setItem(
        "cb_current_user",
        JSON.stringify({
          id: userData.id,
          email: userData.email,
        })
      );
      return userData;
    }

    console.log("Authentication failed: Invalid email or password");
    return null;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("cb_current_user");
  }

  // Check if a user is logged in
  checkAuthentication() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const savedUser = localStorage.getItem("cb_current_user");
    if (savedUser) {
      const { id, email } = JSON.parse(savedUser);
      const user = this.users.find((u) => u.id === id && u.email === email);
      if (user) {
        this.currentUser = user;
        return user;
      }
    }

    return null;
  }

  // Course methods
  getCourseById(courseId) {
    return this.courses.find((course) => course.id === courseId);
  }

  getCoursesByTeacherId(teacherId) {
    return this.courses.filter((course) => course.teacherId === teacherId);
  }

  getCoursesByAssistantId(assistantId) {
    return this.courses.filter(
      (course) =>
        course.assistantIds && course.assistantIds.includes(assistantId)
    );
  }

  getCoursesByStudentId(studentId) {
    return this.courses.filter(
      (course) => course.studentIds && course.studentIds.includes(studentId)
    );
  }

  // Add a new course
  addCourse(courseData) {
    // Generate a new course ID
    const courseId = `c${Date.now().toString().slice(-6)}`;

    const newCourse = new Course(
      courseId,
      courseData.name,
      courseData.description,
      courseData.teacherId,
      courseData.assistantIds || [],
      courseData.studentIds || [],
      courseData.startDate,
      courseData.endDate,
      courseData.schedule || [],
      []
    );

    this.courses.push(newCourse);
    this.saveToLocalStorage();

    return newCourse;
  }

  // Update a course
  updateCourse(courseId, updatedData) {
    const courseIndex = this.courses.findIndex(
      (course) => course.id === courseId
    );

    if (courseIndex === -1) {
      return null;
    }

    // Update the course with new data
    const course = this.courses[courseIndex];
    Object.assign(course, updatedData);

    this.saveToLocalStorage();
    return course;
  }

  // Delete a course
  deleteCourse(courseId) {
    const initialLength = this.courses.length;
    this.courses = this.courses.filter((course) => course.id !== courseId);

    if (this.courses.length < initialLength) {
      this.saveToLocalStorage();
      return true;
    }

    return false;
  }

  // User methods
  getUserById(userId) {
    return this.users.find((user) => user.id === userId);
  }

  getTeachers() {
    return this.users.filter((user) => user.role === "teacher");
  }

  getAssistants() {
    return this.users.filter((user) => user.role === "assistant");
  }

  getStudents() {
    return this.users.filter((user) => user.role === "student");
  }

  // Add a new user
  addUser(userData) {
    // Generate a new user ID based on role
    const rolePrefix = userData.role.charAt(0);
    const userId = `${rolePrefix}${Date.now().toString().slice(-6)}`;

    const newUserData = {
      ...userData,
      id: userId,
      joinDate: new Date().toISOString().split("T")[0],
    };

    const newUser = User.fromJSON(newUserData);
    this.users.push(newUser);
    this.saveToLocalStorage();

    return newUser;
  }

  // Update user information
  updateUser(userId, updatedData) {
    const userIndex = this.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return null;
    }

    // Update the user with new data
    Object.assign(this.users[userIndex], updatedData);

    this.saveToLocalStorage();
    return this.users[userIndex];
  }

  // Delete a user
  deleteUser(userId) {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== userId);

    // Remove user from courses if it's a student
    this.courses.forEach((course) => {
      const studentIndex = course.studentIds.indexOf(userId);
      if (studentIndex !== -1) {
        course.studentIds.splice(studentIndex, 1);
      }

      // Remove user from courses if it's an assistant
      const assistantIndex = course.assistantIds.indexOf(userId);
      if (assistantIndex !== -1) {
        course.assistantIds.splice(assistantIndex, 1);
      }

      // If the user is a teacher, set teacherId to null
      if (course.teacherId === userId) {
        course.teacherId = null;
      }
    });

    if (this.users.length < initialLength) {
      this.saveToLocalStorage();
      return true;
    }

    return false;
  }

  // Course calendar and attendance methods
  addClassToCalendar(courseId, date, topic) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const newClass = course.addClassToCalendar(date, topic);
    this.saveToLocalStorage();
    return newClass;
  }

  markAttendance(courseId, classDate, studentId, isPresent) {
    const course = this.getCourseById(courseId);
    if (!course) return false;

    const success = course.markAttendance(classDate, studentId, isPresent);
    if (success) {
      this.saveToLocalStorage();
    }
    return success;
  }

  // Student enrollment methods
  enrollStudent(courseId, studentId) {
    const course = this.getCourseById(courseId);
    if (!course) return false;

    const success = course.addStudent(studentId);
    if (success) {
      this.saveToLocalStorage();
    }
    return success;
  }

  unenrollStudent(courseId, studentId) {
    const course = this.getCourseById(courseId);
    if (!course) return false;

    const success = course.removeStudent(studentId);
    if (success) {
      this.saveToLocalStorage();
    }
    return success;
  }
}

// Create a singleton instance
const dataStore = new DataStore();
