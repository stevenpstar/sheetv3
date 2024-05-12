var MessageType;
(function (MessageType) {
    MessageType[MessageType["None"] = 0] = "None";
    MessageType[MessageType["Selection"] = 1] = "Selection";
    MessageType[MessageType["Deletion"] = 2] = "Deletion";
    MessageType[MessageType["InputChange"] = 3] = "InputChange";
})(MessageType || (MessageType = {}));
function ClearMessage() {
    return {
        messageString: "",
        messageData: {
            MessageType: MessageType.None,
            Message: { msg: "", obj: {} }
        }
    };
}
export { ClearMessage };
