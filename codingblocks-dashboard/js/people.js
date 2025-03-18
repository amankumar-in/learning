// People management system for Coding Blocks

// Base Person constructor
function Person(name, email, joinDate) {
    this.name = name;
    this.email = email;
    this.joinDate = new Date(joinDate);
}

// Shared methods for all people
Person.prototype.formatJoinDate = function() {
    return this.joinDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

Person.prototype.getTimeAtCodingBlocks = function() {
    const now = new Date();
    const diffTime = Math.abs(now - this.joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Student constructor
function Student(name, email, joinDate, course, batchId) {
    // Call the parent constructor
    Person.call(this, name, email, joinDate);
    
    // Student-specific properties
    this.course = course;
    this.batchId = batchId;
    this.progress = 0; // Default progress
    this.assignments = []; // Track completed assignments
}

// Inherit from Person
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

// Student-specific methods
Student.prototype.calculateProgress = function() {
    // Simple calculation based on assignments completed
    // This could be more complex in a real system
    if (this.assignments.length === 0) return 0;
    
    const totalAssignments = 10; // Assuming each course has 10 assignments
    this.progress = Math.min(100, Math.round((this.assignments.length / totalAssignments) * 100));
    return this.progress;
};

Student.prototype.submitAssignment = function(assignmentId) {
    if (!this.assignments.includes(assignmentId)) {
        this.assignments.push(assignmentId);
        this.calculateProgress();
        return `Assignment ${assignmentId} submitted successfully. Current progress: ${this.progress}%`;
    }
    return `Assignment ${assignmentId} already submitted.`;
};

// Teacher constructor
function Teacher(name, email, joinDate, specialization) {
    // Call the parent constructor
    Person.call(this, name, email, joinDate);
    
    // Teacher-specific properties
    this.specialization = specialization;
    this.coursesTeaching = [];
}

// Inherit from Person
Teacher.prototype = Object.create(Person.prototype);
Teacher.prototype.constructor = Teacher;

// Teacher-specific methods
Teacher.prototype.addCourse = function(course) {
    if (!this.coursesTeaching.some(c => c.id === course.id)) {
        this.coursesTeaching.push(course);
        return `${course.name} added to teaching load.`;
    }
    return `Already teaching ${course.name}.`;
};

Teacher.prototype.calculateTeachingLoad = function() {
    // Calculate teaching load based on courses and hours
    const hoursPerWeek = this.coursesTeaching.reduce((total, course) => total + (course.hoursPerWeek || 4), 0);
    return hoursPerWeek;
};

// Example of extending the system for a new role: Mentor
function Mentor(name, email, joinDate, expertise, studentsAssigned) {
    Person.call(this, name, email, joinDate);
    this.expertise = expertise;
    this.studentsAssigned = studentsAssigned || [];
}

Mentor.prototype = Object.create(Person.prototype);
Mentor.prototype.constructor = Mentor;

Mentor.prototype.assignStudent = function(student) {
    if (!this.studentsAssigned.some(s => s.email === student.email)) {
        this.studentsAssigned.push(student);
        return `${student.name} assigned to mentor ${this.name}.`;
    }
    return `${student.name} is already assigned to this mentor.`;
};

Mentor.prototype.calculateMentoringLoad = function() {
    return this.studentsAssigned.length;
};

// Export the constructors
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Person,
        Student,
        Teacher,
        Mentor
    };
}