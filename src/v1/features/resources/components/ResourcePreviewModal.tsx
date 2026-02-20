import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import DOMPurify from "dompurify";

import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import type { ResourceItem } from "@/v1/api/ResourcesApi";

type Props = {
  open: boolean;
  onClose: () => void;
  item?: ResourceItem | null;
};

const extFrom = (urlOrName?: string) =>
  (urlOrName?.split("?")[0].split("#")[0].split(".").pop() || "").toLowerCase();

const ResourcePreviewModal: React.FC<Props> = ({ open, onClose, item }) => {
  const url = item?.public_url || "";
  const ext = extFrom(url || item?.title);
  const [textPreview, setTextPreview] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [xlsxPreview, setXlsxPreview] = useState<string[][]>([]);
  const [isReading, setIsReading] = useState(false);
  const [headType, setHeadType] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");

  // Prefer extension but also consider HEAD Content-Type when available
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext) || headType.startsWith("image/");
  const isPdf = ext === "pdf" || headType === "application/pdf";
  const isMarkdown = ["md", "markdown"].includes(ext);
  const isCsv = ext === "csv" || headType.includes("text/csv");
  const isText = ["txt", "json", "xml", "html", "css"].includes(ext) || headType.startsWith("text/");
  const isXlsx = ["xlsx", "xls"].includes(ext) || headType.includes("spreadsheet");
  const isVideo = ["mp4", "webm", "ogg"].includes(ext) || headType.startsWith("video/");

  const markdownHtml = useMemo(() => {
    if (!isMarkdown || !textPreview) return "";
    let html = textPreview
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    html = html.replace(/```([\s\S]*?)```/g, (_m, p1) => `<pre><code>${p1}</code></pre>`);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/^######\s+(.*)$/gm, "<h6>$1</h6>");
    html = html.replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>");
    html = html.replace(/^####\s+(.*)$/gm, "<h4>$1</h4>");
    html = html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html
      .split(/\n\n+/)
      .map((p) => (/^<h\d|<ul>|<ol>|<pre>|<p>|<table>/.test(p) ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
      .join("\n");
    return DOMPurify.sanitize(html);
  }, [isMarkdown, textPreview]);

  useEffect(() => {
    const run = async () => {
      setTextPreview("");
      setCsvPreview([]);
      setXlsxPreview([]);
      setFetchError("");
      setHeadType("");
      if (!url) return;
      try {
        setIsReading(true);
        // Try a HEAD request to detect Content-Type
        try {
          const headResp = await fetch(url, { method: "HEAD" });
          const ct = headResp.headers.get("content-type") || "";
          setHeadType(ct.toLowerCase());
        } catch {
          // ignore HEAD failures (CORS or provider restrictions)
        }
        if (isCsv) {
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`Failed to fetch CSV: ${resp.status}`);
          const text = await resp.text();
          const rows = text
            .split(/\r?\n/)
            .filter((l) => l.trim() !== "")
            .slice(0, 20)
            .map((line) => line.split(","));
          setCsvPreview(rows);
          return;
        }
        if (isMarkdown || isText) {
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`Failed to fetch text: ${resp.status}`);
          const text = await resp.text();
          setTextPreview(text.slice(0, 6000));
          return;
        }
        if (isXlsx) {
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`Failed to fetch spreadsheet: ${resp.status}`);
          const buf = await resp.arrayBuffer();
          const wb = XLSX.read(buf, { type: "array" });
          const firstSheet = wb.SheetNames[0];
          if (firstSheet) {
            const ws = wb.Sheets[firstSheet];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[];
            const rows: string[][] = (json || [])
              .slice(0, 20)
              .map((r: unknown) => (Array.isArray(r) ? r : [r]).map((c) => String((c as unknown) ?? "")) as string[]);
            setXlsxPreview(rows);
          }
          return;
        }
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : "Failed to preview file");
      } finally {
        setIsReading(false);
      }
    };
    if (open) run();
  }, [open, url, isCsv, isMarkdown, isText, isXlsx]);

  return (
    <Modal popupModal={open} setPopupModal={onClose} outClickCancel>
      <div className="w-[900px] max-w-[95vw]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">{item?.title || "Preview"}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-gray-500 break-all">{url}</p>
              {(ext || headType) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  {(ext || headType || "").toString()}
                </span>
              )}
            </div>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              title="Open in new tab"
            >
              <Download size={16} /> Open
            </a>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 min-h-[500px] flex items-center justify-center w-full border">
          {fetchError ? (
            <div className="text-sm text-red-600 p-4">{fetchError}</div>
          ) : !item || !url ? (
            <div className="text-gray-500">No preview available</div>
          ) : isImage ? (
            <img src={url} alt="preview" className="max-h-[70vh] object-contain" />
          ) : isPdf ? (
            <embed src={url} type="application/pdf" className="w-full h-[70vh] rounded" />
          ) : isVideo ? (
            <video src={url} controls className="w-full h-[70vh] rounded object-contain" />
          ) : isCsv ? (
            <div className="w-full h-full overflow-auto bg-white rounded p-3">
              {isReading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : csvPreview.length ? (
                <table className="w-full text-xs">
                  <tbody>
                    {csvPreview.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {row.map((cell, i) => (
                          <td key={i} className="p-1 border-r text-gray-800">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-sm text-gray-500">No previewable CSV content</div>
              )}
            </div>
          ) : isXlsx ? (
            <div className="w-full h-full overflow-auto bg-white rounded p-3">
              {isReading ? (
                <div className="text-sm text-gray-500">Parsing spreadsheet…</div>
              ) : xlsxPreview.length ? (
                <table className="w-full text-xs">
                  <tbody>
                    {xlsxPreview.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {row.map((cell, i) => (
                          <td key={i} className="p-1 border-r text-gray-800">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-sm text-gray-500">No previewable spreadsheet content</div>
              )}
            </div>
          ) : isMarkdown || isText ? (
            <div className="w-full h-full overflow-auto bg-white rounded p-3">
              {isReading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : isMarkdown ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: markdownHtml }} />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{textPreview}</pre>
              )}
            </div>
          ) : (
            <div className="text-gray-600 text-sm text-center p-6">
              Preview not supported for this file type. Use Open to view in a new tab.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ResourcePreviewModal;
