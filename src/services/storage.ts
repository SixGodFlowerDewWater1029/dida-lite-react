import { Todo } from '../types/todo';
import { load } from '@tauri-apps/plugin-store';
import dayjs from 'dayjs';

const STORAGE_KEY = 'dida_lite_todos';
const VERSION = '1.0.0';

let store: Store;

const initStore = async () => {
  store = await load('store.json', { autoSave: false });
};

type SerializedTodo = Omit<Todo, 'date' | 'time'> & {
  date: string | null;
  time: string | null;
};

type SerializedStorageData = {
  version: string;
  todos: SerializedTodo[];
};

export const StorageService = {
  init: async () => {
    await initStore();
  },

  saveTodos: async (todos: Todo[]): Promise<void> => {
    try {
      const serializedData: SerializedStorageData = {
        version: VERSION,
        todos: todos.map(todo => ({
          id: todo.id,
          content: todo.content,
          date: todo.date?.toISOString() || null,
          time: todo.time?.format('HH:mm') || null,
          reminder: todo.reminder,
          repeat: todo.repeat
        }))
      };
      await store.set(`${STORAGE_KEY}.version`, VERSION);
      await store.set(`${STORAGE_KEY}.todos`, serializedData.todos);
      await store.save();
    } catch (error) {
      console.error('保存待办事项失败:', error);
    }
  },

  loadTodos: async (): Promise<Todo[]> => {
    try {
      const data = await store.get<SerializedStorageData>(STORAGE_KEY);
      if (!data) return [];

      // 数据版本检查和迁移逻辑可以在这里添加
      if (data.version !== VERSION) {
        console.warn('数据版本不匹配，可能需要迁移');
      }

      return data.todos.map(todo => ({
        ...todo,
        date: todo.date ? new Date(todo.date) : null,
        time: todo.time ? dayjs(todo.time, 'HH:mm') : null
      }));
    } catch (error) {
      console.error('加载待办事项失败:', error);
      return [];
    }
  }
};