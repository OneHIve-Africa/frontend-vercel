import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table";
import { dateUtils } from "@/v1/utils/dateutils";
import SkeletonRow from "@/v1/features/portfolio/components/SkeletonRow";

import { useProductionStore } from "../store/ProductionStore";

const TableComponent: React.FC = () => {
  const { fetchRecords, records, isLoading } = useProductionStore();

  const tableHeaders = [
    { title: "Date" },
    { title: "Farmer" },
    { title: "Hive ID" },
    { title: "Quantity (Liters)" },
    { title: "Hives Managed" },
    { title: "Region" },
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="rounded-md overflow-hidden">
      <Table className="bg-white rounded-lg hover:text-black">
        <TableCaption>A list of honey production records.</TableCaption>
        <TableHeader className="rounded-t-lg">
          <TableRow className="bg-[#FCFDFD] hover:bg-transparent border-gray-300 uppercase text-black font-semibold">
            {tableHeaders?.map((item, index) => (
              <TableHead key={index} className={`py-5 ${
                  index === 0
                    ? "pl-6"
                    : index === tableHeaders.length - 1
                    ? "pr-6"
                    : ""
                } font-semibold text-black`}>
                {item.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonRow colums={tableHeaders.length} key={idx} />
              ))
            : records.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer border-gray-200"
                >
                  <TableCell className="font-medium py-4 pl-6">
                    {dateUtils.formatDate(item.production_date)}
                  </TableCell>
                  <TableCell className="text-start text-sm font-light">
                    {item.farmer_name || `Farmer #${item.farmer}`}
                  </TableCell>
                  <TableCell className="text-start text-sm font-light">
                    {item.hive_id || `Hive #${item.hive}`}
                  </TableCell>
                  <TableCell className="text-start text-sm font-medium text-oha_primary">
                    {item.honey_produced_liters} L
                  </TableCell>
                  <TableCell className="text-start text-sm font-light">
                    {item.hives_managed}
                  </TableCell>
                   <TableCell className="text-start text-sm font-light pr-6">
                    {item.region || "-"}
                  </TableCell>
                  {/* <TableCell className="text-start text-sm font-light pr-6">
                    <div className="flex justify-end p-2 rounded-full hover:bg-gray-100 w-fit ml-auto">
                        <EllipsisVertical size={16} />
                    </div>
                  </TableCell> */}
                </TableRow>
              ))}
              
            {!isLoading && records.length === 0 && (
                <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-8 text-gray-500">
                        No honey production records found. Adding some entries to get started.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableComponent;
