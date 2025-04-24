import { elements } from "../utils/dom.js";
import { showToast } from "../utils/helpers.js";

export class EventService {
  constructor(state, groupManager, todoList, renderService) {
    this.state = state;
    this.groupManager = groupManager;
    this.todoList = todoList;
    this.renderService = renderService;
  }

  initEventListeners() {
    this.initTodoEvents();
    this.initGroupEvents();
    this.initFilterEvents();
    this.initClearEvents();
    this.initImportEvents();
  }

  initTodoEvents() {
    // Добавление задачи
    elements.addBtn.addEventListener("click", () => {
      const text = elements.todoInput.value.trim();
      if (this.todoList.addTodo(text)) {
        elements.todoInput.value = "";
        this.renderService.renderAll();
      }
    });

    elements.todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && this.state.currentGroup) {
        const text = elements.todoInput.value.trim();
        if (this.todoList.addTodo(text)) {
          elements.todoInput.value = "";
          this.renderService.renderAll();
        }
      }
    });

    elements.todoInput.addEventListener("paste", (e) => this.handlePaste(e));
  }

  initGroupEvents() {
    // Добавление группы
    elements.addGroupBtn.addEventListener("click", () => {
      const name = elements.groupNameInput.value.trim();
      if (this.groupManager.addGroup(name)) {
        elements.groupNameInput.value = "";
        this.renderService.renderAll();
      }
    });

    elements.groupNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const name = elements.groupNameInput.value.trim();
        if (this.groupManager.addGroup(name)) {
          elements.groupNameInput.value = "";
          this.renderService.renderAll();
        }
      }
    });

    // Выбор группы
    elements.groupSelector.addEventListener("change", (e) => {
      this.state.currentGroup = e.target.value;
      this.renderService.updateUIState();
      this.renderService.renderAll();
    });

    // Делегирование событий для групп
    elements.groupsContainer.addEventListener("click", (e) => {
      const groupTitle = e.target.closest(".group-title");
      if (groupTitle) {
        const group = groupTitle.closest(".group").dataset.group;
        this.state.currentGroup = group;
        elements.groupSelector.value = group;
        this.renderService.updateUIState();
        this.renderService.renderAll();
      }
    });
  }

  initFilterEvents() {
    // Фильтры
    elements.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.target.dataset.filter;
        this.state.currentFilter =
          this.state.currentFilter === filter ? null : filter;
        this.renderService.renderAll();
      });
    });

    elements.filterInCurrentGroup.addEventListener("change", (e) => {
      this.state.filterInCurrentGroupOnly = e.target.checked;
      this.renderService.renderAll();
    });
  }

  initClearEvents() {
    // Очистка
    elements.clearCompletedBtn.addEventListener("click", () => {
      this.todoList.clearCompleted();
      this.renderService.renderAll();
    });

    elements.clearAllBtn.addEventListener("click", () => {
      this.todoList.clearAllTodos();
      this.renderService.renderAll();
    });

    elements.clearAllGroupsBtn.addEventListener("click", () => {
      this.groupManager.clearAllGroups();
      this.renderService.renderAll();
    });

    elements.clearCacheBtn.addEventListener("click", () => {
      if (confirm("Очистить все данные приложения?")) {
        localStorage.clear();
        this.state.todos = [];
        this.state.groups = [];
        this.state.currentGroup = "";
        this.todoList.lastId = 0;
        showToast("Все данные очищены");
        this.renderService.renderAll();
      }
    });
  }

  initImportEvents() {
    // Импорт из Word
    elements.importWordBtn.addEventListener("click", () => {
      elements.wordFileInput.click();
    });

    elements.wordFileInput.addEventListener("change", (e) => {
      this.handleWordImport(e);
    });
  }

  handlePaste(e) {
    if (!this.state.currentGroup) {
      e.preventDefault();
      showToast("Сначала выберите группу");
      return;
    }

    try {
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const pastedText = clipboardData.getData("text");
      const items = pastedText
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      if (items.length > 1) {
        e.preventDefault();

        items.forEach((item) => {
          this.todoList.addTodo(item);
        });

        this.renderService.renderAll();
        showToast(`Добавлено ${items.length} задач`);
      }
    } catch (error) {
      console.error("Ошибка обработки вставки:", error);
      showToast("Ошибка при добавлении списка задач", "error");
    }
  }

 async handleWordImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const wordImport = await import("../wordImport.js");
    const structure = await parseWordDocument(file);
    const stats = importTasksFromStructure(
      structure,
      this.state,
      () => saveData("todos", this.state.todos),
      () => this.renderService.renderAll(),
      () => ++this.todoList.lastId
    );
    showImportResult(stats);
  } catch (error) {
    console.error("Ошибка при импорте из Word:", error);
    showToast("Ошибка при импорте файла", "error");
  } finally {
    e.target.value = "";
  }
}
}
