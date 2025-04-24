/**
 * Показывает уведомление пользователю
 * @param {string} message - текст сообщения
 * @param {string} type - тип сообщения ('success', 'error', 'info')
 */
export function showToast(message = "Список успешно добавлен!", type = "success") {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;

  // Устанавливаем цвет в зависимости от типа
  if (type === "error") {
    toast.style.backgroundColor = "#f44336";
  } else if (type === "info") {
    toast.style.backgroundColor = "#2196F3";
  } else {
    toast.style.backgroundColor = "#2bc031";
  }

  toast.textContent = message;
  toast.classList.remove("toast-hidden");
  toast.classList.add("toast-visible");

  // Автоматически скрываем через 3 секунды
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.classList.add("toast-hidden");
  }, 3000);
}

/**
 * Возвращает правильную форму слова в зависимости от числа
 * @param {number} number - число
 * @param {Array} words - массив форм слова [одна, две-четыре, пять и более]
 * @returns {string} - правильная форма слова
 */
export function getPluralForm(number, words) {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[Math.min(number % 10, 5)]
  ];
}

/**
 * Загружает список групп из localStorage
 * @returns {Array} - массив групп
 */
export function loadGroups() {
  try {
    const savedGroups = localStorage.getItem('todoGroups');
    return savedGroups ? JSON.parse(savedGroups) : []; // Возвращаем пустой массив вместо ["Основные"]
  } catch (e) {
    console.error('Error loading groups:', e);
    return []; // Возвращаем пустой массив при ошибке
  }
}