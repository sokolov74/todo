export class Modal {
  constructor() {
    this.injectStyles();
  }

  /**
   * Внедряет стили для модального окна
   */
  injectStyles() {
    if (document.getElementById("modal-styles")) return;

    const style = document.createElement("style");
    style.id = "modal-styles";
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 1;
        transition: opacity 0.3s ease;
      }
      
      .modal-overlay.closing {
        opacity: 0;
      }
      
      .modal {
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        transform: translateY(0);
        transition: transform 0.3s ease;
      }
      
      .modal-overlay.closing .modal {
        transform: translateY(-20px);
      }
      
      .modal-content h3 {
        margin-top: 0;
        color: #333;
        font-size: 1.3rem;
      }
      
      .modal-content p {
        margin: 15px 0;
        color: #555;
        line-height: 1.5;
      }
      
      .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 25px;
      }
      
      .modal-buttons button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
      }
      
      .confirm-btn {
        background-color: #4CAF50;
        color: white;
      }
      
      .confirm-btn:hover {
        background-color: #45a049;
      }
      
      .cancel-btn {
        background-color: #f1f1f1;
        color: #333;
      }
      
      .cancel-btn:hover {
        background-color: #e0e0e0;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Показывает модальное окно с подтверждением действия
   * @param {string} message - Сообщение для подтверждения
   * @param {Function} action - Функция, выполняемая при подтверждении
   * @param {Object} [options] - Дополнительные параметры
   * @param {string} [options.title="Подтверждение действия"] - Заголовок модального окна
   * @param {string} [options.confirmText="Подтвердить"] - Текст кнопки подтверждения
   * @param {string} [options.cancelText="Отмена"] - Текст кнопки отмены
   */
  confirmAction(message, action, options = {}) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-content">
          <h3>${options.title || "Подтверждение действия"}</h3>
          <p>${message}</p>
          <div class="modal-buttons">
            <button class="cancel-btn">${
              options.cancelText || "Отмена"
            }</button>
            <button class="confirm-btn">${
              options.confirmText || "Подтвердить"
            }</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    const confirmBtn = modal.querySelector(".confirm-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");

    const closeModal = () => {
      modal.classList.add("closing");
      setTimeout(() => {
        document.body.removeChild(modal);
        document.body.style.overflow = "";
      }, 300);
    };

    const handleConfirm = () => {
      try {
        if (typeof action === "function") {
          action();
        }
      } catch (error) {
        console.error("Ошибка при выполнении действия:", error);
      } finally {
        closeModal();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "Enter") {
        handleConfirm();
      }
    };

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    document.addEventListener("keydown", handleKeyDown);

    // Автофокус на кнопке отмены для лучшей UX
    cancelBtn.focus();
  }

  /**
   * Показывает информационное модальное окно
   * @param {string} message - Информационное сообщение
   * @param {Object} [options] - Дополнительные параметры
   * @param {string} [options.title="Информация"] - Заголовок модального окна
   * @param {string} [options.buttonText="OK"] - Текст кнопки
   */
  showInfo(message, options = {}) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-content">
          <h3>${options.title || "Информация"}</h3>
          <p>${message}</p>
          <div class="modal-buttons">
            <button class="confirm-btn">${options.buttonText || "OK"}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    const confirmBtn = modal.querySelector(".confirm-btn");

    const closeModal = () => {
      modal.classList.add("closing");
      setTimeout(() => {
        document.body.removeChild(modal);
        document.body.style.overflow = "";
      }, 300);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        closeModal();
      }
    };

    confirmBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", handleKeyDown);

    // Автофокус на кнопке подтверждения
    confirmBtn.focus();
  }
}
