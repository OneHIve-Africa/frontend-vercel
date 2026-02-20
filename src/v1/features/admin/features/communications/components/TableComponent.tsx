import { useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table";
import { useAdminUsersStore } from "../store/AdminUsersStore";

const TableComponent: React.FC = () => {
  const {
    users,
    filter,
    fetchAll,
    isLoading,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
  } = useAdminUsersStore();

  const filteredUsers = useMemo(() => {
    const q = (filter ?? "").trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email ?? "", String(u.id), u.type]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, filter]);

  const allVisibleIds = useMemo(
    () =>
      filteredUsers
        .map((u) => Number(u.user))
        .filter((id) => Number.isFinite(id) && id > 0),
    [filteredUsers]
  );
  const allVisibleSelected = useMemo(
    () =>
      allVisibleIds.every((id) => selectedIds.has(id)) &&
      allVisibleIds.length > 0,
    [allVisibleIds, selectedIds]
  );

  useEffect(() => {
    if (!users.length) {
      fetchAll();
    }
  }, [users.length, fetchAll]);

  return (
    <div className="rounded-md overflow-hidden">
      <Table className="bg-white rounded-lg hover:text-black shadow">
        <TableCaption>Select users to message.</TableCaption>
        <TableHeader className="rounded-t-lg">
          <TableRow className="bg-[#FCFDFD] hover:bg-transparent border-gray-300 uppercase text-black font-semibold">
            <TableHead className="py-5 font-semibold text-oha_primary w-10">
              <input
                type="checkbox"
                aria-label="Select all"
                className="cursor-pointer"
                checked={allVisibleSelected}
                onChange={(e) => {
                  if (e.target.checked) selectAll(allVisibleIds);
                  else clearSelection();
                }}
              />
            </TableHead>
            <TableHead className="py-5 font-semibold text-oha_primary">
              Name
            </TableHead>
            <TableHead className="py-5 font-semibold text-oha_primary">
              Email
            </TableHead>
            <TableHead className="py-5 font-semibold text-oha_primary">
              Type
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-6 text-center text-sm text-gray-500"
              >
                Loading users...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && filteredUsers.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-6 text-center text-sm text-gray-500"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            filteredUsers.map((u) => (
              <TableRow
                key={u.user}
                className="hover:bg-gray-50 border-gray-200"
              >
                <TableCell className="py-3">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={selectedIds.has(u.user)}
                    onChange={() => toggleSelect(u.user)}
                  />
                </TableCell>
                <TableCell className="text-sm">{u.name}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {u.email ?? "—"}
                </TableCell>
                <TableCell className="text-sm capitalize">{u.type}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableComponent;
