// TodoList Class for managing state and operations
class TodoList {
  constructor() {
    this.todos = this.loadFromStorage();
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
    this.updateTaskCount();
  }

  bindEvents() {
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearBtn = document.getElementById('clearCompleted');

    // Add new todo
    addBtn.addEventListener('click', () => this.addTodo());
    todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTodo();
      }
    });

    // Todo list interactions
    todoList.addEventListener('click', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;

      const todoId = parseInt(todoItem.dataset.id);

      if (e.target.classList.contains('todo-checkbox')) {
        this.toggleTodo(todoId);
      } else if (e.target.classList.contains('delete-btn')) {
        this.deleteTodo(todoId);
      }
    });

    // Filter buttons
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.setFilter(filter);
      });
    });

    // Clear completed
    clearBtn.addEventListener('click', () => this.clearCompleted());
  }

  addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text === '') return;

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    this.saveToStorage();
    this.render();
    this.updateTaskCount();

    input.value = '';
    input.focus();
  }

  toggleTodo(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveToStorage();
      this.render();
      this.updateTaskCount();
    }
  }

  deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    
    if (todoElement) {
      todoElement.classList.add('removing');
      
      setTimeout(() => {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
        this.updateTaskCount();
      }, 300);
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    this.render();
  }

  clearCompleted() {
    const completedTodos = this.todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) return;

    // Add removing animation to completed todos
    completedTodos.forEach(todo => {
      const element = document.querySelector(`[data-id="${todo.id}"]`);
      if (element) {
        element.classList.add('removing');
      }
    });

    setTimeout(() => {
      this.todos = this.todos.filter(todo => !todo.completed);
      this.saveToStorage();
      this.render();
      this.updateTaskCount();
    }, 300);
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  }

  render() {
    const todoList = document.getElementById('todoList');
    const filteredTodos = this.getFilteredTodos();

    if (filteredTodos.length === 0) {
      todoList.innerHTML = this.getEmptyState();
      return;
    }

    todoList.innerHTML = filteredTodos
      .map(todo => this.createTodoElement(todo))
      .join('');
  }

  createTodoElement(todo) {
    return `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"></div>
        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
        <button class="delete-btn" title="Delete task">×</button>
      </li>
    `;
  }

  getEmptyState() {
    const messages = {
      all: {
        icon: '📝',
        text: 'No tasks yet',
        subtext: 'Add your first task above to get started!'
      },
      active: {
        icon: '✅',
        text: 'All tasks completed!',
        subtext: 'Great job! You\'ve finished everything.'
      },
      completed: {
        icon: '🎯',
        text: 'No completed tasks',
        subtext: 'Complete some tasks to see them here.'
      }
    };

    const message = messages[this.currentFilter];

    return `
      <div class="empty-state">
        <div class="empty-state-icon">${message.icon}</div>
        <div class="empty-state-text">${message.text}</div>
        <div class="empty-state-subtext">${message.subtext}</div>
      </div>
    `;
  }

  updateTaskCount() {
    const activeTasks = this.todos.filter(todo => !todo.completed).length;
    const taskCountElement = document.getElementById('taskCount');
    const clearBtn = document.getElementById('clearCompleted');
    const completedTasks = this.todos.filter(todo => todo.completed).length;

    taskCountElement.textContent = activeTasks;
    
    // Update task count text
    const taskCountContainer = taskCountElement.parentElement;
    taskCountContainer.innerHTML = `<span id="taskCount">${activeTasks}</span> ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;

    // Enable/disable clear completed button
    clearBtn.disabled = completedTasks === 0;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  saveToStorage() {
    localStorage.setItem('todoList', JSON.stringify(this.todos));
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('todoList');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading todos from storage:', error);
      return [];
    }
  }
}

// Initialize the todo list when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoList();
});

// Add some sample todos for demonstration (only if no todos exist)
document.addEventListener('DOMContentLoaded', () => {
  const hasExistingTodos = localStorage.getItem('todoList');
  
  if (!hasExistingTodos) {
    // Add some sample todos after a brief delay
    setTimeout(() => {
      const todoList = new TodoList();
      const sampleTodos = [
        { id: 1, text: 'Welcome to TaskFlow! 👋', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Try adding your own tasks', completed: false, createdAt: new Date().toISOString() },
        { id: 3, text: 'Click the circle to mark as complete', completed: true, createdAt: new Date().toISOString() }
      ];
      
      todoList.todos = sampleTodos;
      todoList.saveToStorage();
      todoList.render();
      todoList.updateTaskCount();
    }, 500);
  }
});