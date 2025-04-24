import { saveData, loadData } from "../utils/storage.js";
import { showToast, getPluralForm } from "../utils/helpers.js";
import { elements } from "../utils/dom.js";

export class TodoList {
  constructor(state, modal) {
    this.state = state;
    this.modal = modal;
    this.lastId = this.state.todos.reduce(
      (max, todo) => Math.max(max, todo?.id || 0),
      0
    );
  }

  loadTodos() {
    const todos = loadData("todos") || [];
    this.state.todos = todos.map((todo) => ({
      id: todo.id || ++this.lastId,
      text: todo.text || "",
      completed: !!todo.completed,
      group: todo.group || "",
    }));
    return this.state.todos;
  }

  addTodo(text, group = this.state.currentGroup) {
    if (!text.trim()) {
      showToast("Введите текст задачи", "error");
      return false;
    }

    if (!group) {
      showToast("Выберите группу для задачи", "error");
      return false;
    }

    const newTodo = {
      id: ++this.lastId,
      text: text.trim(),
      completed: false,
      group,
    };

    this.state.todos.unshift(newTodo);
    saveData("todos", this.state.todos);
    showToast(`Задача добавлена в группу "${group}"`);
    return true;
  }

  deleteTodo(id) {
    const todo = this.state.todos.find((t) => t.id === id);
    if (!todo) return false;

    this.modal.confirmAction(`Удалить задачу "${todo.text}"?`, () => {
      this.state.todos = this.state.todos.filter((t) => t.id !== id);
      saveData("todos", this.state.todos);
      showToast("Задача удалена");
    });
    return true;
  }

  updateTodo(id, newText) {
    const todo = this.state.todos.find((t) => t.id === id);
    if (!todo || !newText.trim()) return false;

    const oldText = todo.text;
    todo.text = newText.trim();
    saveData("todos", this.state.todos);
    showToast(`Задача изменена с "${oldText}" на "${newText}"`);
    return true;
  }

  toggleTodo(id) {
    const todo = this.state.todos.find((t) => t.id === id);
    if (!todo) return false;

    todo.completed = !todo.completed;
    saveData("todos", this.state.todos);
    return true;
  }

  clearCompleted() {
    const completedCount = this.state.todos.filter((t) => t.completed).length;
    if (completedCount === 0) {
      showToast("Нет выполненных задач для удаления", "info");
      return;
    }

    this.modal.confirmAction(
      `Удалить ${completedCount} выполненных задач?`,
      () => {
        this.state.todos = this.state.todos.filter((t) => !t.completed);
        saveData("todos", this.state.todos);
        showToast("Выполненные задачи удалены");
      }
    );
  }

  clearAllTodos() {
    if (this.state.todos.length === 0) {
      showToast("Нет задач для удаления", "info");
      return;
    }

    this.modal.confirmAction(
      `Удалить все ${this.state.todos.length} задач?`,
      () => {
        this.state.todos = [];
        saveData("todos", this.state.todos);
        showToast("Все задачи удалены");
      }
    );
  }

  filterTodos() {
    return this.state.todos.filter((todo) => {
      const statusMatch =
        !this.state.currentFilter ||
        (this.state.currentFilter === "active" && !todo.completed) ||
        (this.state.currentFilter === "completed" && todo.completed);

      const groupMatch =
        !this.state.filterInCurrentGroupOnly ||
        todo.group === this.state.currentGroup;

      return statusMatch && groupMatch;
    });
  }

  renderTodos() {
    const filteredTodos = this.filterTodos();

    if (this.state.groups.length === 0) {
      elements.groupsContainer.innerHTML = "";
      return;
    }

    elements.groupsContainer.innerHTML = this.state.groups
      .filter(
        (group) =>
          !this.state.filterInCurrentGroupOnly ||
          group === this.state.currentGroup
      )
      .map((group) => {
        const groupTodos = filteredTodos.filter((t) => t.group === group);
        let taskCounter = 1;

        return `
          <div class="group" data-group="${group}">
            <div class="group-header">
              <h3 class="group-title">${group}</h3>
              <div class="group-actions">
                <button class="group-btn add-task-to-group-btn" data-group="${group}" title="Добавить задачу">
                  <i class="fas fa-plus"></i>
                </button>
                <button class="group-btn rename-group-btn" data-group="${group}" title="Переименовать группу">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="group-btn delete-group-btn" data-group="${group}" title="Удалить группу">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <ul class="todo-list">
              ${
                groupTodos.length
                  ? groupTodos
                      .map((todo) => {
                        const todoHtml = this.renderTodoItem(
                          todo,
                          taskCounter.toString().padStart(2, "0")
                        );
                        taskCounter++;
                        return todoHtml;
                      })
                      .join("")
                  : '<li class="no-tasks">Нет задач</li>'
              }
            </ul>
          </div>
        `;
      })
      .join("");
  }

  renderTodoItem(todo, number) {
    return `
      <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${
      todo.id
    }">
        <input type="checkbox" class="todo-checkbox" ${
          todo.completed ? "checked" : ""
        }>
        <span class="todo-text">${number}. ${todo.text}</span>
        <button class="edit-btn" title="Редактировать"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" title="Удалить"><i class="fas fa-trash"></i></button>
      </li>
    `;
  }

  updateCounters() {
    const activeCount = this.state.todos.filter((t) => !t.completed).length;
    const completedCount = this.state.todos.filter((t) => t.completed).length;

    if (elements.itemsLeftSpan) {
      elements.itemsLeftSpan.textContent = `${activeCount} ${getPluralForm(
        activeCount,
        ["задача", "задачи", "задач"]
      )} осталось`;
    }

    if (elements.itemsCompletedSpan) {
      elements.itemsCompletedSpan.textContent = `${completedCount} ${getPluralForm(
        completedCount,
        ["задача", "задачи", "задач"]
      )} выполнено`;
    }

    if (elements.clearCompletedBtn) {
      elements.clearCompletedBtn.style.display =
        completedCount > 0 ? "block" : "none";
    }

    if (elements.clearAllBtn) {
      elements.clearAllBtn.style.display =
        this.state.todos.length > 0 ? "block" : "none";
    }
  }
}
