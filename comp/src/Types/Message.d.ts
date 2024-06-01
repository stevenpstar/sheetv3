declare enum MessageType {
    None = 0,
    Selection = 1,
    Deletion = 2,
    InputChange = 3
}
type MessageData = {
    MessageType: MessageType;
    Message: {
        msg: string;
        obj: any;
    };
};
interface Message {
    messageString: string;
    messageData: MessageData;
}
declare function ClearMessage(): Message;
export { Message, ClearMessage };
//# sourceMappingURL=Message.d.ts.map