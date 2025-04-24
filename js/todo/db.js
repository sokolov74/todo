// Модуль для работы с базой данных PostgreSQL
import { Pool } from "pg";

// Инициализация соединения с базой данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Инициализация таблиц в базе данных
export async function initTables() {
  try {
    // Создаем таблицу для групп
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todo_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаем таблицу для задач
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT false,
        group_id INTEGER REFERENCES todo_groups(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Таблицы успешно инициализированы");
    return true;
  } catch (error) {
    console.error("Ошибка при инициализации таблиц:", error);
    return false;
  }
}

// Получение всех групп из БД
export async function getGroups() {
  try {
    const result = await pool.query("SELECT * FROM todo_groups ORDER BY id");
    return result.rows.map((row) => row.name);
  } catch (error) {
    console.error("Ошибка при получении групп:", error);
    return [];
  }
}

// Добавление новой группы
export async function addGroup(name) {
  try {
    const result = await pool.query(
      "INSERT INTO todo_groups (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Ошибка при добавлении группы:", error);
    return null;
  }
}

// Переименование группы
export async function renameGroup(oldName, newName) {
  try {
    const result = await pool.query(
      "UPDATE todo_groups SET name = $1 WHERE name = $2 RETURNING *",
      [newName, oldName]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Ошибка при переименовании группы:", error);
    return null;
  }
}

// Удаление группы
export async function deleteGroup(name) {
  try {
    // Найдем id группы
    const groupResult = await pool.query(
      "SELECT id FROM todo_groups WHERE name = $1",
      [name]
    );

    if (groupResult.rows.length === 0) {
      return false;
    }

    const groupId = groupResult.rows[0].id;

    // Удаляем все задачи группы
    await pool.query("DELETE FROM todos WHERE group_id = $1", [groupId]);

    // Удаляем саму группу
    const result = await pool.query(
      "DELETE FROM todo_groups WHERE name = $1 RETURNING *",
      [name]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Ошибка при удалении группы:", error);
    return false;
  }
}

// Получение всех задач из БД
export async function getTodos() {
  try {
    const result = await pool.query(`
      SELECT t.id, t.text, t.completed, g.name as group
      FROM todos t
      JOIN todo_groups g ON t.group_id = g.id
      ORDER BY t.id DESC
    `);

    return result.rows;
  } catch (error) {
    console.error("Ошибка при получении задач:", error);
    return [];
  }
}

// Добавление новой задачи
export async function addTodo(text, groupName) {
  try {
    // Найдем id группы
    const groupResult = await pool.query(
      "SELECT id FROM todo_groups WHERE name = $1",
      [groupName]
    );

    if (groupResult.rows.length === 0) {
      return null;
    }

    const groupId = groupResult.rows[0].id;

    // Добавляем задачу
    const result = await pool.query(
      "INSERT INTO todos (text, group_id) VALUES ($1, $2) RETURNING id, text, completed",
      [text, groupId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      ...result.rows[0],
      group: groupName,
    };
  } catch (error) {
    console.error("Ошибка при добавлении задачи:", error);
    return null;
  }
}

// Обновление статуса задачи
export async function updateTodoStatus(id, completed) {
  try {
    const result = await pool.query(
      "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING id, text, completed",
      [completed, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Получим имя группы
    const groupResult = await pool.query(
      `
      SELECT g.name as group
      FROM todos t
      JOIN todo_groups g ON t.group_id = g.id
      WHERE t.id = $1
    `,
      [id]
    );

    return {
      ...result.rows[0],
      group: groupResult.rows[0].group,
    };
  } catch (error) {
    console.error("Ошибка при обновлении статуса задачи:", error);
    return null;
  }
}

// Обновление текста задачи
export async function updateTodoText(id, text) {
  try {
    const result = await pool.query(
      "UPDATE todos SET text = $1 WHERE id = $2 RETURNING id, text, completed",
      [text, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Получим имя группы
    const groupResult = await pool.query(
      `
      SELECT g.name as group
      FROM todos t
      JOIN todo_groups g ON t.group_id = g.id
      WHERE t.id = $1
    `,
      [id]
    );

    return {
      ...result.rows[0],
      group: groupResult.rows[0].group,
    };
  } catch (error) {
    console.error("Ошибка при обновлении текста задачи:", error);
    return null;
  }
}

// Удаление задачи
export async function deleteTodo(id) {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Ошибка при удалении задачи:", error);
    return false;
  }
}

// Удаление выполненных задач
export async function clearCompleted() {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE completed = true RETURNING *"
    );

    return result.rowCount;
  } catch (error) {
    console.error("Ошибка при удалении выполненных задач:", error);
    return 0;
  }
}

// Удаление всех задач
export async function clearAllTodos() {
  try {
    const result = await pool.query("DELETE FROM todos RETURNING *");
    return result.rowCount;
  } catch (error) {
    console.error("Ошибка при удалении всех задач:", error);
    return 0;
  }
}

// Удаление всех групп и задач
export async function clearAll() {
  try {
    await pool.query("DELETE FROM todos");
    const result = await pool.query("DELETE FROM todo_groups RETURNING *");
    return result.rowCount;
  } catch (error) {
    console.error("Ошибка при удалении всех данных:", error);
    return 0;
  }
}

// Добавление нескольких задач сразу (для вставки списка)
export async function addMultipleTodos(todos, groupName) {
  try {
    // Найдем id группы
    const groupResult = await pool.query(
      "SELECT id FROM todo_groups WHERE name = $1",
      [groupName]
    );

    if (groupResult.rows.length === 0) {
      return [];
    }

    const groupId = groupResult.rows[0].id;

    // Начинаем транзакцию
    await pool.query("BEGIN");

    const addedTodos = [];

    for (const todoText of todos) {
      const result = await pool.query(
        "INSERT INTO todos (text, group_id) VALUES ($1, $2) RETURNING id, text, completed",
        [todoText, groupId]
      );

      if (result.rows.length > 0) {
        addedTodos.push({
          ...result.rows[0],
          group: groupName,
        });
      }
    }

    // Завершаем транзакцию
    await pool.query("COMMIT");

    return addedTodos;
  } catch (error) {
    // Отменяем транзакцию в случае ошибки
    await pool.query("ROLLBACK");
    console.error("Ошибка при добавлении нескольких задач:", error);
    return [];
  }
}

// Проверка соединения с базой данных
export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Соединение с базой данных успешно:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("Ошибка соединения с базой данных:", error);
    return false;
  }
}
