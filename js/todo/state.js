import { loadTodos, loadGroups, saveData } from "./utils.js";
import { initEventListeners } from "./services/eventService.js"; // Исправленный путь
import { updateInputState, renderAll } from "./app.js"; // Исправленный путь
import { elements } from "./utils/dom.js"; // Исправленный путь

export function initTodoList() {
  if (!document.getElementById("todo-input")) return;

  const todos = loadTodos();
  const groups = loadGroups();

  const state = {
    todos,
    groups,
    currentFilter: null,
    currentGroup: groups.length > 0 ? groups[0] : "",
    filterInCurrentGroupOnly: false,
    lastId: todos.reduce((max, todo) => Math.max(max, todo.id), 0),
  };

  initEventListeners(state);
  updateInputState(state);
  renderAll(state);

  return state;
}
