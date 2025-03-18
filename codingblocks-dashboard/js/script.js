// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Coding Blocks Dashboard loaded!');
    
    // Import the people management system
    // Note: In a browser environment, you would typically include people.js before this script
    // or use ES modules with import/export
    
    // Demo the people management system
    function demoPeopleSystem() {
        // Create some sample people
        const john = new Person('John Doe', 'john@example.com', '2023-01-15');
        
        // Create students
        const alice = new Student('Alice Smith', 'alice@example.com', '2023-03-10', 'Web Development', 'WD2023');
        const bob = new Student('Bob Johnson', 'bob@example.com', '2023-02-05', 'Data Science', 'DS2023');
        
        // Create teachers
        const dr_smith = new Teacher('Dr. Smith', 'smith@codingblocks.com', '2020-06-01', 'JavaScript');
        const prof_jones = new Teacher('Prof. Jones', 'jones@codingblocks.com', '2021-08-15', 'Python');
        
        // Create a mentor
        const sarah = new Mentor('Sarah Wilson', 'sarah@codingblocks.com', '2022-01-10', 'Frontend Development', []);
        
        // Add courses to teachers
        dr_smith.addCourse({ id: 'WD101', name: 'Intro to Web Development', hoursPerWeek: 6 });
        dr_smith.addCourse({ id: 'JS201', name: 'Advanced JavaScript', hoursPerWeek: 8 });
        prof_jones.addCourse({ id: 'PY101', name: 'Python Fundamentals', hoursPerWeek: 5 });
        
        // Submit assignments for students
        alice.submitAssignment('A1');
        alice.submitAssignment('A2');
        alice.submitAssignment('A3');
        bob.submitAssignment('A1');
        
        // Assign students to mentor
        sarah.assignStudent(alice);
        sarah.assignStudent(bob);
        
        // Display information in console
        console.log('=== People at Coding Blocks ===');
        console.log('Person:', john.name, 'joined on', john.formatJoinDate());
        
        console.log('=== Students ===');
        console.log(`${alice.name} - Progress: ${alice.calculateProgress()}% - Joined: ${alice.formatJoinDate()}`);
        console.log(`${bob.name} - Progress: ${bob.calculateProgress()}% - Joined: ${bob.formatJoinDate()}`);
        
        console.log('=== Teachers ===');
        console.log(`${dr_smith.name} - Teaching load: ${dr_smith.calculateTeachingLoad()} hours/week - Joined: ${dr_smith.formatJoinDate()}`);
        console.log(`${prof_jones.name} - Teaching load: ${prof_jones.calculateTeachingLoad()} hours/week - Joined: ${prof_jones.formatJoinDate()}`);
        
        console.log('=== Mentor ===');
        console.log(`${sarah.name} - Mentoring load: ${sarah.calculateMentoringLoad()} students - Joined: ${sarah.formatJoinDate()}`);
        
        // Add demonstration data to the UI
        displayPeopleData([alice, bob], [dr_smith, prof_jones], [sarah]);
    }
    
    // Update the UI with people data
    function displayPeopleData(students, teachers, mentors) {
        const mainSection = document.querySelector('main');
        
        // Clear existing content in main section
        const dashboardCards = document.querySelector('.dashboard-cards');
        dashboardCards.innerHTML = '';
        
        // Add Students card
        const studentsCard = document.createElement('div');
        studentsCard.className = 'card';
        studentsCard.innerHTML = `
            <h2>Students</h2>
            <ul class="people-list">
                ${students.map(student => `
                    <li>
                        <strong>${student.name}</strong> (${student.course})
                        <div class="progress-bar">
                            <div class="progress" style="width: ${student.progress}%"></div>
                        </div>
                        <span class="progress-text">${student.progress}% complete</span>
                    </li>
                `).join('')}
            </ul>
        `;
        dashboardCards.appendChild(studentsCard);
        
        // Add Teachers card
        const teachersCard = document.createElement('div');
        teachersCard.className = 'card';
        teachersCard.innerHTML = `
            <h2>Teachers</h2>
            <ul class="people-list">
                ${teachers.map(teacher => `
                    <li>
                        <strong>${teacher.name}</strong>
                        <p>Specialization: ${teacher.specialization}</p>
                        <p>Courses: ${teacher.coursesTeaching.map(c => c.name).join(', ')}</p>
                        <p>Teaching load: ${teacher.calculateTeachingLoad()} hours/week</p>
                    </li>
                `).join('')}
            </ul>
        `;
        dashboardCards.appendChild(teachersCard);
        
        // Add Mentors card
        const mentorsCard = document.createElement('div');
        mentorsCard.className = 'card';
        mentorsCard.innerHTML = `
            <h2>Mentors</h2>
            <ul class="people-list">
                ${mentors.map(mentor => `
                    <li>
                        <strong>${mentor.name}</strong>
                        <p>Expertise: ${mentor.expertise}</p>
                        <p>Students assigned: ${mentor.calculateMentoringLoad()}</p>
                    </li>
                `).join('')}
            </ul>
        `;
        dashboardCards.appendChild(mentorsCard);
    }
    
    // Run the demo when the page loads
    // In a real app, you would fetch this data from a backend
    try {
        demoPeopleSystem();
    } catch (e) {
        console.error("Error initializing people system:", e);
        // If the demo fails (likely because people.js isn't loaded yet), 
        // we'll leave the original cards in place
    }
});