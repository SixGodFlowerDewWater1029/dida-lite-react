import { Todo } from '../types/todo';
import { load } from '@tauri-apps/plugin-store';
import dayjs from 'dayjs';

const STORAGE_KEY = 'dida_lite_todos';
const VERSION = '1.0.0';

let store: any;

const initStore = async () => {
  store = await load('store.json', { autoSave: false });
};

type SerializedTodo = Omit<Todo, 'date' | 'time'> & {
  date: string | null;
  time: string | null;
};

export const StorageService = {
  init: async () => {
    await initStore();
  },

  saveTodos: async (todos: Todo[]): Promise<void> => {
    try {
      const serializedTodos = todos.map(todo => ({
        id: todo.id,
        content: todo.content,
        date: todo.date?.toISOString() || null,
        time: todo.time?.format('HH:mm') || null,
        reminder: todo.reminder,
        repeat: todo.repeat
      }));
      
      // Store each property separately to avoid the map type issue
      await store.set(`${STORAGE_KEY}.version`, VERSION);
      await store.set(`${STORAGE_KEY}.todos`, serializedTodos);
      await store.save();
    } catch (error) {
      console.error('保存待办事项失败:', error);
    }
  },

  loadTodos: async (): Promise<Todo[]> => {
    try {
      // Get individual properties instead of the whole object
      const version = await store.get(`${STORAGE_KEY}.version`) as string;
      const serializedTodos = (await store.get(`${STORAGE_KEY}.todos`)) as SerializedTodo[] || [];

      // 数据版本检查和迁移逻辑可以在这里添加
      if (version !== VERSION) {
        console.warn('数据版本不匹配，可能需要迁移');
      }

      return serializedTodos.map((todo: SerializedTodo) => ({
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