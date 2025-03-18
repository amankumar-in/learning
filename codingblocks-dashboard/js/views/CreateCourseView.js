// Create Course View for Instructors
class CreateCourseView {
    constructor(controller) {
        this.controller = controller;
    }

    render() {
        // Get the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
        
        // Create back link
        const backLink = document.createElement('div');
        backLink.className = 'back-link';
        backLink.innerHTML = '<span class="back-icon">←</span> Back to Dashboard';
        backLink.addEventListener('click', () => this.controller.goToDashboard());
        main.appendChild(backLink);
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.className = 'form-container';
        
        // Form header
        const formHeader = document.createElement('div');
        formHeader.className = 'form-header';
        formHeader.innerHTML = `<h2>Create New Course</h2>`;
        
        formContainer.appendChild(formHeader);
        
        // Create course form
        const courseForm = document.createElement('form');
        courseForm.id = 'create-course-form';
        
        courseForm.innerHTML = `
            <div class="form-group">
                <label for="course-name">Course Name</label>
                <input type="text" id="course-name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="course-description">Description</label>
                <textarea id="course-description" name="description" rows="4" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="start-date">Start Date</label>
                <input type="date" id="start-date" name="startDate" required>
            </div>
            
            <div class="form-group">
                <label for="end-date">End Date</label>
                <input type="date" id="end-date" name="endDate" required>
            </div>
            
            <div class="form-group">
                <h3>Class Schedule</h3>
                <div id="schedule-container">
                    <div class="schedule-item">
                        <select name="schedule-day-1" required>
                            <option value="">Select Day</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </select>
                        <input type="text" name="schedule-time-1" placeholder="Time (e.g. 10:00 - 12:00)" required>
                    </div>
                </div>
                <button type="button" id="add-schedule-btn" class="btn-secondary">Add Another Day</button>
            </div>
            
            <div class="form-group">
                <button type="submit" class="btn-primary">Create Course</button>
            </div>
        `;
        
        formContainer.appendChild(courseForm);
        main.appendChild(formContainer);
        
        // Add event listener for form submission
        courseForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Add event listener for add schedule button
        document.getElementById('add-schedule-btn').addEventListener('click', this.addScheduleItem.bind(this));
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const name = document.getElementById('course-name').value;
        const description = document.getElementById('course-description').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        // Get schedule items
        const scheduleItems = [];
        const scheduleContainer = document.getElementById('schedule-container');
        const scheduleItemElements = scheduleContainer.querySelectorAll('.schedule-item');
        
        scheduleItemElements.forEach((item, index) => {
            const daySelect = item.querySelector(`select[name="schedule-day-${index + 1}"]`);
            const timeInput = item.querySelector(`input[name="schedule-time-${index + 1}"]`);
            
            if (daySelect && timeInput && daySelect.value && timeInput.value) {
                scheduleItems.push({
                    day: daySelect.value,
                    time: timeInput.value
                });
            }
        });
        
        // Create course data object
        const courseData = {
            name,
            description,
            startDate,
            endDate,
            schedule: scheduleItems
        };
        
        // Call controller to create the course
        const result = this.controller.createCourse(courseData);
        
        if (!result.success) {
            alert(result.message || 'Failed to create course');
        }
    }

    addScheduleItem() {
        const scheduleContainer = document.getElementById('schedule-container');
        const itemCount = scheduleContainer.querySelectorAll('.schedule-item').length + 1;
        
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <select name="schedule-day-${itemCount}" required>
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
            </select>
            <input type="text" name="schedule-time-${itemCount}" placeholder="Time (e.g. 10:00 - 12:00)" required>
            <button type="button" class="remove-schedule-btn btn-danger">Remove</button>
        `;
        
        scheduleContainer.appendChild(scheduleItem);
        
        // Add event listener for remove button
        scheduleItem.querySelector('.remove-schedule-btn').addEventListener('click', () => {
            scheduleContainer.removeChild(scheduleItem);
        });
    }

    hide() {
        // Clear the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
    }
}