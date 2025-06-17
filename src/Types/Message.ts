enum MessageType {
  None,
  Selection,
  Deletion,
  InputChange,
  AddNote,
  Undo,
  Redo,
  StateChange,
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

export { Message, ClearMessage, MessageType }
