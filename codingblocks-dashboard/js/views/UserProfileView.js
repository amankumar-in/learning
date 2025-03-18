// User Profile View
class UserProfileView {
  constructor(controller, user) {
    this.controller = controller;
    this.user = user;
    this.isEditing = false;
  }

  render() {
    // Get the main container
    const main = document.querySelector("main");
    main.innerHTML = "";

    // Create back link
    const backLink = document.createElement("div");
    backLink.className = "back-link";
    backLink.innerHTML = '<span class="back-icon">←</span> Back to Dashboard';
    backLink.addEventListener("click", () => this.controller.goToDashboard());
    main.appendChild(backLink);

    // Create profile container
    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container";

    // Profile header with avatar
    const profileHeader = document.createElement("div");
    profileHeader.className = "profile-header-large";

    const avatarClass =
      this.user.role === "student"
        ? "student-avatar large-avatar"
        : "large-avatar";

    profileHeader.innerHTML = `
            <div class="profile-avatar ${avatarClass}">
                ${this.user.name.charAt(0)}
            </div>
            <div class="profile-title-large">
                <h2>${this.user.name}</h2>
                <span class="profile-role-badge">${this.formatRole(
                  this.user.role
                )}</span>
            </div>
        `;

    profileContainer.appendChild(profileHeader);

    // Create tabs for different sections
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "profile-tabs";
    tabsContainer.innerHTML = `
            <button class="tab-btn active" data-tab="info">Personal Information</button>
            <button class="tab-btn" data-tab="security">Security</button>
            <button class="tab-btn" data-tab="preferences">Preferences</button>
        `;

    profileContainer.appendChild(tabsContainer);

    // Create content container for tabs
    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";

    // Initial tab content - Personal Information
    this.renderPersonalInfoTab(tabContent);

    profileContainer.appendChild(tabContent);
    main.appendChild(profileContainer);

    // Add event listeners for tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Remove active class from all tabs
        tabBtns.forEach((b) => b.classList.remove("active"));

        // Add active class to clicked tab
        e.target.classList.add("active");

        // Render appropriate tab content
        const tabType = e.target.dataset.tab;

        switch (tabType) {
          case "info":
            this.renderPersonalInfoTab(tabContent);
            break;
          case "security":
            this.renderSecurityTab(tabContent);
            break;
          case "preferences":
            this.renderPreferencesTab(tabContent);
            break;
        }
      });
    });

    // Add event listener for the edit button (will be added in renderPersonalInfoTab)
    setTimeout(() => {
      const editBtn = document.getElementById("edit-profile-btn");
      if (editBtn) {
        editBtn.addEventListener("click", () =>
          this.toggleEditMode(tabContent)
        );
      }
    }, 0);
  }

  renderPersonalInfoTab(container) {
    container.innerHTML = "";

    // Create card for personal information
    const infoCard = document.createElement("div");
    infoCard.className = "profile-info-card";

    // Different fields based on user role
    let roleSpecificFields = "";

    if (this.user.role === "teacher" || this.user.role === "assistant") {
      roleSpecificFields = `
                <div class="info-group">
                    <label>Specialization</label>
                    ${
                      this.isEditing
                        ? `<input type="text" id="specialization" value="${this.user.specialization}">`
                        : `<p>${this.user.specialization}</p>`
                    }
                </div>
                <div class="info-group">
                    <label>Experience</label>
                    ${
                      this.isEditing
                        ? `<input type="number" id="experience" value="${this.user.experience}">`
                        : `<p>${this.user.experience} years</p>`
                    }
                </div>
            `;
    } else if (this.user.role === "student") {
      roleSpecificFields = `
                <div class="info-group">
                    <label>College</label>
                    ${
                      this.isEditing
                        ? `<input type="text" id="college" value="${this.user.college}">`
                        : `<p>${this.user.college}</p>`
                    }
                </div>
                <div class="info-group">
                    <label>Age</label>
                    ${
                      this.isEditing
                        ? `<input type="number" id="age" value="${this.user.age}">`
                        : `<p>${this.user.age} years</p>`
                    }
                </div>
            `;
    }

    infoCard.innerHTML = `
            <div class="card-header">
                <h3>Personal Information</h3>
                ${
                  !this.isEditing
                    ? `<button id="edit-profile-btn" class="btn-secondary">
                        <i class="icon-edit"></i> Edit Profile
                    </button>`
                    : `<div class="edit-actions">
                        <button id="save-profile-btn" class="btn-primary">Save Changes</button>
                        <button id="cancel-edit-btn" class="btn-secondary">Cancel</button>
                    </div>`
                }
            </div>
            
            <div class="profile-info-content">
                <div class="info-group">
                    <label>Full Name</label>
                    ${
                      this.isEditing
                        ? `<input type="text" id="name" value="${this.user.name}">`
                        : `<p>${this.user.name}</p>`
                    }
                </div>
                <div class="info-group">
                    <label>Email</label>
                    ${
                      this.isEditing
                        ? `<input type="email" id="email" value="${this.user.email}">`
                        : `<p>${this.user.email}</p>`
                    }
                </div>
                <div class="info-group">
                    <label>Role</label>
                    <p>${this.formatRole(this.user.role)}</p>
                </div>
                <div class="info-group">
                    <label>Joined On</label>
                    <p>${this.user.formatJoinDate()}</p>
                </div>
                ${roleSpecificFields}
            </div>
        `;

    container.appendChild(infoCard);

    // Add event listeners for save and cancel buttons when in edit mode
    if (this.isEditing) {
      setTimeout(() => {
        document
          .getElementById("save-profile-btn")
          .addEventListener("click", () => this.saveProfile(container));
        document
          .getElementById("cancel-edit-btn")
          .addEventListener("click", () => {
            this.isEditing = false;
            this.renderPersonalInfoTab(container);
          });
      }, 0);
    }
  }

  renderSecurityTab(container) {
    container.innerHTML = "";

    // Create card for security settings
    const securityCard = document.createElement("div");
    securityCard.className = "profile-info-card";

    securityCard.innerHTML = `
            <div class="card-header">
                <h3>Security Settings</h3>
            </div>
            
            <div class="profile-info-content">
                <form id="password-change-form">
                    <div class="info-group">
                        <label for="current-password">Current Password</label>
                        <input type="password" id="current-password" required>
                    </div>
                    <div class="info-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" required>
                    </div>
                    <div class="info-group">
                        <label for="confirm-password">Confirm New Password</label>
                        <input type="password" id="confirm-password" required>
                    </div>
                    <div id="password-error" class="error-message"></div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Change Password</button>
                    </div>
                </form>
                
                <hr class="section-divider">
                
                <div class="security-option">
                    <div class="security-option-info">
                        <h4>Two-Factor Authentication</h4>
                        <p>Add an extra layer of security to your account</p>
                    </div>
                    <button class="btn-secondary">Enable</button>
                </div>
                
                <div class="security-option">
                    <div class="security-option-info">
                        <h4>Recent Login Activity</h4>
                        <p>Check your recent login sessions</p>
                    </div>
                    <button class="btn-secondary">View</button>
                </div>
            </div>
        `;

    container.appendChild(securityCard);

    // Add event listener for password change form
    const passwordForm = document.getElementById("password-change-form");
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handlePasswordChange();
    });
  }

  renderPreferencesTab(container) {
    container.innerHTML = "";

    // Create card for preferences
    const preferencesCard = document.createElement("div");
    preferencesCard.className = "profile-info-card";

    preferencesCard.innerHTML = `
            <div class="card-header">
                <h3>Preferences</h3>
            </div>
            
            <div class="profile-info-content">
                <div class="preference-option">
                    <div class="preference-info">
                        <h4>Email Notifications</h4>
                        <p>Receive email updates about your courses</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="preference-option">
                    <div class="preference-info">
                        <h4>Course Reminders</h4>
                        <p>Get reminders about upcoming classes</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="preference-option">
                    <div class="preference-info">
                        <h4>Dark Mode</h4>
                        <p>Switch between light and dark theme</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="preference-option">
                    <div class="preference-info">
                        <h4>Language</h4>
                        <p>Select your preferred language</p>
                    </div>
                    <select class="preference-select">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                    </select>
                </div>
            </div>
        `;

    container.appendChild(preferencesCard);

    // Add event listeners for toggles and select
    const toggles = document.querySelectorAll(".toggle-switch input");
    toggles.forEach((toggle) => {
      toggle.addEventListener("change", (e) => {
        // In a real app, this would save the preference to the user's profile
        console.log("Preference changed:", e.target.checked);

        // If it's the dark mode toggle, we would apply the theme
        if (
          e.target.closest(".preference-option").querySelector("h4")
            .textContent === "Dark Mode"
        ) {
          // Just for demo purposes
          alert(
            "Dark mode functionality will be implemented in a future update"
          );
        }
      });
    });
  }

  toggleEditMode(container) {
    this.isEditing = !this.isEditing;
    this.renderPersonalInfoTab(container);
  }

  saveProfile(container) {
    // Get updated values
    const updatedData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
    };

    // Get role-specific fields
    if (this.user.role === "teacher" || this.user.role === "assistant") {
      updatedData.specialization =
        document.getElementById("specialization").value;
      updatedData.experience = document.getElementById("experience").value;
    } else if (this.user.role === "student") {
      updatedData.college = document.getElementById("college").value;
      updatedData.age = document.getElementById("age").value;
    }

    // Call controller method to update profile
    const result = this.controller.updateProfile(updatedData);

    if (result.success) {
      // Update local user object with new data
      this.user = result.user;
      this.isEditing = false;
      this.renderPersonalInfoTab(container);

      // Show success message
      const successMsg = document.createElement("div");
      successMsg.className = "success-message";
      successMsg.textContent = "Profile updated successfully";
      container.appendChild(successMsg);

      // Remove success message after 3 seconds
      setTimeout(() => {
        successMsg.remove();
      }, 3000);
    } else {
      // Show error message
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = result.message || "Failed to update profile";
      container.appendChild(errorMsg);

      // Remove error message after 3 seconds
      setTimeout(() => {
        errorMsg.remove();
      }, 3000);
    }
  }

  handlePasswordChange() {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorElement = document.getElementById("password-error");

    // Clear previous error messages
    errorElement.textContent = "";

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      errorElement.textContent = "New passwords do not match";
      return;
    }

    // Call controller method to change password
    const result = this.controller.changePassword(currentPassword, newPassword);

    if (result.success) {
      // Show success message
      errorElement.textContent = "Password changed successfully";
      errorElement.className = "success-message";

      // Clear the form
      document.getElementById("password-change-form").reset();
    } else {
      // Show error message
      errorElement.textContent = result.message || "Failed to change password";
    }
  }

  formatRole(role) {
    switch (role) {
      case "teacher":
        return "Teacher";
      case "assistant":
        return "Teaching Assistant";
      case "student":
        return "Student";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  }

  hide() {
    // Clear the main container
    const main = document.querySelector("main");
    main.innerHTML = "";
  }
}
