// Base User class - Common properties and methods for all user types
class User {
    constructor(id, name, email, joinDate, role, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.joinDate = new Date(joinDate);
        this.role = role;
        this.password = password;
    }

    formatJoinDate() {
        return this.joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getTimeAtCodingBlocks() {
        const now = new Date();
        const diffTime = Math.abs(now - this.joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Factory method to create appropriate user type based on role
    static fromJSON(userData) {
        let user;
        
        switch(userData.role) {
            case 'teacher':
                user = new Teacher(
                    userData.id,
                    userData.name,
                    userData.email,
                    userData.joinDate,
                    userData.specialization,
                    userData.experience,
                    userData.password
                );
                break;
            case 'assistant':
                user = new Assistant(
                    userData.id,
                    userData.name,
                    userData.email,
                    userData.joinDate,
                    userData.specialization,
                    userData.experience,
                    userData.password
                );
                break;
            case 'student':
                user = new Student(
                    userData.id,
                    userData.name,
                    userData.email,
                    userData.joinDate,
                    userData.age,
                    userData.college,
                    userData.password
                );
                break;
            default:
                user = new User(
                    userData.id,
                    userData.name,
                    userData.email,
                    userData.joinDate,
                    userData.role,
                    userData.password
                );
        }
        
        return user;
    }
}

// Teacher class
class Teacher extends User {
    constructor(id, name, email, joinDate, specialization, experience, password) {
        super(id, name, email, joinDate, 'teacher', password);
        this.specialization = specialization;
        this.experience = experience;
    }

    calculateTeachingLoad(courses) {
        const teachingCourses = courses.filter(course => course.teacherId === this.id);
        return teachingCourses.length;
    }

    canManageCourse() {
        return true;
    }
}

// Assistant class
class Assistant extends User {
    constructor(id, name, email, joinDate, specialization, experience, password) {
        super(id, name, email, joinDate, 'assistant', password);
        this.specialization = specialization;
        this.experience = experience;
    }

    calculateAssistingLoad(courses) {
        const assistingCourses = courses.filter(course => 
            course.assistantIds && course.assistantIds.includes(this.id)
        );
        return assistingCourses.length;
    }

    canManageCourse() {
        return true;
    }
}

// Student class
class Student extends User {
    constructor(id, name, email, joinDate, age, college, password) {
        super(id, name, email, joinDate, 'student', password);
        this.age = age;
        this.college = college;
        this.enrolledCourses = [];
    }

    calculateAttendance(course) {
        if (!course.calendar || !course.studentIds.includes(this.id)) {
            return { percentage: 0, attended: 0, total: 0 };
        }

        const totalClasses = course.calendar.length;
        const attendedClasses = course.calendar.filter(session => 
            session.attendance && session.attendance[this.id] === true
        ).length;

        const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

        return {
            percentage,
            attended: attendedClasses,
            total: totalClasses
        };
    }

    canManageCourse() {
        return false;
    }
}
