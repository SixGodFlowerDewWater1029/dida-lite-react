import { Dayjs } from 'dayjs';

export interface Todo {
  id: string;
  content: string;
  date: Date | null;
  time: Dayjs | null;
  reminder: boolean;
  reminderOptions?: string[];
  repeat: boolean;
  completed: boolean;
  deleted: boolean;
}