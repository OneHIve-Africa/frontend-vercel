import { useMemo, useState } from "react";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import { Checkbox } from "@/components/Checkbox.tsx";
import { Link } from "react-router-dom";
import { SearchIcon, StarIcon } from "lucide-react";

// Convert Quill HTML to plain text for preview
function htmlToText(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || "", "text/html");
    const text = doc.body.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  } catch {
    return html;
  }
}

// Truncate helper
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

const Notifications: React.FC = () => {
  const { filteredNotifications, isLoading, error } = useNotificationStore();
  const setNotificationRead = useNotificationStore(
    (s) => s.setNotificationRead
  );
  const [query, setQuery] = useState("");

  // Data is fetched by NotificationsPage based on route param.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredNotifications;
    return filteredNotifications.filter((n) => {
      const inTitle = (n.title || "").toLowerCase().includes(q);
      const inBody = htmlToText(n.message || "").toLowerCase().includes(q);
      return inTitle || inBody;
    });
  }, [filteredNotifications, query]);

  return (
    <div className="w-full p-4 bg-white rounded shadow ">
      <div
        className="flex items-center mb-4 rounded-full px-4
              w-2/5 bg-gray-100 ml-5"
      >
        <SearchIcon className={"text-gray-300"} />
        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 bg-transparent border-none focus:border-none outline-none focus:outline-none "
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {isLoading ? (
        <p className="text-center text-gray-500">Loading inbox…</p>
      ) : (
        <>
          {visible.length > 0 ? (
            <ul className={"px-5 flex flex-col gap-2 mt-10"}>
              {visible.map((notif) => (
                <Link
                  to={`/notification/message/${notif.id}`}
                  key={notif.id}
                  className={`flex p-4 bg-white border-b border-gray-300 gap-5 justify-between rounded hover:bg-neutral-50 ${notif.read ? "opacity-70" : ""}`}
                  onClick={() => setNotificationRead(notif.id)}
                >
                  <div className={"flex justify-center items-center gap-4 "}>
                    <Checkbox className={"border-2"} />
                    <StarIcon className={"w-5 h-5 text-gray-500"} />
                  </div>
                  <div className={"flex items-start gap-5 flex-1 min-w-0"}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className={`truncate pr-2 font-medium ${notif.read ? "text-neutral-600" : "text-neutral-900"}`}>{notif.title}</h4>
                        <span className="text-xs text-neutral-400 whitespace-nowrap">{new Date(notif.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-neutral-600 truncate">
                        {truncate(htmlToText(notif.message), 50)}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">{notif.group}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 mt-8">
              {query ? "No matching notifications" : error || "No notifications"}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;

