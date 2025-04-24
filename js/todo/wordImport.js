import { showToast, getPluralForm } from "./utils/helpers.js";

/**
 * Парсит DOCX-файл и извлекает структуру заголовков и текстовых абзацев
 * @param {File} file - DOCX-файл для обработки
 * @returns {Promise<Object>} - объект с группами и задачами
 */
export async function parseWordDocument(file) {
  try {
    // Читаем файл как ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Используем библиотеку mammoth для преобразования Word в HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Создаем временный DOM для удобного разбора HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Извлекаем структуру из документа
    const structure = extractStructure(doc);

    return structure;
  } catch (error) {
    console.error("Ошибка при парсинге Word-документа:", error);
    showToast("Ошибка при обработке файла", "error");
    throw error;
  }
}

/**
 * Извлекает структуру заголовков и текста из HTML-документа
 * @param {Document} doc - HTML DOM документ
 * @returns {Object} - объект со структурой групп и задач
 */
function extractStructure(doc) {
  const result = {
    groups: {},
    defaultGroup: "Импортированные задачи",
  };

  // Получаем все элементы из документа
  const elements = doc.body.querySelectorAll("*");

  let currentGroup = result.defaultGroup;
  result.groups[currentGroup] = [];

  // Обходим элементы и определяем структуру
  elements.forEach((element) => {
    // Проверяем, является ли элемент заголовком (h1-h6)
    const isHeading = /^h[1-6]$/i.test(element.tagName);

    if (isHeading) {
      // Заголовок - это группа
      currentGroup = element.textContent.trim();
      if (currentGroup === "") {
        currentGroup = `Группа ${Object.keys(result.groups).length + 1}`;
      }

      // Создаем новую группу, если её еще нет
      if (!result.groups[currentGroup]) {
        result.groups[currentGroup] = [];
      }
    } else if (element.tagName === "P" && element.textContent.trim() !== "") {
      // Параграф - это задача
      const text = element.textContent.trim();
      if (text) {
        result.groups[currentGroup].push(text);
      }
    }
  });

  // Удаляем пустые группы
  Object.keys(result.groups).forEach((group) => {
    if (result.groups[group].length === 0) {
      delete result.groups[group];
    }
  });

  // Если нет групп или задач, создаем пустую группу
  if (Object.keys(result.groups).length === 0) {
    result.groups[result.defaultGroup] = [];
  }

  return result;
}

/**
 * Импортирует задачи из структуры в существующее состояние приложения
 * @param {Object} structure - структура, полученная из parseWordDocument
 * @param {Object} state - состояние приложения
 * @param {Function} saveData - функция для сохранения данных
 * @param {Function} renderAll - функция для обновления отображения
 * @param {Function} updateLastId - функция для обновления последнего ID
 * @returns {Object} - статистика импорта
 */
export function importTasksFromStructure(
  structure,
  state,
  saveData,
  renderAll,
  updateLastId
) {
  let stats = {
    addedGroups: 0,
    addedTasks: 0,
    errors: 0,
  };

  try {
    // Проходим по каждой группе
    Object.keys(structure.groups).forEach((groupName) => {
      // Проверяем, существует ли группа
      if (!state.groups.includes(groupName)) {
        state.groups.push(groupName);
        stats.addedGroups++;
      }

      // Добавляем задачи из группы
      const tasks = structure.groups[groupName];
      if (tasks && tasks.length) {
        const newTodos = tasks.map((text) => ({
          id: updateLastId(),
          text: text,
          completed: false,
          group: groupName,
        }));

        state.todos.unshift(...newTodos);
        stats.addedTasks += newTodos.length;
      }
    });

    // Сохраняем изменения и обновляем отображение
    saveData();
    renderAll();

    return stats;
  } catch (error) {
    console.error("Ошибка при импорте задач:", error);
    stats.errors++;
    return stats;
  }
}

/**
 * Показывает результат импорта пользователю
 * @param {Object} stats - статистика импорта
 */
export function showImportResult(stats) {
  let message = "";

  if (stats.errors > 0) {
    message = `Ошибка при импорте. Проверьте консоль для деталей.`;
    showToast(message, "error");
  } else {
    const groupsText = getPluralForm(stats.addedGroups, [
      "группа",
      "группы",
      "групп",
    ]);
    const tasksText = getPluralForm(stats.addedTasks, [
      "задача",
      "задачи",
      "задач",
    ]);

    message = `Импорт завершен: добавлено ${stats.addedGroups} ${groupsText} и ${stats.addedTasks} ${tasksText}`;
    showToast(message);
  }
}

/**
 * Возвращает правильную форму слова в зависимости от числа
 * @param {number} number - число
 * @param {Array} words - массив форм слова [одна, две-четыре, пять и более]
 * @returns {string} - правильная форма слова
 */
