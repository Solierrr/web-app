import type { User } from "../users/user/user";

export interface Message {
    user:    User
    message: string;
    time:    Date;
}
