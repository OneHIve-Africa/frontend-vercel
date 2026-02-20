import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileType,
  FileArchive,
  FileCode,
  File as FileIcon,
  RefreshCw,
  SortDesc,
  SortAsc,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
} from "lucide-react";
import ResourcesApi, { type ResourceItem } from "@/v1/api/ResourcesApi";
import ResourcePreviewModal from "@/v1/features/resources/components/ResourcePreviewModal";
import { dateUtils } from "@/v1/utils/dateutils";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";

const ResourcesPage: React.FC = () => {
  const STORAGE_KEY = "resources_page_prefs";
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const { profile } = useUserProfileStore();
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [sizes, setSizes] = useState<Record<number, number | null>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState<ResourceItem | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "images" | "documents" | "videos">("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    const api = ResourcesApi.getInstance();
    const res = await api.listResources();
    if ("data" in res && res.data) {
      setItems(res.data);
    } else if ("error" in res) {
      const msg =
        typeof res.error === "string" ? res.error : "Failed to load resources";
      setError(msg);
    } else {
      setError("Failed to load resources");
    }
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      await fetchList();
    };
    run();
  }, []);

  // Load prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const pref = JSON.parse(raw) as {
          q?: string;
          view?: "list" | "grid";
          sortDir?: "asc" | "desc";
          filterType?: "all" | "images" | "documents" | "videos";
        };
        if (pref.q !== undefined) setQ(pref.q);
        if (pref.view) setView(pref.view);
        if (pref.sortDir) setSortDir(pref.sortDir);
        if (pref.filterType) setFilterType(pref.filterType);
      }
    } catch {
      /* noop: best-effort restore */
    }
  }, []);

  // Save prefs
  useEffect(() => {
    try {
      const data = JSON.stringify({ q, view, sortDir, filterType });
      localStorage.setItem(STORAGE_KEY, data);
    } catch {
      /* noop: best-effort persist */
    }
  }, [q, view, sortDir, filterType]);

  const getIcon = (nameOrUrl: string) => {
    const extMatch =
      nameOrUrl.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() ||
      "";
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extMatch))
      return <ImageIcon size={18} className="text-gray-500" />;
    if (["csv", "tsv", "xlsx", "xls"].includes(extMatch))
      return <FileSpreadsheet size={18} className="text-gray-500" />;
    if (["pdf"].includes(extMatch))
      return <FileText size={18} className="text-gray-500" />;
    if (["zip", "rar", "7z"].includes(extMatch))
      return <FileArchive size={18} className="text-gray-500" />;
    if (["md", "txt", "rtf"].includes(extMatch))
      return <FileType size={18} className="text-gray-500" />;
    if (["js", "ts", "tsx", "json", "xml", "html", "css"].includes(extMatch))
      return <FileCode size={18} className="text-gray-500" />;
    return <FileIcon size={18} className="text-gray-500" />;
  };

  const readableSize = (bytes?: number | null) => {
    if (!bytes && bytes !== 0) return "";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${
      ["B", "KB", "MB", "GB", "TB"][i]
    }`;
  };

  const filtered = useMemo(() => {
    // Map user position to resource audience group
    const audience: "Investors" | "Farmers" | null =
      profile?.position === "Investor"
        ? "Investors"
        : profile?.position === "Farmer"
        ? "Farmers"
        : null;

    const term = q.trim().toLowerCase();

    // Base filters: search + audience
    const base = items
      .filter((r) => {
        if (!term) return true;
        return [r.title, r.desc, r.created_by_email]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase())
          .some((x) => x.includes(term));
      })
      .filter((r) => {
        if (!audience) return true;
        if (!r.accessed_by) return true;
        return r.accessed_by === "all" || r.accessed_by === audience;
      });

    // Type filter
    const typeFiltered = base.filter((r) => {
      if (filterType === "all") return true;
      const ext = (r.public_url || r.title)
        .split("?")[0]
        .split("#")[0]
        .split(".")
        .pop()
        ?.toLowerCase();
      const images = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
      const videos = ["mp4", "webm", "ogg"];
      const docs = [
        "pdf",
        "txt",
        "md",
        "csv",
        "xlsx",
        "xls",
        "doc",
        "docx",
        "ppt",
        "pptx",
      ];
      if (!ext) return filterType === "documents"; // default unknown to docs bucket
      if (filterType === "images") return images.includes(ext);
      if (filterType === "videos") return videos.includes(ext);
      if (filterType === "documents")
        return (
          docs.includes(ext) || (!images.includes(ext) && !videos.includes(ext))
        );
      return true;
    });

    // Sort
    const sorted = [...typeFiltered].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });
    return sorted;
  }, [items, q, sortDir, profile, filterType]);

  useEffect(() => {
    // Fetch sizes via HEAD if unknown
    const controller = new AbortController();
    const run = async () => {
      const targets = filtered.filter((r) => sizes[r.id] === undefined);
      await Promise.all(
        targets.map(async (r) => {
          try {
            const resp = await fetch(r.public_url, {
              method: "HEAD",
              signal: controller.signal,
            });
            const len = resp.headers.get("content-length");
            setSizes((prev) => ({
              ...prev,
              [r.id]: len ? parseInt(len, 10) : null,
            }));
          } catch {
            setSizes((prev) => ({ ...prev, [r.id]: null }));
          }
        })
      );
    };
    if (filtered.length) run();
    return () => controller.abort();
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center mb-6 gap-3 flex-wrap">
          <div className="relative w-full max-w-sm flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-50"
              title="Filter"
            >
              <span>Filter</span>
              <ChevronDown size={16} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                <div className="flex items-center justify-between px-2 pb-1">
                  <div className="text-xs font-semibold text-gray-500">Filters</div>
                  <button
                    onClick={() => {
                      setQ("");
                      setFilterType("all");
                      setSortDir("desc");
                      setFilterOpen(false);
                    }}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    Clear
                  </button>
                </div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500">Type</div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  {(["all", "images", "documents", "videos"] as const).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setFilterType(t);
                          setFilterOpen(false);
                        }}
                        className={`px-3 py-1.5 text-sm rounded-full border ${
                          filterType === t
                            ? "bg-orange-50 border-orange-300 text-orange-600"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    )
                  )}
                </div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500">View</div>
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => {
                      setView("list");
                      setFilterOpen(false);
                    }}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-full border inline-flex items-center justify-center gap-2 ${
                      view === "list"
                        ? "bg-gray-100 border-gray-300"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <ListIcon size={16} /> List
                  </button>
                  <button
                    onClick={() => {
                      setView("grid");
                      setFilterOpen(false);
                    }}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-full border inline-flex items-center justify-center gap-2 ${
                      view === "grid"
                        ? "bg-gray-100 border-gray-300"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid size={16} /> Grid
                  </button>
                </div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500">Sort</div>
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => {
                      setSortDir("desc");
                      setFilterOpen(false);
                    }}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-full border inline-flex items-center justify-center gap-2 ${
                      sortDir === "desc"
                        ? "bg-gray-100 border-gray-300"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <SortDesc size={16} /> Newest
                  </button>
                  <button
                    onClick={() => {
                      setSortDir("asc");
                      setFilterOpen(false);
                    }}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-full border inline-flex items-center justify-center gap-2 ${
                      sortDir === "asc"
                        ? "bg-gray-100 border-gray-300"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <SortAsc size={16} /> Oldest
                  </button>
                </div>
                <div className="border-t mt-1 pt-2 px-2 pb-1 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterOpen(false);
                      fetchList();
                    }}
                    className="px-3 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50 inline-flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {view === "list" ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size > 0 && filtered.every((r) => selectedIds.has(r.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(filtered.map((r) => r.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-orange-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-orange-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-orange-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      {[0, 1, 2, 3].map((c) => (
                        <td key={c} className="p-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-sm text-red-600"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span>{error}</span>
                        <button
                          onClick={fetchList}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <RefreshCw size={14} /> Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-sm text-gray-500"
                    >
                      No resources found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelected(r);
                        setPreviewOpen(true);
                      }}
                    >
                      <td className="p-4 text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(r.id);
                              else next.delete(r.id);
                              return next;
                            });
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-2 font-medium">
                          {getIcon(r.public_url || r.title)}
                          <span>{r.title}</span>
                          {sizes[r.id] !== undefined && (
                            <span className="ml-2 text-xs text-gray-500">
                              {readableSize(sizes[r.id] ?? undefined)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{r.desc || "—"}</td>
                      <td className="p-4 text-gray-700">
                        {dateUtils.formatDate(r.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={r.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                          title="Open"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={18} />
                          <span className="sr-only">Open</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="h-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded mt-3 w-2/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded mt-2 w-1/3 animate-pulse" />
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center text-sm text-red-600">
                <div className="inline-flex items-center gap-3">
                  <span>{error}</span>
                  <button
                    onClick={fetchList}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center text-sm text-gray-500">
                No resources found.
              </div>
            ) : (
              filtered.map((r) => {
                const ext =
                  (r.public_url || r.title)
                    .split("?")[0]
                    .split("#")[0]
                    .split(".")
                    .pop()
                    ?.toLowerCase() || "";
                const isImage = [
                  "png",
                  "jpg",
                  "jpeg",
                  "gif",
                  "webp",
                  "svg",
                ].includes(ext);
                const isVideo = ["mp4", "webm", "ogg"].includes(ext);
                const isPdf = ext === "pdf";
                return (
                  <div
                    key={r.id}
                    className="relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group"
                    onClick={() => {
                      setSelected(r);
                      setPreviewOpen(true);
                    }}
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      {isImage ? (
                        <img
                          src={r.public_url}
                          alt={r.title}
                          className="h-full w-full object-cover"
                        />
                      ) : isVideo ? (
                        <video
                          src={r.public_url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : isPdf ? (
                        <div className="flex flex-col items-center justify-center text-orange-500">
                          <FileText size={36} />
                          <span className="text-xs text-gray-600 mt-1">
                            PDF
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          {getIcon(r.public_url || r.title)}
                          <span className="text-xs text-gray-600 mt-1">
                            File
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Checkbox overlay */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(r.id);
                            else next.delete(r.id);
                            return next;
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Hover actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                      <div className="flex gap-2">
                        <a
                          href={r.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-xs rounded-full bg-white/90 border border-gray-300 text-gray-700 hover:bg-white"
                          onClick={(e) => e.stopPropagation()}
                          title="Open"
                        >
                          Open
                        </a>
                        <a
                          href={r.public_url}
                          download
                          className="px-2 py-1 text-xs rounded-full bg-white/90 border border-gray-300 text-gray-700 hover:bg-white"
                          onClick={(e) => e.stopPropagation()}
                          title="Download"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-medium text-gray-900 line-clamp-1">
                        {r.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="line-clamp-1">{r.desc || "—"}</span>
                        <span className="ml-auto inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                            {dateUtils.formatDate(r.created_at)}
                          </span>
                          {sizes[r.id] !== undefined && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                              {readableSize(sizes[r.id] ?? undefined)}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        {/* Sticky bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="px-4 py-2 bg-white border border-gray-200 shadow-lg rounded-full flex items-center gap-3">
              <span className="text-sm text-gray-700">{selectedIds.size} selected</span>
              <button
                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50"
                onClick={() => {
                  // open selected in new tabs
                  const map = new Map(items.map((i) => [i.id, i.public_url] as const));
                  selectedIds.forEach((id) => {
                    const url = map.get(id);
                    if (url) window.open(url, "_blank");
                  });
                }}
              >
                Download
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear selection
              </button>
            </div>
          </div>
        )}
        <ResourcePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          item={selected || undefined}
        />
      </div>
    </div>
  );
};

export default ResourcesPage;
