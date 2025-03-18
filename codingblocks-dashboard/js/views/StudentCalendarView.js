// Student Calendar View
class StudentCalendarView {
    constructor(controller, course, classesWithAttendance) {
        this.controller = controller;
        this.course = course;
        this.classesWithAttendance = classesWithAttendance;
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
        `;
        
        calendarContainer.appendChild(calendarHeader);
        
        // Calendar content
        const calendarContent = document.createElement('div');
        calendarContent.className = 'calendar-content';
        
        if (this.classesWithAttendance && this.classesWithAttendance.length > 0) {
            // Sort class sessions by date
            const sortedClasses = [...this.classesWithAttendance].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            
            let calendarHTML = `
                <div class="attendance-grid-container">
                    <table class="attendance-grid">
                        <thead>
                            <tr>
                                <th class="student-name-col">Your Attendance</th>
            `;
            
            // Add each class date as a column header
            sortedClasses.forEach(classSession => {
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
                            <tr>
                                <td class="student-name-cell">${this.controller.currentUser.name}</td>
            `;
            
            // Add a cell for each class with the attendance status
            sortedClasses.forEach(classSession => {
                const statusClass = classSession.present ? 'present' : 'absent';
                const statusText = classSession.present ? 'Present' : 'Absent';
                
                calendarHTML += `
                    <td class="attendance-cell ${statusClass}">
                        <span class="attendance-status ${statusClass}">${statusText}</span>
                    </td>
                `;
            });
            
            calendarHTML += `
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Attendance Summary -->
                <div class="attendance-summary">
                    <h3>Your Attendance Summary</h3>
                    <p>Total Classes: ${sortedClasses.length}</p>
                    <p>Classes Attended: ${sortedClasses.filter(c => c.present).length}</p>
                    <p>Attendance Rate: ${Math.round((sortedClasses.filter(c => c.present).length / sortedClasses.length) * 100)}%</p>
                </div>
            `;
            
            calendarContent.innerHTML = calendarHTML;
        } else {
            calendarContent.innerHTML = `
                <div class="empty-calendar">
                    <p>No classes have been scheduled yet.</p>
                </div>
            `;
        }
        
        calendarContainer.appendChild(calendarContent);
        main.appendChild(calendarContainer);
    }

    hide() {
        // Clear the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
    }
}