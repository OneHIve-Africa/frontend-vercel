import React, { useEffect, useMemo, useState } from "react";
import ResourcesApi, { type ResourceItem } from "@/v1/api/ResourcesApi";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table";
import { Download } from "lucide-react";
import ResourcePreviewModal from "@/v1/features/resources/components/ResourcePreviewModal";
import { dateUtils } from "@/v1/utils/dateutils";

const ResourcesTable: React.FC = () => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState<ResourceItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      const api = ResourcesApi.getInstance();
      const res = await api.listResources();
      if (!mounted) return;
      if ("data" in res && res.data) {
        setItems(res.data);
      } else if ("error" in res) {
        const msg = typeof res.error === "string" ? res.error : "Failed to load resources";
        setError(msg);
      } else {
        setError("Failed to load resources");
      }
      setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const headers = useMemo(
    () => [
      { title: "Title" },
      { title: "Access" },
      { title: "Created By" },
      { title: "Created" },
      { title: "Download" },
    ],
    []
  );

  return (
    <div className="rounded-md overflow-hidden">
      <Table className="bg-white rounded-lg hover:text-black shadow">
        <TableCaption>Uploaded resources.</TableCaption>
        <TableHeader className="rounded-t-lg">
          <TableRow className="bg-[#FCFDFD] hover:bg-transparent border-gray-300 uppercase text-black font-semibold">
            {headers.map((h, index) => (
              <TableHead
                key={h.title}
                className={`py-5 ${index === 0 ? "pl-6" : index === headers.length - 1 ? "pr-6" : ""} font-semibold text-oha_primary`}
              >
                {h.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="border-gray-200">
                {headers.map((_, c) => (
                  <TableCell key={c} className={`${c === 0 ? "pl-6" : c === headers.length - 1 ? "pr-6" : ""}`}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="py-6 text-center text-sm text-red-600">
                {error}
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="py-6 text-center text-sm text-gray-500">
                No resources yet.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-gray-50 cursor-pointer border-gray-200"
                onClick={() => {
                  setSelected(item);
                  setPreviewOpen(true);
                }}
              >
                <TableCell className="font-medium py-4 pl-6">{item.title}</TableCell>
                <TableCell className="text-start text-sm font-light">{item.accessed_by}</TableCell>
                <TableCell className="text-start text-sm font-light">{item.created_by_email}</TableCell>
                <TableCell className="text-start text-sm font-light">{dateUtils.formatDate(item.created_at)}</TableCell>
                <TableCell className="text-center text-sm font-light pr-6">
                  <a
                    href={item.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download />
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ResourcePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} item={selected || undefined} />
    </div>
  );
};

export default ResourcesTable;
