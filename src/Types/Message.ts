enum MessageType {
  None,
  Selection,
  Deletion,
  InputChange
}
type MessageData = {
  MessageType: MessageType;
  Message: { msg: string, obj: any };
}
interface Message {
  messageString: string;
  messageData: MessageData;
}

function ClearMessage(): Message {
  return {
    messageString: "",
    messageData: {
      MessageType: MessageType.None,
      Message: { msg: "", obj: {} }
    }
  }
}

export { Message, ClearMessage }
