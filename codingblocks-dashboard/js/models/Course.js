class Course {
    constructor(id, name, description, teacherId, assistantIds = [], studentIds = [], startDate, endDate, schedule = [], calendar = []) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.teacherId = teacherId;
        this.assistantIds = assistantIds;
        this.studentIds = studentIds;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.schedule = schedule;
        this.calendar = calendar;
    }

    static fromJSON(courseData) {
        return new Course(
            courseData.id,
            courseData.name,
            courseData.description,
            courseData.teacherId,
            courseData.assistantIds,
            courseData.studentIds,
            courseData.startDate,
            courseData.endDate,
            courseData.schedule,
            courseData.calendar
        );
    }

    getTeacher(users) {
        return users.find(user => user.id === this.teacherId);
    }

    getAssistants(users) {
        return users.filter(user => this.assistantIds.includes(user.id));
    }

    getStudents(users) {
        return users.filter(user => this.studentIds.includes(user.id));
    }

    // Calculate course progress (percentage of completed classes)
    calculateProgress() {
        if (!this.calendar || this.calendar.length === 0) {
            return 0;
        }

        const totalPlannedClasses = this.calculateTotalPlannedClasses();
        const completedClasses = this.calendar.length;
        return Math.min(100, Math.round((completedClasses / totalPlannedClasses) * 100));
    }

    calculateTotalPlannedClasses() {
        const startDate = this.startDate;
        const endDate = this.endDate;
        const daysBetween = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const weeksCount = Math.ceil(daysBetween / 7);
        
        // Calculate the number of classes based on the schedule (e.g., twice a week)
        return weeksCount * this.schedule.length;
    }

    // Add a new class to the calendar
    addClassToCalendar(date, topic) {
        const newClass = {
            date,
            topic,
            attendance: {}
        };

        // Initialize attendance for all enrolled students as false (absent)
        this.studentIds.forEach(studentId => {
            newClass.attendance[studentId] = false;
        });

        this.calendar.push(newClass);
        return newClass;
    }

    // Mark student attendance
    markAttendance(classDate, studentId, isPresent) {
        const classSession = this.calendar.find(session => session.date === classDate);
        if (classSession && this.studentIds.includes(studentId)) {
            classSession.attendance[studentId] = isPresent;
            return true;
        }
        return false;
    }

    // Add a student to the course
    addStudent(studentId) {
        if (!this.studentIds.includes(studentId)) {
            this.studentIds.push(studentId);
            
            // Add student to attendance records for all existing classes
            this.calendar.forEach(session => {
                if (!session.attendance[studentId]) {
                    session.attendance[studentId] = false;
                }
            });
            
            return true;
        }
        return false;
    }

    // Remove a student from the course
    removeStudent(studentId) {
        const index = this.studentIds.indexOf(studentId);
        if (index !== -1) {
            this.studentIds.splice(index, 1);
            
            // Remove student from attendance records
            this.calendar.forEach(session => {
                if (session.attendance && session.attendance[studentId] !== undefined) {
                    delete session.attendance[studentId];
                }
            });
            
            return true;
        }
        return false;
    }

    // Add an assistant to the course
    addAssistant(assistantId) {
        if (!this.assistantIds.includes(assistantId)) {
            this.assistantIds.push(assistantId);
            return true;
        }
        return false;
    }

    // Remove an assistant from the course
    removeAssistant(assistantId) {
        const index = this.assistantIds.indexOf(assistantId);
        if (index !== -1) {
            this.assistantIds.splice(index, 1);
            return true;
        }
        return false;
    }
}