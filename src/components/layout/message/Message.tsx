import type { Message } from "@/features/messages/messages";
import type { User } from "@/features/users/user/user";

interface MessageProps {
    message: Message;
    owner:   User;
}

export default function Message({ message, owner }: MessageProps) {
    const hour = `${message.time.getHours()}:${message.time.getMinutes()}`
    
    return (
        <div className={message.user === owner ? "" : ""}>
            <div>
                <p>{message.message}<span>{hour}</span></p>
            </div>
        </div>
    );
}