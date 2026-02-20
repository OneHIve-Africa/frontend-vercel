/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import DOMPurify from "dompurify";
import Modal from "@/components/Modal";

export type AudienceType = "Admins" | "Farmers" | "Investors";

export interface UploadFormValues {
  title: string;
  description?: string;
  audience: AudienceType[];
}

type Props = {
  open: boolean;
  onClose: () => void;
  file: File | null;
  onStart: (values: UploadFormValues) => void;
  busy?: boolean;
};

const readableSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, i)).toFixed(2) +
    " " +
    ["B", "KB", "MB", "GB", "TB"][i]
  );
};

const UploadResourceModal: React.FC<Props> = ({
  open,
  onClose,
  file,
  onStart,
  busy,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<AudienceType[]>([]);

  useEffect(() => {
    if (file) setTitle(file.name.replace(/\.[^.]+$/, ""));
  }, [file]);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  // Derived previews for text-like formats
  const [textPreview, setTextPreview] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [xlsxPreview, setXlsxPreview] = useState<string[][]>([]);
  const [isReading, setIsReading] = useState(false);

  const ext = useMemo(
    () => (file?.name?.split(".").pop() || "").toLowerCase(),
    [file]
  );
  const isImage =
    file?.type.startsWith("image/") || ["png", "jpg", "jpeg"].includes(ext);
  const isPdf = file?.type === "application/pdf" || ext === "pdf";
  const isMarkdown =
    file?.type === "text/markdown" || ["md", "markdown"].includes(ext);
  const isCsv = file?.type === "text/csv" || ext === "csv";
  const isText = file?.type === "text/plain" || ext === "txt";
  const isXlsx =
    file?.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    ext === "xlsx";
  const isDocx =
    file?.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx";

  useEffect(() => {
    if (!file) {
      setTextPreview("");
      setCsvPreview([]);
      setXlsxPreview([]);
      return;
    }
    const run = async () => {
      try {
        setIsReading(true);
        // CSV
        if (isCsv) {
          const text = await file.text();
          const rows = text
            .split(/\r?\n/)
            .filter((l) => l.trim() !== "")
            .slice(0, 20)
            .map((line) => line.split(","));
          setCsvPreview(rows);
          setTextPreview("");
          setXlsxPreview([]);
          return;
        }
        // Markdown / Text
        if (isMarkdown || isText) {
          const text = await file.text();
          setTextPreview(text.slice(0, 4000));
          setCsvPreview([]);
          setXlsxPreview([]);
          return;
        }
        // XLSX (best-effort)
        if (isXlsx) {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: "array" });
          const firstSheet = wb.SheetNames[0];
          if (firstSheet) {
            const ws = wb.Sheets[firstSheet];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
            const rows: string[][] = (json || [])
              .slice(0, 15)
              .map((r: any) =>
                (Array.isArray(r) ? r : [r]).map((c) => String(c ?? ""))
              );
            setXlsxPreview(rows);
            setTextPreview("");
            setCsvPreview([]);
            return;
          }
        }
        // Default: clear derived previews
        setTextPreview("");
        setCsvPreview([]);
        setXlsxPreview([]);
      } catch {
        // On parse errors, just fall back to generic preview area
        setTextPreview("");
        setCsvPreview([]);
        setXlsxPreview([]);
      } finally {
        setIsReading(false);
      }
    };
    run();
  }, [file, isCsv, isMarkdown, isText, isXlsx]);

  // Minimal markdown -> HTML conversion (headings, bold, italics, code, lists, links)
  const markdownHtml = useMemo(() => {
    if (!isMarkdown || !textPreview) return "";
    let html = textPreview
      // Escape HTML first
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Code blocks ```
    html = html.replace(
      /```([\s\S]*?)```/g,
      (_m, p1) => `<pre><code>${p1}</code></pre>`
    );
    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Headings ###### .. #
    html = html.replace(/^######\s+(.*)$/gm, "<h6>$1</h6>");
    html = html.replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>");
    html = html.replace(/^####\s+(.*)$/gm, "<h4>$1</h4>");
    html = html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
    // Bold and italics
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    // Links [text](url)
    html = html.replace(
      // eslint-disable-next-line no-useless-escape
      /\[([^\]]+)\]\(([^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    // Unordered lists
    html = html.replace(/^(?:-\s+.*(?:\n|$))+?/gm, (block) => {
      const items = block
        .trim()
        .split(/\n/)
        .map((l) => l.replace(/^-\s+/, "").trim())
        .map((c) => `<li>${c}</li>`) //
        .join("");
      return `<ul>${items}</ul>`;
    });
    // Ordered lists
    html = html.replace(/^(?:\d+\.\s+.*(?:\n|$))+?/gm, (block) => {
      const items = block
        .trim()
        .split(/\n/)
        .map((l) => l.replace(/^\d+\.\s+/, "").trim())
        .map((c) => `<li>${c}</li>`) //
        .join("");
      return `<ol>${items}</ol>`;
    });
    // Paragraphs: wrap remaining lines
    html = html
      .split(/\n\n+/)
      .map((p) =>
        /(<h\d|<ul>|<ol>|<pre>|<p>|<table>)/.test(p)
          ? p
          : `<p>${p.replace(/\n/g, "<br/>")}</p>`
      )
      .join("\n");
    return DOMPurify.sanitize(html);
  }, [isMarkdown, textPreview]);

  const toggleAudience = (role: AudienceType) => {
    setAudience((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <Modal popupModal={open} setPopupModal={() => onClose()} outClickCancel>
      <div className="w-[900px] max-w-[95vw]">
        <h2 className="text-xl font-semibold mb-4">Review & annotate upload</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg bg-gray-50 min-h-[550px] flex items-center justify-center w-full md:col-span-2 border-4 border-gray-300">
            {!file && <div className="text-gray-500">No file selected</div>}
            {file && (
              <div className="w-full h-full">
                {isImage && (
                  <div className="w-full flex items-center justify-center h-full">
                    <img
                      src={previewUrl || ""}
                      alt="preview"
                      className="max-h-full object-contain"
                    />
                  </div>
                )}

                {isPdf && (
                  <div className="w-full h-full">
                    <embed
                      src={previewUrl || ""}
                      type="application/pdf"
                      className="w-full h-full rounded"
                    />
                  </div>
                )}

                {isMarkdown && (
                  <div className="w-full h-full overflow-auto bg-white rounded p-3 border">
                    {isReading ? (
                      <div className="text-sm text-gray-500">Reading file…</div>
                    ) : (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: markdownHtml }}
                      />
                    )}
                  </div>
                )}

                {isText && !isMarkdown && (
                  <div className="w-full h-full overflow-auto bg-white rounded p-3 border">
                    {isReading ? (
                      <div className="text-sm text-gray-500">Reading file…</div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {textPreview}
                      </pre>
                    )}
                  </div>
                )}

                {isCsv && (
                  <div className="w-full h-full overflow-auto bg-white rounded p-3 border">
                    {isReading ? (
                      <div className="text-sm text-gray-500">Parsing CSV…</div>
                    ) : csvPreview.length ? (
                      <table className="w-full text-xs">
                        <tbody>
                          {csvPreview.map((row, idx) => (
                            <tr key={idx} className="border-b">
                              {row.map((cell, i) => (
                                <td
                                  key={i}
                                  className="p-1 border-r text-gray-800"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No previewable CSV content
                      </div>
                    )}
                  </div>
                )}

                {isXlsx && (
                  <div className="w-full h-full overflow-auto bg-white rounded p-3 border">
                    {isReading ? (
                      <div className="text-sm text-gray-500">
                        Parsing spreadsheet…
                      </div>
                    ) : xlsxPreview.length ? (
                      <table className="w-full text-xs">
                        <tbody>
                          {xlsxPreview.map((row, idx) => (
                            <tr key={idx} className="border-b">
                              {row.map((cell, i) => (
                                <td
                                  key={i}
                                  className="p-1 border-r text-gray-800"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No previewable spreadsheet content
                      </div>
                    )}
                  </div>
                )}

                {isDocx && (
                  <div className="w-full h-full text-center text-gray-500">
                    <div className="text-5xl mb-3">📝</div>
                    <div>DOCX preview not supported. You can still upload.</div>
                  </div>
                )}

                {!isImage &&
                  !isPdf &&
                  !isMarkdown &&
                  !isCsv &&
                  !isText &&
                  !isXlsx &&
                  !isDocx && (
                    <div className="text-center text-gray-500">
                      <div className="text-5xl mb-3">📦</div>
                      <div>{file.name}</div>
                    </div>
                  )}
              </div>
            )}
          </div>
          <div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oha_primary bg-gray-100"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Resource title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oha_primary bg-gray-100"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Guides, Reports, Agreements"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Audience
                </label>
                <div className="flex gap-4">
                  {["Admins", "Farmers", "Investors"].map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={audience.includes(r as AudienceType)}
                        onChange={() => toggleAudience(r as AudienceType)}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>
              {file && (
                <div className="text-xs text-gray-500">
                  {file.name} • {file.type || "—"} • {readableSize(file.size)}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!file || !title || audience.length === 0 || busy}
                onClick={() => onStart({ title, description, audience })}
                className={`px-4 py-2 rounded-md text-white cursor-pointer ${
                  busy ? "bg-gray-400" : "bg-oha_primary hover:opacity-95"
                }`}
              >
                {busy ? "Uploading..." : "Start Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UploadResourceModal;
