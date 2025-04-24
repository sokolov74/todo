export function initWhatsApp() {
  const phoneInput = document.getElementById("text");
  if (!phoneInput) return;

  const clearButton = document.getElementById("clearButton");
  const chatButton = document.getElementById("button");

  clearButton.disabled = true;
  chatButton.disabled = true;

  phoneInput.focus();
  window.addEventListener("click", () => {
    if (document.activeElement !== phoneInput) phoneInput.focus();
  });

  phoneInput.addEventListener("input", formatPhoneInput);
  phoneInput.addEventListener("keydown", handlePhoneKeyDown);
  clearButton.addEventListener("click", clearPhoneInput);
  chatButton.addEventListener("click", openWhatsAppChat);
}

function formatPhoneInput() {
  const phoneNumber = this.value.replace(/\D/g, "");
  let formatted = "+7";

  if (phoneNumber.length > 1) formatted += ` ${phoneNumber.slice(1, 4)}`;
  if (phoneNumber.length > 4) formatted += ` ${phoneNumber.slice(4, 7)}`;
  if (phoneNumber.length > 7) formatted += `-${phoneNumber.slice(7, 9)}`;
  if (phoneNumber.length > 9) formatted += `-${phoneNumber.slice(9, 11)}`;

  this.value = formatted;
  const digits = phoneNumber.length;
  document.getElementById("button").disabled = digits !== 11;
  document.getElementById("clearButton").disabled = digits === 0;
}

function handlePhoneKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "м")) return;
  if (!/\d|Backspace|Delete|Arrow|Tab/.test(e.key)) e.preventDefault();
  if (e.key === "Backspace" && this.value === "+7") this.value = "";
  if (e.key === "Enter" && !document.getElementById("button").disabled) {
    document.getElementById("button").click();
  }
}

function clearPhoneInput() {
  document.getElementById("text").value = "";
  document.getElementById("button").disabled = true;
  this.disabled = true;
  document.getElementById("text").focus();
}

function openWhatsAppChat() {
  const phoneNumber = document.getElementById("text").value.replace(/\D/g, "");
  if (phoneNumber.length === 11) {
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
    document.getElementById("text").value = "";
    this.disabled = true;
    document.getElementById("clearButton").disabled = true;
  }
}
