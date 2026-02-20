/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table";
import SkeletonRow from "@/v1/features/portfolio/components/SkeletonRow";

interface TableComponentProps {
  data?: any[];
  isLoading?: boolean;
  tableHeaders: { title: string; key: string }[];
  tablename: string;
}

const TableComponent: React.FC<TableComponentProps> = ({
  data = [],
  tableHeaders,
  isLoading = false,
  tablename = "oneHive",
}) => {
  return (
    <div className="rounded-md overflow-hidden">
      <Table className="bg-white rounded-lg hover:text-black shadow">
        <TableCaption>
          {data?.length < 1
            ? `No ${tablename} added yet`
            : `A list of your ${tablename}s.`}
        </TableCaption>

        {/* Table Head */}
        <TableHeader className="rounded-t-lg">
          <TableRow className="bg-[#FCFDFD] hover:bg-transparent border-gray-300 capitalize text-black font-semibold">
            {tableHeaders.map((item, index) => (
              <TableHead
                key={index}
                className={`py-5 ${
                  index === 0
                    ? "pl-6"
                    : index === tableHeaders.length - 1
                    ? "pr-6"
                    : ""
                } font-semibold text-black`}
              >
                {item.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonRow colums={tableHeaders.length} key={idx} />
              ))
            : data?.map((item, rowIdx) => (
                <TableRow
                  key={item.id || rowIdx}
                  className="hover:bg-gray-50 cursor-pointer border-gray-200"
                >
                  {tableHeaders.map((header, colIdx) => (
                    <TableCell
                      key={colIdx}
                      className={`text-sm font-light ${
                        colIdx === 0 ? "pl-6" : colIdx === tableHeaders.length - 1 ? "pr-6" : ""
                      }`}
                    >
                      {item[header.key] ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableComponent;
