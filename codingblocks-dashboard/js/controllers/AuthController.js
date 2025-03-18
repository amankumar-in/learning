// Authentication Controller
class AuthController {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.currentView = null;
    }

    // Initialize login form and authentication check
    async init() {
        // Check if a user is already logged in
        const authenticatedUser = this.dataStore.checkAuthentication();
        
        if (authenticatedUser) {
            // User is logged in, redirect to appropriate dashboard
            this.redirectToDashboard(authenticatedUser);
            return;
        }
        
        // User not logged in, show login form
        this.showLoginForm();
    }

    showLoginForm() {
        // Create and render the login view
        if (this.currentView) {
            this.currentView.hide();
        }
        
        const loginView = new LoginView(this);
        loginView.render();
        this.currentView = loginView;
    }

    // Handle login form submission
    async login(email, password) {
        try {
            console.log("Login attempt:", email, password);
            console.log("Available users:", this.dataStore.users);
            
            const user = this.dataStore.authenticateUser(email, password);
            
            if (user) {
                console.log("Login successful:", user);
                // Login successful, redirect to appropriate dashboard
                this.redirectToDashboard(user);
                return { success: true, user };
            } else {
                console.log("Login failed: Invalid email or password");
                // Login failed
                return { success: false, message: "Invalid email or password" };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "An error occurred during login" };
        }
    }

    // Logout the current user
    logout() {
        this.dataStore.logout();
        window.location.href = "index.html";
    }

    // Redirect to the appropriate dashboard based on user role
    redirectToDashboard(user) {
        let dashboardController;
        
        // Initialize the appropriate dashboard based on user role
        switch (user.role) {
            case 'teacher':
            case 'assistant':
                dashboardController = new InstructorDashboardController(this.dataStore);
                break;
            case 'student':
                dashboardController = new StudentDashboardController(this.dataStore);
                break;
            default:
                console.error('Unknown user role:', user.role);
                return;
        }
        
        // Initialize the dashboard
        dashboardController.init();
    }
}
