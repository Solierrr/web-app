import type { User } from "../users/user/user";

export interface Message {
  user: User;
  message: string;
  time: Date;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
}
