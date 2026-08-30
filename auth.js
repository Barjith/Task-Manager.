console.log('AUTH.JS LOADED!');

// Set theme
const theme = localStorage.getItem('tm_theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);

// Redirect if logged in
if (localStorage.getItem('tm_user')) {
  window.location.href = 'index.html';
}

// Wait for page to load
window.onload = function() {
  console.log('AUTH.JS: Page loaded, starting initialization...');
  
  // Get elements
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  console.log('Elements found:', {
    loginTab: !!loginTab,
    signupTab: !!signupTab,
    loginPanel: !!loginPanel,
    signupPanel: !!signupPanel,
    loginForm: !!loginForm,
    signupForm: !!signupForm
  });
  
  // Tab switching
  if (loginTab && signupTab && loginPanel && signupPanel) {
    loginTab.onclick = function() {
      console.log('Login tab clicked');
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginPanel.hidden = false;
      signupPanel.hidden = true;
    };
    
    signupTab.onclick = function() {
      console.log('Signup tab clicked');
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupPanel.hidden = false;
      loginPanel.hidden = true;
    };
    
    console.log('Tab switching enabled');
  }
  
  // Password toggles
  const toggles = document.querySelectorAll('.pass-toggle');
  console.log('Found', toggles.length, 'password toggles');
  
  toggles.forEach(function(btn) {
    btn.onclick = function(e) {
      e.preventDefault();
      const input = btn.previousElementSibling;
      const icon = btn.querySelector('i');
      if (input && icon) {
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'fas fa-eye-slash';
        } else {
          input.type = 'password';
          icon.className = 'fas fa-eye';
        }
      }
    };
  });
  
  // Login form
  if (loginForm) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      console.log('Login submitted');
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      
      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('tm_users') || '[]');
      const user = users.find(function(u) {
        return u.email === email && u.password === password;
      });
      
      if (!user) {
        alert('Invalid email or password');
        return;
      }
      
      localStorage.setItem('tm_user', JSON.stringify({
        name: user.name,
        email: user.email
      }));
      
      window.location.href = 'index.html';
    };
    
    console.log('Login form handler attached');
  }
  
  // Signup form
  if (signupForm) {
    signupForm.onsubmit = function(e) {
      e.preventDefault();
      console.log('Signup submitted');
      
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirm').value;
      
      if (!name || !email || !password || !confirm) {
        alert('Please fill all fields');
        return;
      }
      
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      
      if (password !== confirm) {
        alert('Passwords do not match');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('tm_users') || '[]');
      
      if (users.find(function(u) { return u.email === email; })) {
        alert('Email already exists');
        return;
      }
      
      users.push({ name: name, email: email, password: password });
      localStorage.setItem('tm_users', JSON.stringify(users));
      
      alert('Account created! Please login.');
      
      loginTab.click();
      document.getElementById('loginEmail').value = email;
    };
    
    console.log('Signup form handler attached');
  }
  
  // Update status
  const status = document.getElementById('jsStatus');
  if (status) {
    status.textContent = 'JavaScript Active';
    status.style.color = '#00f0a0';
  }
  
  console.log('AUTH.JS: Initialization complete!');
};
