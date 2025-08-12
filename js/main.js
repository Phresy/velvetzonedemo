import { initAuthStateListener, loginWithEmail, signUpWithEmail } from './auth.js';

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      hamburger.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // Initialize auth state listener
  initAuthStateListener().then(user => {
    if (user) {
      // Update UI for logged in user
      const authButtons = document.querySelector('.auth-buttons');
      if (authButtons) {
        authButtons.innerHTML = `
          <a href="dashboard.html" class="btn btn-outline">
            <i class="fas fa-user"></i> My Account
          </a>
        `;
      }
    }
  });

  // Blockchain animation effect
  const blockchainText = document.querySelector('.blockchain-animation');
  if (blockchainText) {
    let hue = 200;
    setInterval(() => {
      hue = (hue + 5) % 360;
      blockchainText.style.color = `hsl(${hue}, 80%, 60%)`;
    }, 2000);
  }

  // Tooltip initialization
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });

  // Form validation enhancements
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('error');
          isValid = false;
        } else {
          field.classList.remove('error');
        }
      });

      if (!isValid) {
        e.preventDefault();
        const firstError = this.querySelector('.error');
        if (firstError) {
          firstError.focus();
        }
      }
    });
  });

  // Login form handling
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginStatus.textContent = "Logging in...";
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      const result = await loginWithEmail(email, password);

      if (result.success) {
        loginStatus.textContent = "Login successful! Redirecting...";
        // Redirect to dashboard or another page
        window.location.href = "dashboard.html";
      } else {
        loginStatus.textContent = "Login failed: " + result.error;
      }
    });
  }

  // Signup form handling
  const signupForm = document.getElementById('signupForm');
  const signupStatus = document.getElementById('signupStatus');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      signupStatus.textContent = "Signing up...";
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const displayName = document.getElementById('signupDisplayName').value.trim();
      const role = document.getElementById('signupRole') ? document.getElementById('signupRole').value : "client";

      const result = await signUpWithEmail(email, password, displayName, role);

      if (result.success) {
        signupStatus.textContent = "Signup successful! Please verify your email before logging in.";
        signupForm.reset();
      } else {
        signupStatus.textContent = "Signup failed: " + result.error;
      }
    });
  }
});

// Tooltip functions
function showTooltip(e) {
  const tooltipText = this.getAttribute('data-tooltip');
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = tooltipText;
  
  document.body.appendChild(tooltip);
  
  const rect = this.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
  
  this.tooltip = tooltip;
}

function hideTooltip() {
  if (this.tooltip) {
    this.tooltip.remove();
  }
}

// Helper function for loading states
export function setLoadingState(element, isLoading) {
  if (isLoading) {
    element.disabled = true;
    const originalText = element.innerHTML;
    element.setAttribute('data-original-text', originalText);
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  } else {
    element.disabled = false;
    const originalText = element.getAttribute('data-original-text');
    if (originalText) {
      element.innerHTML = originalText;
    }
  }
}

// Notification system
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}