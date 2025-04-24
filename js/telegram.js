export function initTelegram() {
  const input = document.getElementById("telegramInput");
  if (!input) return;

  const clearButton = document.getElementById("clearButton");
  const telegramButton = document.getElementById("telegramButton");

  clearButton.disabled = true;
  telegramButton.disabled = true;

  input.focus();
  window.addEventListener("click", () => {
    if (document.activeElement !== input) input.focus();
  });

  input.addEventListener("input", validateTelegramInput);
  clearButton.addEventListener("click", clearTelegramInput);
  telegramButton.addEventListener("click", openTelegram);
}

function validateTelegramInput() {
  const value = this.value.trim();
  const clearButton = document.getElementById("clearButton");
  const telegramButton = document.getElementById("telegramButton");

  clearButton.disabled = value.length === 0;

  const isPhone = /^(\+7|8)[\d\s\-]{9,15}$/.test(value);
  const isUsername = /^@[a-zA-Z0-9_]{5,32}$/.test(value);

  telegramButton.disabled = !(isPhone || isUsername);
}

function clearTelegramInput() {
  document.getElementById("telegramInput").value = "";
  document.getElementById("telegramButton").disabled = true;
  this.disabled = true;
  document.getElementById("telegramInput").focus();
}

function openTelegram() {
  const value = document.getElementById("telegramInput").value.trim();
  let url;

  if (value.startsWith("@")) {
    url = `https://t.me/${value.substring(1)}`;
  } else {
    const phone = value.replace(/\D/g, "");
    url = `https://t.me/+${phone}`;
  }

  window.open(url, "_blank");
  document.getElementById("telegramInput").value = "";
  this.disabled = true;
  document.getElementById("clearButton").disabled = true;
}
