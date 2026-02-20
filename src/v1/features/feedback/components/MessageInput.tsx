import { useState } from "react";
import { Send } from "lucide-react";
import { useMessageStore } from "../store/MessageStore";

const MessageInput = () => {
  const [input, setInput] = useState("");
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const isSending = useMessageStore((s) => s.isSending);
  const error = useMessageStore((s) => s.error);

  const handleSend = async () => {
    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="w-full flex flex-col items-center p-4">
      <h2 className="text-xl font-semibold text-gray-800">Hello Bee-Friend</h2>
      <p className="text-gray-500 mb-4">Have Any Issues?</p>

      <div className="flex items-center w-full max-w-md bg-gray-100 rounded-lg p-2">
        <textarea
          className="flex-1 bg-transparent outline-none p-2 text-gray-700 placeholder-gray-400 resize-none h-[103px]"
          placeholder="Write message"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()}
          disabled={isSending}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-green-600 disabled:opacity-60"
          onClick={handleSend}
          disabled={isSending || !input.trim()}
        >
          {isSending ? "Sending..." : "Send"} <Send size={16} />
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2" role="alert">{error}</p>
      )}
    </div>
  );
};

export default MessageInput;
