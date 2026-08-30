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
      
      const taskTimeInput = document.getElementById('taskTime');
      
      const task = {
        id: Date.now().toString(),
        title: title,
        note: taskNote.value.trim(),
        priority: taskPriority.value,
        category: taskCategory.value,
        due: taskDue.value || null,
        time: taskTimeInput ? taskTimeInput.value : null,
        done: false,
        createdAt: Date.now()
      };
      
      tasks.unshift(task);
      saveTasks(tasks);
      
      console.log('Task added! Total tasks now:', tasks.length);
      
      taskInput.value = '';
      taskNote.value = '';
      taskDue.value = '';
      if (taskTimeInput) taskTimeInput.value = '';
      
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
    const editTime = document.getElementById('editTime');
    
    if (editInput) editInput.value = task.title;
    if (editNote) editNote.value = task.note || '';
    if (editPriority) editPriority.value = task.priority;
    if (editCategory) editCategory.value = task.category;
    if (editDue) editDue.value = task.due || '';
    if (editTime) editTime.value = task.time || '';
    
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
      task.time = document.getElementById('editTime').value || null;
      
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


// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM
// ══════════════════════════════════════════════════════════════════════════

function initNotificationSystem() {
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationPanel = document.getElementById('notificationPanel');
  const notificationBadge = document.getElementById('notificationBadge');
  const notificationList = document.getElementById('notificationList');
  const closeNotifications = document.getElementById('closeNotifications');
  
  if (!notificationBtn || !notificationPanel) return;
  
  let notificationsPanelOpen = false;
  let notificationPermissionGranted = false;
  let checkedTasks = new Set(); // Track which tasks we've already shown popup for
  
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(function(permission) {
      notificationPermissionGranted = permission === 'granted';
      console.log('Notification permission:', permission);
    });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    notificationPermissionGranted = true;
  }
  
  // Toggle notification panel
  notificationBtn.onclick = function(e) {
    e.stopPropagation();
    notificationsPanelOpen = !notificationsPanelOpen;
    notificationPanel.style.display = notificationsPanelOpen ? 'block' : 'none';
    if (notificationsPanelOpen) {
      renderNotifications();
    }
  };
  
  // Close notifications
  if (closeNotifications) {
    closeNotifications.onclick = function() {
      notificationsPanelOpen = false;
      notificationPanel.style.display = 'none';
    };
  }
  
  // Close when clicking outside
  document.addEventListener('click', function(e) {
    if (notificationsPanelOpen && 
        !notificationPanel.contains(e.target) && 
        !notificationBtn.contains(e.target)) {
      notificationsPanelOpen = false;
      notificationPanel.style.display = 'none';
    }
  });
  
  // Calculate time remaining with date and time
  function getTimeRemaining(dueDate, dueTime) {
    if (!dueDate) return null;
    
    const now = new Date();
    let due = new Date(dueDate);
    
    // If time is specified, set it
    if (dueTime) {
      const timeParts = dueTime.split(':');
      due.setHours(parseInt(timeParts[0], 10));
      due.setMinutes(parseInt(timeParts[1], 10));
      due.setSeconds(0);
    } else {
      // If no time specified, default to end of day
      due.setHours(23, 59, 59);
    }
    
    const diff = due - now;
    
    if (diff < 0) {
      return { overdue: true, text: 'Overdue', days: 0, hours: 0, minutes: 0, isDueNow: false };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    // Check if task is due within 5 minutes
    const isDueNow = diff <= 5 * 60 * 1000 && diff > 0;
    
    if (days > 0) {
      return { overdue: false, text: days + ' day' + (days > 1 ? 's' : '') + ' remaining', days: days, hours: hours, minutes: minutes, isDueNow: isDueNow };
    } else if (hours > 0) {
      return { overdue: false, text: hours + ' hour' + (hours > 1 ? 's' : '') + ' remaining', days: 0, hours: hours, minutes: minutes, isDueNow: isDueNow };
    } else {
      return { overdue: false, text: minutes + ' minute' + (minutes > 1 ? 's' : '') + ' remaining', days: 0, hours: 0, minutes: minutes, isDueNow: isDueNow };
    }
  }
  
  // Get notification priority
  function getNotificationPriority(timeRemaining) {
    if (!timeRemaining) return 'info';
    if (timeRemaining.overdue) return 'urgent';
    if (timeRemaining.isDueNow) return 'urgent'; // Due within 5 minutes
    if (timeRemaining.days === 0) return 'urgent'; // Due today
    if (timeRemaining.days === 1) return 'warning'; // Due tomorrow
    if (timeRemaining.days <= 3) return 'warning'; // Due within 3 days
    return 'info';
  }
  
  // Get notification icon
  function getNotificationIcon(priority) {
    if (priority === 'urgent') return 'fa-exclamation-triangle';
    if (priority === 'warning') return 'fa-clock';
    return 'fa-info-circle';
  }
  
  // Show browser popup notification
  function showPopupNotification(task, timeRemaining) {
    if (!notificationPermissionGranted || !('Notification' in window)) return;
    
    // Don't show if already shown for this task
    const taskKey = task.id + '-' + task.due + '-' + task.time;
    if (checkedTasks.has(taskKey)) return;
    
    checkedTasks.add(taskKey);
    
    let title = '⚠️ Task Due Soon!';
    let body = task.title;
    
    if (timeRemaining.overdue) {
      title = '🔴 Overdue Task!';
      body = task.title + '\n' + 'This task is overdue!';
    } else if (timeRemaining.isDueNow) {
      title = '⏰ Task Due Now!';
      body = task.title + '\n' + timeRemaining.text;
    }
    
    try {
      const notification = new Notification(title, {
        body: body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc2626"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc2626"><circle cx="12" cy="12" r="10"/></svg>',
        tag: taskKey,
        requireInteraction: true,
        silent: false
      });
      
      notification.onclick = function() {
        window.focus();
        notification.close();
        // Open notification panel
        notificationsPanelOpen = true;
        notificationPanel.style.display = 'block';
        renderNotifications();
      };
    } catch (err) {
      console.log('Notification error:', err);
    }
  }
  
  // Render notifications
  function renderNotifications() {
    const incompleteTasks = tasks.filter(function(t) { 
      return !t.done && t.due; 
    });
    
    if (incompleteTasks.length === 0) {
      notificationList.innerHTML = 
        '<div class="notification-empty">' +
          '<i class="fas fa-check-circle"></i>' +
          '<div style="font-weight:600;color:var(--text);margin-bottom:0.5rem">All caught up!</div>' +
          '<div>You have no upcoming task deadlines</div>' +
        '</div>';
      return;
    }
    
    // Sort by due date (earliest first)
    incompleteTasks.sort(function(a, b) {
      const dateA = new Date(a.due + (a.time ? ' ' + a.time : ''));
      const dateB = new Date(b.due + (b.time ? ' ' + b.time : ''));
      return dateA - dateB;
    });
    
    notificationList.innerHTML = '';
    
    incompleteTasks.forEach(function(task) {
      const timeRemaining = getTimeRemaining(task.due, task.time);
      const priority = getNotificationPriority(timeRemaining);
      const icon = getNotificationIcon(priority);
      
      let message = '';
      if (timeRemaining.overdue) {
        message = '<strong style="color:#dc2626">Task is overdue!</strong> Due date was ' + task.due + (task.time ? ' at ' + task.time : '');
      } else {
        message = timeRemaining.text + ' • Due ' + task.due + (task.time ? ' at ' + task.time : '');
      }
      
      const notificationItem = document.createElement('div');
      notificationItem.className = 'notification-item ' + priority;
      notificationItem.innerHTML = 
        '<div class="notification-content">' +
          '<div class="notification-icon">' +
            '<i class="fas ' + icon + '"></i>' +
          '</div>' +
          '<div class="notification-body">' +
            '<div class="notification-title">' + task.title + '</div>' +
            '<div class="notification-message">' + message + '</div>' +
            '<div class="notification-time">' +
              '<i class="fas fa-tag"></i> ' + task.priority + ' priority • ' + task.category +
            '</div>' +
          '</div>' +
        '</div>';
      
      // Click to view task details
      notificationItem.onclick = function() {
        alert('Task: ' + task.title + '\n' +
              'Priority: ' + task.priority + '\n' +
              'Category: ' + task.category + '\n' +
              'Due: ' + task.due + (task.time ? ' at ' + task.time : '') + '\n' +
              'Time remaining: ' + timeRemaining.text + '\n' +
              (task.note ? '\nNote: ' + task.note : ''));
      };
      
      notificationList.appendChild(notificationItem);
    });
  }
  
  // Check for tasks due soon and show popup
  function checkDueTasks() {
    const incompleteTasks = tasks.filter(function(t) { 
      return !t.done && t.due; 
    });
    
    incompleteTasks.forEach(function(task) {
      const timeRemaining = getTimeRemaining(task.due, task.time);
      if (timeRemaining && (timeRemaining.overdue || timeRemaining.isDueNow)) {
        showPopupNotification(task, timeRemaining);
      }
    });
  }
  
  // Update notification badge
  function updateNotificationBadge() {
    const now = new Date();
    const urgentTasks = tasks.filter(function(t) {
      if (!t.done && t.due) {
        const timeRemaining = getTimeRemaining(t.due, t.time);
        if (timeRemaining) {
          return timeRemaining.overdue || timeRemaining.days <= 3;
        }
      }
      return false;
    });
    
    const count = urgentTasks.length;
    if (count > 0) {
      notificationBadge.textContent = count;
      notificationBadge.style.display = 'block';
    } else {
      notificationBadge.style.display = 'none';
    }
  }
  
  // Initial update
  updateNotificationBadge();
  checkDueTasks();
  
  // Update every minute
  setInterval(function() {
    updateNotificationBadge();
    checkDueTasks();
  }, 60000);
  
  // Update badge when tasks change
  const originalRender = render;
  render = function() {
    originalRender();
    updateNotificationBadge();
  };
}

// Initialize notification system after page loads
if (typeof window !== 'undefined') {
  const originalOnload = window.onload;
  window.onload = function() {
    if (originalOnload) originalOnload();
    setTimeout(initNotificationSystem, 500);
  };
}
