import { useEffect } from "react";
// import { format } from "date-fns";
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
import { usePortfolioStore } from "@/v1/features/portfolio/store/PortfolioStore";
import SkeletonRow from "@/v1/features/portfolio/components/SkeletonRow";

const TableComponent: React.FC = () => {
  const { fetchData, filteredData, isLoading } = usePortfolioStore();

  const tableHeaders = [
    { title: "Hive ID" },
    { title: "Location" },
    { title: "Assigned Farmer" },
    { title: "Status" },
  ];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="rounded-md overflow-hidden">
      <Table className="bg-white rounded-lg hover:text-black shadow">
        <TableCaption>A list of your farmer.</TableCaption>
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
            : filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer border-gray-200"
                >
                  <TableCell className="font-medium py-4 pl-6">{item.id}</TableCell>
                  <TableCell className="text-start text-sm font-light">
                    {item.investmentAmount}
                  </TableCell>
                  <TableCell className="text-start text-sm font-light">
                    {dateUtils.formatDate(item.investmentDate)}
                  </TableCell>

                  <TableCell className=" text-sm font-light flex gap-3 pr-6">
                    <div className="rounded-[4.5px] text-oha_secondary bg-green-100 font-semibold text-xs px-4 py-2">
                      Completed
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableComponent;
