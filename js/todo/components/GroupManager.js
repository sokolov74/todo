import { elements } from "../utils/dom.js";
import { saveData, loadData } from "../utils/storage.js";
import { showToast } from "../utils/helpers.js";

export class GroupManager {
  constructor(state, modal) {
    this.state = state;
    this.modal = modal;
  }

  loadGroups() {
    const groups = loadData("groups") || [];
    this.state.groups = groups;
    return groups;
  }

  addGroup(name) {
    if (!name.trim()) {
      showToast("Название группы не может быть пустым", "error");
      return false;
    }

    if (this.state.groups.includes(name)) {
      showToast("Группа с таким названием уже существует", "error");
      return false;
    }

    this.state.groups.push(name);
    saveData("groups", this.state.groups);
    showToast(`Группа "${name}" добавлена`);
    return true;
  }

  deleteGroup(groupName) {
    this.modal.confirmAction(
      `Удалить группу "${groupName}" и все её задачи?`,
      () => {
        this.state.groups = this.state.groups.filter((g) => g !== groupName);
        this.state.todos = this.state.todos.filter(
          (t) => t.group !== groupName
        );

        if (this.state.currentGroup === groupName) {
          this.state.currentGroup = this.state.groups[0] || "";
        }

        saveData("groups", this.state.groups);
        saveData("todos", this.state.todos);
        showToast(`Группа "${groupName}" удалена`);
      }
    );
    return true;
  }

  renameGroup(oldName, newName) {
    if (!newName.trim()) {
      showToast("Название группы не может быть пустым", "error");
      return false;
    }

    if (this.state.groups.includes(newName)) {
      showToast("Группа с таким названием уже существует", "error");
      return false;
    }

    const index = this.state.groups.indexOf(oldName);
    if (index === -1) return false;

    this.state.groups[index] = newName;
    this.state.todos.forEach((todo) => {
      if (todo.group === oldName) {
        todo.group = newName;
      }
    });

    if (this.state.currentGroup === oldName) {
      this.state.currentGroup = newName;
    }

    saveData("groups", this.state.groups);
    saveData("todos", this.state.todos);
    showToast(`Группа переименована в "${newName}"`);
    return true;
  }

  clearAllGroups() {
    this.modal.confirmAction("Удалить все группы и задачи?", () => {
      this.state.groups = [];
      this.state.todos = [];
      this.state.currentGroup = "";
      saveData("groups", []);
      saveData("todos", []);
      showToast("Все группы и задачи удалены");
    });
  }

  renderGroupSelector() {
    if (!elements.groupSelector) return;

    elements.groupSelector.innerHTML = this.state.groups
      .map((group) => `<option value="${group}">${group}</option>`)
      .join("");

    if (this.state.currentGroup) {
      elements.groupSelector.value = this.state.currentGroup;
    }
  }
}
