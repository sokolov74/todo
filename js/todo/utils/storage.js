export const loadData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return null;
  }
};

const debounce = (func, timeout = 500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
    if (e.name === "QuotaExceededError") {
      alert("Превышен лимит хранилища. Старые данные будут очищены.");
      localStorage.clear();
    }
    return false;
  }
};

export const debouncedSave = debounce(saveData);
