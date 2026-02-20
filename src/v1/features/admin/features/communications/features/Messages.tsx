import { useEffect, useMemo, useState, useRef } from "react";
// (spinner not needed for background send)
import { toast } from "react-hot-toast";
import TableComponent from "../components/TableComponent";
import { Search } from "lucide-react";
import { useAdminUsersStore } from "../store/AdminUsersStore";
import QuillTextEditor, {
  QuillTextEditorRef,
} from "../components/QuillTextEditor";

const Messages: React.FC = () => {
  const { selectedIds, setFilter, fetchAll, sendCommunication } =
    useAdminUsersStore();
  const selectedCount = selectedIds.size;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cta, setCta] = useState("");
  const allowedTags = [
    "Investment Updates",
    "Performance Alerts",
    "Events",
    "Announcements",
    "Direct Messages",
    "Important",
  ] as const;
  const [tag, setTag] = useState<(typeof allowedTags)[number]>("Announcements");
  // Non-blocking send: no isSending flag
  const editorRef = useRef<QuillTextEditorRef | null>(null);
  const showPlaceholderChips = true;
  const placeholders = [
    "{{firstname}}",
    "{{lastname}}",
    "{{fullname}}",
    "{{email}}",
  ] as const;
  const insertPlaceholder = (p: (typeof placeholders)[number]) => {
    editorRef.current?.insertPlaceholder(p);
  };
  const canSend = useMemo(
    () => title.trim() !== "" && content.trim() !== "" && selectedCount > 0,
    [title, content, selectedCount]
  );

  useEffect(() => {
    // initial load
    fetchAll().catch(() => {});
  }, [fetchAll]);

  // prevent setting state after unmount if user navigates away mid-send
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSend = () => {
    if (!canSend) return;
    const payload = {
      user_ids: Array.from(selectedIds),
      title: title.trim(),
      content: content.trim(),
      cta_link: cta.trim() || undefined,
      tag,
    } as const;

    const promise = (async () => {
      const res = await sendCommunication(payload);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to send message");
      }
      return true;
    })();

    toast.promise(promise, {
      loading: "Sending message...",
      success: "Message sent successfully",
      error: (e) => e?.message || "Failed to send message",
    });

    promise
      .then(() => {
        if (!mountedRef.current) return;
        setTitle("");
        setContent("");
        setCta("");
      })
      .catch(() => {
        // error already handled by toast
      });
  };

  return (
    <>
      {/* <AllMessages /> */}
      <div className="my-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-4 items-center">
              <div className="flex items-center w-72 rounded-full border border-gray-200 px-4 py-2">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search users"
                  className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400"
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => fetchAll()}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-oha_primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tag
                </label>
                <select
                  value={tag}
                  onChange={(e) =>
                    setTag(e.target.value as (typeof allowedTags)[number])
                  }
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-oha_primary"
                >
                  {allowedTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1 ">
                <label className="block text-sm text-gray-600 mb-1">
                  CTA Link (optional)
                </label>
                <input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="https://onehiveafrica.com/investments"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-oha_primary"
                />
              </div>
              <div className="md:col-span-1 md:justify-self-end pt-6">
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`px-5 py-2 rounded-full text-white text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors ${
                    canSend
                      ? "bg-oha_primary hover:bg-oha_primary/90"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Send Message
                </button>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">
                  Content
                </label>
                <div className="w-full border border-gray-200 rounded-md overflow-hidden">
                  <QuillTextEditor
                    ref={editorRef}
                    value={content}
                    onChange={setContent}
                  />
                </div>
                {showPlaceholderChips && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {placeholders.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                        onClick={() => insertPlaceholder(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <TableComponent />

          {/* Toasts are handled globally via <Toaster /> in App.tsx */}
        </div>
      </div>
    </>
  );
};

export default Messages;
