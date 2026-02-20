import { useEffect } from "react";
import MessageInput from "../components/MessageInput";
import { useMessageStore } from "../store/MessageStore";

const FeedbackPage = () => {
  const loadHistory = useMessageStore((s) => s.loadHistory);

  useEffect(() => {
    loadHistory().catch(() => {});
  }, [loadHistory]);
  return (
    <div className="w-full h-full">
      <div className="max-w-full px-5 bg-white rounded-lg h-full flex justify-center items-center">
        {/* Header */}

        <MessageInput />
      </div>
    </div>
  );
};

export default FeedbackPage;
