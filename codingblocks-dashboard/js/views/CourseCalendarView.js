// Course Calendar View for Instructors
class CourseCalendarView {
    constructor(controller, course, enrolledStudents) {
        this.controller = controller;
        this.course = course;
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
        
        // Create calendar container
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        
        // Calendar header
        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        calendarHeader.innerHTML = `
            <h2>${this.course.name} - Calendar & Attendance</h2>
            <div class="header-actions">
                <button id="add-class-btn" class="btn-primary">Add Class</button>
                <button id="save-all-attendance-btn" class="btn-success">Save All Attendance</button>
            </div>
        `;
        
        calendarContainer.appendChild(calendarHeader);
        
        // Calendar content
        const calendarContent = document.createElement('div');
        calendarContent.className = 'calendar-content';
        
        if (this.course.calendar && this.course.calendar.length > 0) {
            // Sort calendar sessions by date
            const sortedCalendar = [...this.course.calendar].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            
            // Create a spreadsheet-like table with students as rows and classes as columns
            let calendarHTML = `
                <div class="attendance-grid-container">
                    <table class="attendance-grid">
                        <thead>
                            <tr>
                                <th class="student-name-col">Student Name</th>
            `;
            
            // Add each class date as a column header
            sortedCalendar.forEach(classSession => {
                calendarHTML += `
                    <th class="class-date-col">
                        <div class="class-date">${classSession.date}</div>
                        <div class="class-topic">${classSession.topic}</div>
                    </th>
                `;
            });
            
            calendarHTML += `
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // For each student, create a row with attendance for each class
            this.enrolledStudents.forEach(student => {
                calendarHTML += `
                    <tr>
                        <td class="student-name-cell">${student.name}</td>
                `;
                
                // Add a cell for each class date with the attendance checkbox
                sortedCalendar.forEach(classSession => {
                    const isPresent = classSession.attendance && classSession.attendance[student.id] === true;
                    const statusClass = isPresent ? 'present' : 'absent';
                    
                    calendarHTML += `
                        <td class="attendance-cell ${statusClass}">
                            <label class="attendance-checkbox">
                                <input type="checkbox" class="attendance-input"
                                    data-class-date="${classSession.date}"
                                    data-student-id="${student.id}"
                                    ${isPresent ? 'checked' : ''}>
                                <span class="attendance-mark"></span>
                            </label>
                        </td>
                    `;
                });
                
                calendarHTML += `
                    </tr>
                `;
            });
            
            calendarHTML += `
                        </tbody>
                    </table>
                </div>
            `;
            
            calendarContent.innerHTML = calendarHTML;
        } else {
            calendarContent.innerHTML = `
                <div class="empty-calendar">
                    <p>No classes have been added to the calendar yet.</p>
                    <p>Click the "Add Class" button to add the first class.</p>
                </div>
            `;
        }
        
        calendarContainer.appendChild(calendarContent);
        main.appendChild(calendarContainer);
        
        // Add event listener for add class button
        document.getElementById('add-class-btn').addEventListener('click', () => {
            this.controller.showAddClassForm(this.course.id);
        });
        
        // Add event listeners for attendance checkboxes - just update the UI without saving yet
        const attendanceCheckboxes = document.querySelectorAll('.attendance-input');
        attendanceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const isPresent = e.target.checked;
                
                // Update the cell class for styling
                const cell = e.target.closest('td');
                
                if (isPresent) {
                    cell.classList.remove('absent');
                    cell.classList.add('present');
                } else {
                    cell.classList.remove('present');
                    cell.classList.add('absent');
                }
            });
        });
        
        // Add event listener for save all attendance button
        document.getElementById('save-all-attendance-btn').addEventListener('click', () => {
            // Collect all attendance data
            const attendanceData = [];
            const attendanceCheckboxes = document.querySelectorAll('.attendance-input');
            
            attendanceCheckboxes.forEach(checkbox => {
                attendanceData.push({
                    classDate: checkbox.dataset.classDate,
                    studentId: checkbox.dataset.studentId,
                    isPresent: checkbox.checked
                });
            });
            
            // Send all attendance data to the controller
            const result = this.controller.saveAllAttendance(this.course.id, attendanceData);
            
            if (result.success) {
                alert('All attendance data saved successfully');
            } else {
                alert(result.message || 'Failed to save some attendance data');
            }
        });
    }

    hide() {
        // Clear the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
    }
}