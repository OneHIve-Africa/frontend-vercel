import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, MessageCircle, MessageCircleOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Lottie } from "lottie-react";
import { beeLottie } from "@/assets";
import ChatbotApi from "@/v1/api/ChatbotApi";

const PROMPT_STORAGE_KEY = "oha_naa_show_prompt";

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
    const [showNudge, setShowNudge] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem(PROMPT_STORAGE_KEY);
            return saved !== null ? saved === "true" : true;
        } catch {
            return true;
        }
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const setPromptVisibility = (visible: boolean) => {
        setShowNudge(visible);
        try {
            localStorage.setItem(PROMPT_STORAGE_KEY, visible ? "true" : "false");
        } catch (err) {
            console.error("Failed to save chatbot prompt preference:", err);
        }
    };

    const sendPrompt = async (promptText: string) => {
        if (isTyping) return;
        const newUserMessage: UIMessage = {
            id: Date.now().toString(),
            text: promptText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setIsTyping(true);

        try {
            const api = ChatbotApi.getInstance();
            const response = await api.sendMessage(promptText, location.pathname);

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
            const errorMessage: UIMessage = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: "system",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

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
                                <div className="relative">
                                    <div className="h-10 w-10 flex items-center justify-center overflow-visible">
                                        <Lottie
                                            src={beeLottie}
                                            loop={true}
                                            autoplay={true}
                                            className="w-12 h-12 pointer-events-none drop-shadow-sm scale-125"
                                        />
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 rounded-full border-2 border-oha_primary"></span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                                        Naa
                                        <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-normal">
                                            Hive AI
                                        </span>
                                    </h3>
                                    <p className="text-xs text-white/80">
                                        Always here to help you navigate
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPromptVisibility(!showNudge)}
                                    className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
                                    title={showNudge ? "Hide message prompt on screen" : "Show message prompt on screen"}
                                    aria-label="Toggle mascot prompt bubble"
                                >
                                    {showNudge ? (
                                        <MessageCircle className="h-4 w-4" />
                                    ) : (
                                        <MessageCircleOff className="h-4 w-4 text-white/50" />
                                    )}
                                </button>
                                <button
                                    onClick={toggleChat}
                                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                                    aria-label="Close Chat"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
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

                        {/* Suggested Quick Question Chips */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto">
                            {["How do payouts work?", "Compare hive types", "Minimum investment"].map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => sendPrompt(chip)}
                                    className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-oha_primary hover:text-oha_primary transition whitespace-nowrap cursor-pointer shadow-xs"
                                >
                                    {chip}
                                </button>
                            ))}
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
                                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-oha_primary text-white disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm cursor-pointer"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Welcome Speech Bubble for Fresh Investors */}
            {!isOpen && showNudge && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed bottom-28 right-8 z-50 max-w-xs bg-white rounded-2xl p-4 shadow-xl border border-amber-200/90 text-left"
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPromptVisibility(false);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        title="Dismiss prompt (keep closed)"
                        aria-label="Dismiss prompt"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-start gap-2.5">
                        <span className="text-xl">👋</span>
                        <div className="pr-2">
                            <h5 className="text-xs font-bold text-gray-900">Need Guidance?</h5>
                            <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                                Curious how honey yields and payouts work? Click to chat with me!
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(true);
                                }}
                                className="mt-2 text-xs font-bold text-oha_primary hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <span>Ask Naa</span>
                                <Send className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    {/* Bubble pointer */}
                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-amber-200/90 transform rotate-45"></div>
                </motion.div>
            )}

            {/* Subtle Re-open Prompt Pill when kept closed */}
            {!isOpen && !showNudge && (
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPromptVisibility(true);
                    }}
                    className="fixed bottom-28 right-8 z-50 bg-white/95 hover:bg-white text-gray-700 hover:text-oha_primary text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-amber-200/90 flex items-center gap-1.5 transition-all backdrop-blur-sm cursor-pointer group"
                    title="Click to show Naa's guidance prompt"
                    aria-label="Show guidance prompt"
                >
                    <span className="text-sm">👋</span>
                    <span className="group-hover:text-oha_primary">Need guidance?</span>
                </motion.button>
            )}

            {/* Mascot FAB */}
            <motion.button
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className={`fixed z-50 flex items-center justify-center cursor-pointer transition-all focus:outline-none ${isOpen
                    ? "bottom-6 right-8 h-12 w-12 rounded-full bg-gray-900/90 hover:bg-gray-900 text-white shadow-2xl backdrop-blur-sm"
                    : "bottom-4 right-6 h-24 w-24 sm:h-28 sm:w-28 bg-transparent border-0 outline-none shadow-none p-0 overflow-visible"
                    }`}
                aria-label="Toggle Chatbot"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none filter drop-shadow-xl">
                        <Lottie
                            src={beeLottie}
                            loop={true}
                            autoplay={true}
                            className="w-full h-full pointer-events-none select-none"
                        />
                    </div>
                )}
            </motion.button>
        </>
    );
};

export default NaaChatbot;
