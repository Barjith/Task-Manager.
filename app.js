console.log('APP.JS LOADED!');

// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('tm_user') || 'null');
if (!currentUser) {
  window.location.href = 'login.html';
}

// Storage key
const STORAGE_KEY = 'taskmaster_tasks';

// Load tasks
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

// Save tasks
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// State
let tasks = loadTasks();
let filter = 'all';
let editId = null;

console.log('Loaded', tasks.length, 'tasks');

// Wait for page to load
window.onload = function() {
  console.log('APP.JS: Page loaded, initializing...');
  
  // Get elements
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const taskInput = document.getElementById('taskInput');
  const taskNote = document.getElementById('taskNote');
  const taskPriority = document.getElementById('taskPriority');
  const taskCategory = document.getElementById('taskCategory');
  const taskDue = document.getElementById('taskDue');
  const taskForm = document.getElementById('taskForm');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const themeBtn = document.getElementById('themeBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userGreeting = document.getElementById('userGreeting');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  
  console.log('Elements check:', {
    taskList: !!taskList,
    taskForm: !!taskForm,
    searchInput: !!searchInput
  });
  
  // Set user name
  if (userGreeting && currentUser) {
    userGreeting.textContent = currentUser.name.split(' ')[0];
  }
  
  // Theme toggle
  if (themeBtn) {
    const savedTheme = localStorage.getItem('tm_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    
    themeBtn.onclick = function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('tm_theme', next);
      themeBtn.innerHTML = next === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    };
  }
  
  // Logout
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      localStorage.removeItem('tm_user');
      window.location.href = 'login.html';
    };
  }
  
  // Mobile menu
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.onclick = function() {
      sidebar.classList.toggle('active');
    };
  }
  
  // Render function
  function render() {
    console.log('Rendering tasks... Total:', tasks.length, 'Filter:', filter);
    
    if (!taskList) {
      console.error('taskList element not found!');
      return;
    }
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Filter tasks
    let filtered = tasks.filter(function(task) {
      if (filter === 'active' && task.done) return false;
      if (filter === 'completed' && !task.done) return false;
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm)) return false;
      return true;
    });
    
    // Sort tasks
    const sortBy = sortSelect ? sortSelect.value : 'newest';
    if (sortBy === 'oldest') {
      filtered.sort(function(a, b) { return a.createdAt - b.createdAt; });
    } else if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      filtered.sort(function(a, b) { return order[a.priority] - order[b.priority]; });
    } else {
      filtered.sort(function(a, b) { return b.createdAt - a.createdAt; });
    }
    
    // Show/hide empty state FIRST
    if (emptyState) {
      if (filtered.length > 0) {
        emptyState.hidden = true;
        emptyState.style.display = 'none';
      } else {
        emptyState.hidden = false;
        emptyState.style.display = 'flex';
      }
    }
    
    // Clear list
    taskList.innerHTML = '';
    
    // Render each task
    console.log('Filtered tasks to show:', filtered.length);
    
    filtered.forEach(function(task) {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.setAttribute('data-priority', task.priority);
      
      li.innerHTML = '<input type="checkbox" class="task-check" ' + (task.done ? 'checked' : '') + ' data-id="' + task.id + '">' +
        '<div class="task-body">' +
        '<span class="task-title">' + task.title + '</span>' +
        (task.note ? '<span class="task-note">' + task.note + '</span>' : '') +
        '<div class="task-chips">' +
        '<span class="chip chip-priority-' + task.priority + '">' + task.priority + '</span>' +
        '<span class="chip chip-cat">' + task.category + '</span>' +
        (task.due ? '<span class="chip chip-due">' + task.due + '</span>' : '') +
        '</div></div>' +
        '<div class="task-actions">' +
        '<button class="act-btn edit" data-id="' + task.id + '"><i class="fas fa-edit"></i></button>' +
        '<button class="act-btn delete" data-id="' + task.id + '"><i class="fas fa-trash-alt"></i></button>' +
        '</div>';
      
      taskList.appendChild(li);
    });
    
    // Update stats
    const statTotal = document.getElementById('statTotal');
    const statActive = document.getElementById('statActive');
    const statDone = document.getElementById('statDone');
    
    if (statTotal) statTotal.textContent = tasks.length;
    if (statActive) statActive.textContent = tasks.filter(function(t) { return !t.done; }).length;
    if (statDone) statDone.textContent = tasks.filter(function(t) { return t.done; }).length;
    
    // Update category badges
    const counts = { work: 0, study: 0, personal: 0, general: 0 };
    tasks.filter(function(t) { return !t.done; }).forEach(function(t) {
      if (counts[t.category] !== undefined) counts[t.category]++;
    });
    
    const badgeWork = document.getElementById('badgeWork');
    const badgeStudy = document.getElementById('badgeStudy');
    const badgePersonal = document.getElementById('badgePersonal');
    const badgeGeneral = document.getElementById('badgeGeneral');
    
    if (badgeWork) badgeWork.textContent = counts.work;
    if (badgeStudy) badgeStudy.textContent = counts.study;
    if (badgePersonal) badgePersonal.textContent = counts.personal;
    if (badgeGeneral) badgeGeneral.textContent = counts.general;
    
    // Attach event listeners to task items
    attachTaskListeners();
  }
  
  // Attach listeners to task items
  function attachTaskListeners() {
    // Checkboxes
    document.querySelectorAll('.task-check').forEach(function(cb) {
      cb.onclick = function() {
        const id = cb.getAttribute('data-id');
        const task = tasks.find(function(t) { return t.id === id; });
        if (task) {
          task.done = !task.done;
          saveTasks(tasks);
          render();
        }
      };
    });
    
    // Edit buttons
    document.querySelectorAll('.act-btn.edit').forEach(function(btn) {
      btn.onclick = function() {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      };
    });
    
    // Delete buttons
    document.querySelectorAll('.act-btn.delete').forEach(function(btn) {
      btn.onclick = function() {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this task?')) {
          tasks = tasks.filter(function(t) { return t.id !== id; });
          saveTasks(tasks);
          render();
        }
      };
    });
  }
  
  // Add task form
  if (taskForm) {
    taskForm.onsubmit = function(e) {
      e.preventDefault();
      console.log('Adding task...');
      
      const title = taskInput.value.trim();
      if (!title) return;
      
      const task = {
        id: Date.now().toString(),
        title: title,
        note: taskNote.value.trim(),
        priority: taskPriority.value,
        category: taskCategory.value,
        due: taskDue.value || null,
        done: false,
        createdAt: Date.now()
      };
      
      tasks.unshift(task);
      saveTasks(tasks);
      
      console.log('Task added! Total tasks now:', tasks.length);
      
      taskInput.value = '';
      taskNote.value = '';
      taskDue.value = '';
      
      render();
      console.log('Task added!');
    };
  }
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.onclick = function() {
      filter = btn.getAttribute('data-filter');
      document.querySelectorAll('.filter-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      render();
    };
  });
  
  // Sidebar navigation
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    item.onclick = function(e) {
      e.preventDefault();
      var page = item.getAttribute('data-page');
      console.log('Navigation clicked:', page);
      
      // Remove active class from all nav items
      document.querySelectorAll('.nav-item').forEach(function(nav) {
        nav.classList.remove('active');
      });
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Show alert for now (you can create separate pages later)
      if (page === 'dashboard') {
        // Already on dashboard, just update title
        document.querySelector('.page-title').textContent = 'Dashboard';
      } else if (page === 'tasks') {
        document.querySelector('.page-title').textContent = 'All Tasks';
        alert('All Tasks view - showing all your tasks (same as dashboard for now)');
      } else if (page === 'calendar') {
        document.querySelector('.page-title').textContent = 'Calendar';
        alert('Calendar view coming soon! This will show your tasks in a calendar format.');
      } else if (page === 'analytics') {
        document.querySelector('.page-title').textContent = 'Analytics';
        alert('Analytics coming soon! This will show statistics and charts about your tasks.');
      }
    };
  });
  
  // Category navigation
  document.querySelectorAll('.nav-item[data-category]').forEach(function(item) {
    item.onclick = function(e) {
      e.preventDefault();
      var category = item.getAttribute('data-category');
      console.log('Category clicked:', category);
      
      // Filter by category
      filter = 'all';
      
      // Update search to filter by category
      var filtered = tasks.filter(function(task) {
        return task.category === category;
      });
      
      document.querySelector('.page-title').textContent = category.charAt(0).toUpperCase() + category.slice(1) + ' Tasks';
      
      alert('Filtering by ' + category + ' category. Found ' + filtered.length + ' tasks.\n\nNote: Full category filtering will be implemented next!');
    };
  });
  
  // Search
  if (searchInput) {
    searchInput.oninput = render;
  }
  
  // Sort
  if (sortSelect) {
    sortSelect.onchange = render;
  }
  
  // Clear done
  const clearDoneBtn = document.getElementById('clearDone');
  if (clearDoneBtn) {
    clearDoneBtn.onclick = function() {
      if (confirm('Clear all completed tasks?')) {
        tasks = tasks.filter(function(t) { return !t.done; });
        saveTasks(tasks);
        render();
      }
    };
  }
  
  // Edit modal
  function openEditModal(id) {
    const task = tasks.find(function(t) { return t.id === id; });
    if (!task) return;
    
    editId = id;
    
    const modalBackdrop = document.getElementById('modalBackdrop');
    const editInput = document.getElementById('editInput');
    const editNote = document.getElementById('editNote');
    const editPriority = document.getElementById('editPriority');
    const editCategory = document.getElementById('editCategory');
    const editDue = document.getElementById('editDue');
    
    if (editInput) editInput.value = task.title;
    if (editNote) editNote.value = task.note || '';
    if (editPriority) editPriority.value = task.priority;
    if (editCategory) editCategory.value = task.category;
    if (editDue) editDue.value = task.due || '';
    
    if (modalBackdrop) modalBackdrop.hidden = false;
  }
  
  function closeEditModal() {
    const modalBackdrop = document.getElementById('modalBackdrop');
    if (modalBackdrop) modalBackdrop.hidden = true;
    editId = null;
  }
  
  // Edit form
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.onsubmit = function(e) {
      e.preventDefault();
      
      const task = tasks.find(function(t) { return t.id === editId; });
      if (!task) return;
      
      task.title = document.getElementById('editInput').value.trim() || task.title;
      task.note = document.getElementById('editNote').value.trim();
      task.priority = document.getElementById('editPriority').value;
      task.category = document.getElementById('editCategory').value;
      task.due = document.getElementById('editDue').value || null;
      
      saveTasks(tasks);
      render();
      closeEditModal();
    };
  }
  
  // Modal close buttons
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const modalBackdrop = document.getElementById('modalBackdrop');
  
  if (modalClose) modalClose.onclick = closeEditModal;
  if (modalCancel) modalCancel.onclick = closeEditModal;
  if (modalBackdrop) {
    modalBackdrop.onclick = function(e) {
      if (e.target === modalBackdrop) closeEditModal();
    };
  }
  
  // Initial render
  render();
  
  console.log('APP.JS: Initialization complete!');
};
