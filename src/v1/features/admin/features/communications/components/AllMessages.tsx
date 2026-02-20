import React, { useState } from "react";
import QuillTextEditor from "./QuillTextEditor";
import { Send } from "lucide-react";

const AllMessages: React.FC = () => {
  const [message, setMessage] = useState("");
  return (
    <div className="">
      <div className="bg-[#D9D9D9] rounded p-6 ">
        <QuillTextEditor onChange={setMessage} value={message} />
        <div className="flex justify-end">
          <button className="flex items-center gap-2 rounded bg-oha_primary text-white py-2 px-8">
            Send <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllMessages;
