// menu.js

// Функция для загрузки страниц и управления навигацией
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-button, .app-link");
  const contentDiv = document.getElementById("content");
  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const navMenu = document.querySelector(".nav-menu");

  // Установка активной кнопки
  function setActiveButton(activeButton) {
    navButtons.forEach((button) => {
      button.classList.remove("active");
      button.style.backgroundColor = "";
    });
    if (activeButton) {
      activeButton.classList.add("active");
    }
  }

  // Загрузка страницы
  async function loadPage(page) {
    try {
      const response = await fetch(page);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.text();

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data;

      const appContainer = tempDiv.querySelector(".app-container");
      const versionDiv = tempDiv.querySelector(".version");

      if (appContainer) {
        contentDiv.innerHTML = "";
        contentDiv.appendChild(appContainer);
        if (versionDiv) {
          contentDiv.appendChild(versionDiv);
        }

        const scripts = tempDiv.querySelectorAll('script[type="module"]');
        scripts.forEach((script) => {
          const newScript = document.createElement("script");
          newScript.type = "module";
          newScript.src = script.src;
          document.body.appendChild(newScript);
        });

        // Устанавливаем активную кнопку
        const activeButton = document.querySelector(`[data-page="${page}"]`);
        setActiveButton(activeButton);

        // Закрываем мобильное меню после перехода
        navMenu.classList.remove("active");
        mobileMenuButton.classList.remove("active");
      }
    } catch (error) {
      console.error("Ошибка при загрузке страницы:", error);
    }
  }

  // Обработчики для кнопок навигации
  navButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const page = this.getAttribute("data-page");
      if (page) {
        loadPage(page);
      }
    });
  });

  // Обработчик для кнопки мобильного меню
  mobileMenuButton.addEventListener("click", function () {
    this.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Установка начального состояния
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const activeButton = document.querySelector(`[data-page="${currentPage}"]`);
  setActiveButton(activeButton || document.querySelector(".nav-button.mainn"));
}

// Добавляем стили для меню динамически
function addMenuStyles() {
  const style = document.createElement("style");
  style.textContent = `

    /* Мобильное меню */
    .mobile-menu-button {
      display: none;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: white;
      padding: 10px;
    }

    @media (max-width: 768px) {
      .mobile-menu-button {
        display: block;
      }
      
  `;
  document.head.appendChild(style);
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  addMenuStyles();
  setupNavigation();
});
