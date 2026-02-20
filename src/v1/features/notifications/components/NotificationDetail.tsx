import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import DOMPurify from "dompurify";

const NotificationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications } = useNotificationStore();
  const setNotificationRead = useNotificationStore(
    (s) => s.setNotificationRead
  );

  const notification = notifications.find(
    (notif) => String(notif.id) === String(id)
  );

  // Mark as read on open (optimistic + backend sync handled in store)
  useEffect(() => {
    if (notification && !notification.read) {
      setNotificationRead(notification.id);
    }
  }, [notification, setNotificationRead]);

  const sanitizedHtml = useMemo(() => {
    // Sanitize Quill HTML content
    return DOMPurify.sanitize(notification?.message ?? "", {
      USE_PROFILES: { html: true },
    });
  }, [notification?.message]);

  return (
    <div className=" uid w-full p-4 bg-white rounded shadow h-full ">
      <div className="max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 mb-4 text-sm text-oha_primary border border-oha_primary/30 rounded hover:bg-oha_primary/10"
        >
          Back to Notifications
        </button>
        <div className="p-6">
          {!notification ? (
            <div>
              <p className="text-center text-neutral-500">Notification not found</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-oha_secondary/10 text-oha_secondary text-[11px] font-medium px-2.5 py-1">
                      {notification.group}
                    </span>
                  </div>
                  <h1 className="text-2xl font-semibold mt-3 text-neutral-900 break-words">
                    {notification.title || "No title"}
                  </h1>
                </div>
                <div className="text-xs text-neutral-500 whitespace-nowrap">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="mt-5 prose prose-neutral max-w-none prose-headings:scroll-mt-20 prose-a:text-oha_primary hover:prose-a:underline">
                <div
                  className="min-h-[120px] text-[15px] leading-7 text-neutral-800"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
