// Add Class View for Instructors
class AddClassView {
    constructor(controller, course) {
        this.controller = controller;
        this.course = course;
    }

    render() {
        // Get the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
        
        // Create back link
        const backLink = document.createElement('div');
        backLink.className = 'back-link';
        backLink.innerHTML = '<span class="back-icon">←</span> Back to Calendar';
        backLink.addEventListener('click', () => this.controller.showCourseCalendar(this.course.id));
        main.appendChild(backLink);
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.className = 'form-container';
        
        // Form header
        const formHeader = document.createElement('div');
        formHeader.className = 'form-header';
        formHeader.innerHTML = `<h2>Add New Class for ${this.course.name}</h2>`;
        
        formContainer.appendChild(formHeader);
        
        // Create class form
        const classForm = document.createElement('form');
        classForm.id = 'add-class-form';
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        classForm.innerHTML = `
            <div class="form-group">
                <label for="class-date">Class Date</label>
                <input type="date" id="class-date" name="date" min="${today}" required>
            </div>
            
            <div class="form-group">
                <label for="class-topic">Topic</label>
                <input type="text" id="class-topic" name="topic" required>
            </div>
            
            <div class="form-group">
                <button type="submit" class="btn-primary">Add Class</button>
            </div>
        `;
        
        formContainer.appendChild(classForm);
        main.appendChild(formContainer);
        
        // Add event listener for form submission
        classForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const date = document.getElementById('class-date').value;
        const topic = document.getElementById('class-topic').value;
        
        // Call controller to add class to calendar
        const result = this.controller.addClassToCalendar(this.course.id, { date, topic });
        
        if (!result.success) {
            alert(result.message || 'Failed to add class to calendar');
        }
    }

    hide() {
        // Clear the main container
        const main = document.querySelector('main');
        main.innerHTML = '';
    }
}