import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import FarmersApi from "@/v1/api/FarmerApi";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

type ParsedRow = Record<string, any>;
interface BulkUploadResult {
  created_count: number;
  error_count: number;
  created: Array<{ id: number; email: string; row: number }>;
  errors: Array<{ row: number; message: string } | string>;
}

const EXPECTED_HEADERS = [
  "email",
  "password",
  "first_name",
  "last_name",
  "primary_phone",
  "other_phone",
  "gender",
  "date_of_birth",
  "id_number",
  "region",
  "district",
  "town",
  // optional extra the API accepts
  "profile_email",
];

const BulkUploadModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    setRows([]);
    if (!f) return;
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<ParsedRow>(sheet, {
          defval: "",
          raw: false,
          blankrows: false,
        });
        // normalize headers to lower_snake
        const normalized = json.map((r) => {
          const out: ParsedRow = {};
          Object.keys(r).forEach((k) => {
            const key = String(k).trim().toLowerCase().replace(/\s+/g, "_");
            out[key] = (r as any)[k];
          });
          // backfill profile_email if missing
          if (!out.profile_email && out.email) out.profile_email = out.email;
          return out;
        });
        setRows(normalized);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file. Ensure it's a CSV or Excel with the first sheet containing data.");
      } finally {
        setIsParsing(false);
      }
    };
    // supports CSV and Excel alike
    reader.readAsArrayBuffer(f);
  };

  const headerIssues = useMemo(() => {
    if (!rows.length) return [] as string[];
    const present = new Set(Object.keys(rows[0] ?? {}));
    const missing = EXPECTED_HEADERS.filter((h) => !present.has(h));
    return missing;
  }, [rows]);

  const handleSubmit = async () => {
    if (!file) return toast.error("Select a CSV/Excel file first");
    try {
      setIsSubmitting(true);
      const api = FarmersApi.getInstance();
      const form = new FormData();
      form.append("file", file);
      const res = await api.bulkUploadFarmers(form);
      if ((res as any).error) {
        toast.error((res as any).message || "Bulk upload failed");
        return;
      }
      // show summary from server
      const data = (res as any).data as BulkUploadResult | undefined;
      if (data) {
        setResult(data);
        onSuccess(); // refresh table data in background
        toast.success(
          `Created ${data.created_count}, Errors ${data.error_count}`
        );
      } else {
        toast.success("Bulk upload completed");
        onSuccess();
      }
    } catch (e) {
      console.error(e);
      toast.error("Bulk upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([EXPECTED_HEADERS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "farmers_template.csv");
  };

  return (
    <div className="w-[800px] p-6">
      <h3 className="text-lg font-semibold mb-4">Bulk Upload Farmers (CSV/Excel)</h3>

      <div className="space-y-4">
        {result && (
          <div className="rounded-md border border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <span className="font-medium">Summary:</span> Created {result.created_count}, Errors {result.error_count}
              </p>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-xs underline"
              >
                Clear
              </button>
            </div>
            {!!result.created?.length && (
              <div className="mt-2">
                <p className="text-sm font-medium">Created</p>
                <div className="max-h-40 overflow-auto border border-gray-200 rounded">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white sticky top-0">
                      <tr>
                        <th className="px-2 py-1 border-b">Row</th>
                        <th className="px-2 py-1 border-b">ID</th>
                        <th className="px-2 py-1 border-b">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.created.map((c, i) => (
                        <tr key={i} className="odd:bg-gray-50">
                          <td className="px-2 py-1 border-b">{c.row}</td>
                          <td className="px-2 py-1 border-b">{c.id}</td>
                          <td className="px-2 py-1 border-b">{c.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!!result.errors?.length && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700">Errors</p>
                <div className="max-h-40 overflow-auto border border-gray-200 rounded">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white sticky top-0">
                      <tr>
                        <th className="px-2 py-1 border-b">Row</th>
                        <th className="px-2 py-1 border-b">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, i) => {
                        const row = typeof err === "string" ? "-" : (err as any).row ?? "-";
                        const message = typeof err === "string" ? err : (err as any).message ?? JSON.stringify(err);
                        return (
                          <tr key={i} className="odd:bg-gray-50">
                            <td className="px-2 py-1 border-b">{row}</td>
                            <td className="px-2 py-1 border-b">{message}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Upload File</label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            {file ? (
              <div className="flex items-center justify-between text-sm">
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex gap-2">
                  <label className="px-3 py-1 rounded bg-gray-100 cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={(e) => handleFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-red-100 text-red-700"
                    onClick={() => handleFile(null)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer">
                <span>Click to upload CSV/Excel</span>
                <span className="text-xs">CSV, XLSX</span>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={downloadTemplate}
            className="px-3 py-1 rounded bg-gray-100"
          >
            Download Template
          </button>
          {!!headerIssues.length && (
            <p className="text-xs text-red-600">
              Missing headers: {headerIssues.join(", ")}
            </p>
          )}
        </div>

        <div className="border border-gray-200 rounded-md max-h-[280px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                {(rows[0] ? Object.keys(rows[0]) : EXPECTED_HEADERS).map((h) => (
                  <th key={h} className="px-3 py-2 border-b border-gray-200 capitalize">
                    {h.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isParsing ? (
                <tr>
                  <td className="px-3 py-4" colSpan={EXPECTED_HEADERS.length}>
                    Parsing file...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.slice(0, 100).map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    {(rows[0] ? Object.keys(rows[0]) : EXPECTED_HEADERS).map((h) => (
                      <td key={h} className="px-3 py-2 border-b border-gray-100">
                        {String(r[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={EXPECTED_HEADERS.length}>
                    No data yet. Upload a CSV/Excel to preview here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700"
            disabled={isSubmitting}
          >
            {result ? "Close" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-oha_primary text-white px-6 py-2 rounded disabled:opacity-60"
            disabled={!file || isParsing || isSubmitting}
          >
            {isSubmitting ? "Uploading..." : result ? "Re-upload" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
