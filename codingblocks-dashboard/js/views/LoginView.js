// Login View
class LoginView {
  constructor(controller) {
    this.controller = controller;
  }

  render() {
    // Temporarily remove header/footer for login page
    document.querySelector("header")?.classList.add("hidden");
    document.querySelector("footer")?.classList.add("hidden");

    // Get the main container
    const main = document.querySelector("main");
    main.innerHTML = "";

    // Create the login section
    const loginSection = document.createElement("section");
    loginSection.className = "login-section";

    loginSection.innerHTML = `
            <div class="login-container">
                <div class="login-visual">
                    <div class="login-illustration">
                        <img src="./cblogo.webp" alt="Coding illustration" />
                    </div>
                    <h1>Coding Blocks</h1>
                    <p class="login-tagline">Learn. Code. Grow.</p>
                    
                </div>
                <div class="login-content">
                    <div class="login-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue to your dashboard</p>
                    </div>
                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <div class="input-wrapper">
                                <i class="icon-email">✉️</i>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    placeholder="Enter your email" 
                                    required
                                >
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="input-wrapper">
                                <i class="icon-lock">🔒</i>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Enter your password" 
                                    required
                                >
                                <span class="toggle-password">👁️</span>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <span class="btn-text">Log In</span>
                            </button>
                        </div>
                        <div id="login-error" class="error-message"></div>
                    </form>
                    <div class="login-footer">
                        <div class="demo-accounts">
                            <h3>Quick Access</h3>
                            <div class="account-list">
                                <div class="account-item">
                                    <span class="account-role">Teacher</span>
                                    <span class="account-email">kartik@cb.com</span>
                                </div>
                                <div class="account-item">
                                    <span class="account-role">Assistant</span>
                                    <span class="account-email">assistant@cb.com</span>
                                </div>
                                <div class="account-item">
                                    <span class="account-role">Student</span>
                                    <span class="account-email">student@cb.com</span>
                                </div>
                            </div>
                            <p class="demo-password"><strong>Password for all:</strong> password123</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

    main.appendChild(loginSection);

    // Add event listener for form submission
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", this.handleLogin.bind(this));

    // Add password toggle functionality
    this.setupPasswordToggle();
  }

  setupPasswordToggle() {
    const passwordInput = document.getElementById("password");
    const togglePassword = document.querySelector(".toggle-password");

    togglePassword.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Optional: Change toggle icon or add visual feedback
      togglePassword.textContent = type === "password" ? "👁️" : "🙈";
    });
  }

  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Disable the submit button and show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const buttonText = submitButton.querySelector(".btn-text");
    const originalButtonText = buttonText.textContent;

    submitButton.disabled = true;
    buttonText.textContent = "Logging in...";

    // Clear previous error messages
    const errorElement = document.getElementById("login-error");
    errorElement.textContent = "";

    try {
      // Call the controller to handle the login
      const result = await this.controller.login(email, password);

      if (!result.success) {
        // Display error message
        errorElement.textContent = result.message;

        // Reset button
        submitButton.disabled = false;
        buttonText.textContent = originalButtonText;
      }
      // If login is successful, the controller will redirect to the appropriate dashboard
    } catch (error) {
      console.error("Login error:", error);
      errorElement.textContent =
        "An unexpected error occurred. Please try again.";

      // Reset button
      submitButton.disabled = false;
      buttonText.textContent = originalButtonText;
    }
  }

  hide() {
    // Restore header/footer
    document.querySelector("header")?.classList.remove("hidden");
    document.querySelector("footer")?.classList.remove("hidden");

    // Remove the login form
    const loginSection = document.querySelector(".login-section");
    if (loginSection) {
      loginSection.remove();
    }
  }
}
