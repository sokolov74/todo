import { GroupManager } from "./components/GroupManager.js";
import { TodoList } from "./components/TodoList.js";
import { RenderService } from "./services/renderService.js";
import { EventService } from "./services/eventService.js";
import { UIService } from "./services/uiService.js";
import { Modal } from "./components/Modal.js";
import { elements } from "./utils/dom.js";
import { showToast } from "./utils/helpers.js";
import { saveData, loadData } from "./utils/storage.js";
import { wordImport } from "./wordImport.js";

// Инициализация приложения
document.addEventListener("DOMContentLoaded", () => {
  try {
    // 1. Проверка инициализации меню
    if (typeof initMenu === "function") {
      initMenu();
    } else {
      console.warn("Menu initialization function not found");
    }

    // 2. Состояние приложения
    const state = {
      todos: [],
      groups: [],
      currentGroup: "",
      currentFilter: null,
      filterInCurrentGroupOnly: false,
    };

    // 3. Инициализация сервисов
    const modal = new Modal();
    if (!modal) {
      throw new Error("Modal initialization failed");
    }

    const groupManager = new GroupManager(state, modal);
    const todoList = new TodoList(state, modal);
    const renderService = new RenderService(state, groupManager, todoList);
    const eventService = new EventService(
      state,
      groupManager,
      todoList,
      renderService
    );
    const uiService = new UIService();

    // 4. Загрузка данных с проверкой
    const loadedTodos = todoList.loadTodos();
    const loadedGroups = groupManager.loadGroups();

    if (Array.isArray(loadedTodos)) {
      state.todos = loadedTodos;
    } else {
      console.error("Failed to load todos, using empty array");
      state.todos = [];
    }

    if (Array.isArray(loadedGroups)) {
      state.groups = loadedGroups;
    } else {
      console.error("Failed to load groups, using empty array");
      state.groups = [];
    }

    // 5. Инициализация UI с проверкой элементов
    if (typeof uiService.initUI === "function") {
      uiService.initUI();
    } else {
      console.warn("UIService.initUI is not a function");
    }

    // 6. Проверка перед рендерингом
    if (typeof renderService.renderAll === "function") {
      renderService.renderAll();
    } else {
      console.error("renderAll method not available");
    }

    // 7. Инициализация событий
    if (typeof eventService.initEventListeners === "function") {
      eventService.initEventListeners();
    } else {
      console.error("initEventListeners method not available");
    }
  } catch (error) {
    console.error("Application initialization error:", error);
    showToast("Произошла ошибка при загрузке приложения", "error");

    // Попытка восстановления
    if (
      typeof renderService !== "undefined" &&
      typeof renderService.renderAll === "function"
    ) {
      renderService.renderAll();
    }
  }
});
