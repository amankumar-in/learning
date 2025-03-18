// Student Management View for Instructors
class StudentManagementView {
    constructor(controller, course, allStudents, enrolledStudents) {
        this.controller = controller;
        this.course = course;
        this.allStudents = allStudents;
        this.enrolledStudents = enrolledStudents;
    }

    render() {
        // Get the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
        
        // Create back link
        const backLink = document.createElement('div');
        backLink.className = 'back-link';
        backLink.innerHTML = '<span class="back-icon">←</span> Back to Course Details';
        backLink.addEventListener('click', () => this.controller.showCourseDetails(this.course.id));
        main.appendChild(backLink);
        
        // Create student management container
        const managementContainer = document.createElement('div');
        managementContainer.className = 'student-management-container';
        
        // Header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h2>${this.course.name} - Student Management</h2>
        `;
        
        managementContainer.appendChild(header);
        
        // Create two sections: enrolled students and available students
        const enrolledSection = document.createElement('section');
        enrolledSection.className = 'enrolled-students-section';
        enrolledSection.innerHTML = `
            <h3>Enrolled Students (${this.enrolledStudents.length})</h3>
        `;
        
        if (this.enrolledStudents.length > 0) {
            const enrolledTable = document.createElement('table');
            
            // Table header
            const tableHeader = document.createElement('thead');
            tableHeader.innerHTML = `
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>College</th>
                    <th>Action</th>
                </tr>
            `;
            
            enrolledTable.appendChild(tableHeader);
            
            // Table body
            const tableBody = document.createElement('tbody');
            
            this.enrolledStudents.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.college}</td>
                    <td>
                        <button class="btn-danger unenroll-btn" data-student-id="${student.id}">
                            Remove
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            enrolledTable.appendChild(tableBody);
            enrolledSection.appendChild(enrolledTable);
        } else {
            enrolledSection.innerHTML += `
                <p>No students are enrolled in this course yet.</p>
            `;
        }
        
        managementContainer.appendChild(enrolledSection);
        
        // Available students section
        const availableSection = document.createElement('section');
        availableSection.className = 'available-students-section';
        
        // Filter out already enrolled students
        const availableStudents = this.allStudents.filter(student => 
            !this.enrolledStudents.some(enrolled => enrolled.id === student.id)
        );
        
        availableSection.innerHTML = `
            <h3>Available Students (${availableStudents.length})</h3>
        `;
        
        if (availableStudents.length > 0) {
            const availableTable = document.createElement('table');
            
            // Table header
            const tableHeader = document.createElement('thead');
            tableHeader.innerHTML = `
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>College</th>
                    <th>Action</th>
                </tr>
            `;
            
            availableTable.appendChild(tableHeader);
            
            // Table body
            const tableBody = document.createElement('tbody');
            
            availableStudents.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.college}</td>
                    <td>
                        <button class="btn-primary enroll-btn" data-student-id="${student.id}">
                            Enroll
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            availableTable.appendChild(tableBody);
            availableSection.appendChild(availableTable);
        } else {
            availableSection.innerHTML += `
                <p>All students are already enrolled in this course.</p>
            `;
        }
        
        managementContainer.appendChild(availableSection);
        main.appendChild(managementContainer);
        
        // Add event listeners for enroll buttons
        const enrollButtons = document.querySelectorAll('.enroll-btn');
        enrollButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const studentId = e.target.dataset.studentId;
                this.controller.enrollStudent(this.course.id, studentId);
            });
        });
        
        // Add event listeners for unenroll buttons
        const unenrollButtons = document.querySelectorAll('.unenroll-btn');
        unenrollButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const studentId = e.target.dataset.studentId;
                this.controller.unenrollStudent(this.course.id, studentId);
            });
        });
    }

    hide() {
        // Clear the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
    }
}