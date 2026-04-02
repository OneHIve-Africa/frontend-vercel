import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { mascot_video } from "@/assets";
import ChatbotApi from "@/v1/api/ChatbotApi";

// Convert API message to UI message
interface UIMessage {
    id: string;
    text: string;
    sender: "user" | "bot" | "system";
    timestamp: Date;
}

const NaaChatbot: React.FC = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<UIMessage[]>([
        {
            id: "1",
            text: "Hi! I'm Naa, your hive assistant. How can I help you today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    // Fetch history when opened
    useEffect(() => {
        if (isOpen && !historyLoaded) {
            const fetchHistory = async () => {
                try {
                    const api = ChatbotApi.getInstance();
                    const response = await api.getHistory();
                    if (response.data && response.data.length > 0) {
                        const history: UIMessage[] = response.data.map(msg => ({
                            id: msg.id || Date.now().toString() + Math.random(),
                            text: msg.content,
                            sender: msg.role,
                            timestamp: new Date(msg.timestamp)
                        }));
                        setMessages((prev) => [...prev, ...history]);
                    }
                } catch (err) {
                    console.error("Failed to load chat history:", err);
                } finally {
                    setHistoryLoaded(true);
                }
            };
            fetchHistory();
        }
    }, [isOpen, historyLoaded]);

    const toggleChat = () => setIsOpen((prev) => !prev);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isTyping) return;

        const currentMessage = message.trim();
        const newUserMessage: UIMessage = {
            id: Date.now().toString(),
            text: currentMessage,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setMessage("");
        setIsTyping(true);

        try {
            const api = ChatbotApi.getInstance();
            const response = await api.sendMessage(currentMessage, location.pathname);

            if (response.data) {
                const botResponse: UIMessage = {
                    id: response.data.id || (Date.now() + 1).toString(),
                    text: response.data.content,
                    sender: "bot",
                    timestamp: new Date(response.data.timestamp || Date.now()),
                };
                setMessages((prev) => [...prev, botResponse]);
            }
        } catch (err) {
            console.error(err);
            const errorResponse: UIMessage = {
                id: (Date.now() + 1).toString(),
                text: "My apologies, the hive connection dropped. Please try again.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-oha_primary p-4 flex items-center justify-between text-white drop-shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <span className="text-xl" role="img" aria-label="bee">
                                        🐝
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg leading-tight">Naa</h3>
                                    <p className="text-xs text-white/80 font-medium">Virtual Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${msg.sender === "user"
                                            ? "bg-oha_primary text-white rounded-br-none"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none justify-start"
                                            }`}
                                    >
                                        {msg.sender === "bot" && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <Bot className="h-3.5 w-3.5 text-oha_primary" />
                                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                                    Naa
                                                </span>
                                            </div>
                                        )}
                                        <p>{msg.text}</p>
                                        <div
                                            className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-white/70 text-right" : "text-gray-400"
                                                }`}
                                        >
                                            {msg.timestamp.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5 w-16">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form
                                onSubmit={handleSend}
                                className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-oha_primary/20 focus-within:border-oha_primary transition-all"
                            >
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ask Naa anything..."
                                    className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder-gray-400 text-gray-700 h-10"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-oha_primary text-white disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className={`fixed bottom-6 right-10 h-20 w-20 rounded-full flex items-center justify-center z-50 transition-colors cursor-pointer overflow-hidden ${isOpen ? "bg-gray-800 hover:bg-gray-700 shadow-xl" : "bg-white"
                    }`}
                aria-label="Toggle Chatbot"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <video
                        src={mascot_video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-24 w-20 object-cover bg-white object-center rounded-full pointer-events-none"
                    />
                )}
            </motion.button>
        </>
    );
};

export default NaaChatbot;
