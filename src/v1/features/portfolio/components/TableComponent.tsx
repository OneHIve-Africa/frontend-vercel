import { Investment } from "@/v1/api/types";
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

interface TableComponentProps {
  investments: Investment[];
}

const TableComponent: React.FC<TableComponentProps> = ({ investments }) => {
  return (
    <div className="rounded-md overflow-hidden">
      {/* Desktop/Tablet table */}
      <div className="hidden md:block">
        <Table className="bg-white rounded-lg hover:text-black shadow">
        <TableCaption>A list of your recent investments.</TableCaption>
        <TableHeader className="rounded-t-lg">
          <TableRow className="bg-[#FCFDFD] hover:bg-transparent border-gray-300 uppercase text-black font-semibold">
            <TableHead className="p-5 font-semibold text-black">ID</TableHead>
            <TableHead className="font-semibold text-black text-center">
              Investment Amount
            </TableHead>
            <TableHead className="font-semibold text-black text-center">
              Investment Date
            </TableHead>
            <TableHead className="font-semibold text-black text-center">
              Interest Earned
            </TableHead>
            <TableHead className="font-semibold text-black text-center">
              Maturity Date
            </TableHead>
            <TableHead className="font-semibold text-black text-center">
              Investment Status
            </TableHead>
            <TableHead className="font-semibold text-black text-center">
              Hive Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-gray-50 cursor-pointer border-gray-200"
            >
              <TableCell className="font-medium px-5 py-4">{item.id}</TableCell>
              <TableCell className="text-center text-sm font-light">
                {item.amount}
              </TableCell>
              <TableCell className="text-center text-sm font-light">
                {dateUtils.formatDate(item.investment_date)}
              </TableCell>
              <TableCell className="text-center text-sm font-light">
                {item.interest_earned}
              </TableCell>
              <TableCell className="text-center text-sm font-light">
                {dateUtils.formatDate(item.maturity_date)}
              </TableCell>
              <TableCell className="text-center text-sm font-light">
                <div
                  className={`rounded-md px-4 py-2 text-center font-semibold text-xs capitalize ${
                    item.investment_status === "active"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {item.investment_status}
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={`rounded-md px-4 py-2 text-center font-semibold text-xs ${
                    item.hive_status_summary.includes('All Completed') || item.hive_status_summary.includes('All In Progress')
                      ? "text-green-500"
                      : item.hive_status_summary.includes('All Inactive') || item.hive_status_summary === 'No hives'
                      ? "text-gray-500"
                      : "text-orange-500"
                  }`}
                >
                  {item.hive_status_summary}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {investments.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">ID</div>
              <div className="text-sm font-semibold">{item.id}</div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="text-sm text-gray-500">Investment Amount</div>
              <div className="text-sm">{item.amount}</div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="text-sm text-gray-500">Investment Date</div>
              <div className="text-sm">{dateUtils.formatDate(item.investment_date)}</div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="text-sm text-gray-500">Interest Earned</div>
              <div className="text-sm">{item.interest_earned}</div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="text-sm text-gray-500">Maturity Date</div>
              <div className="text-sm">{dateUtils.formatDate(item.maturity_date)}</div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="text-sm text-gray-500">Investment Status</div>
              <div
                className={`rounded-md px-2 py-1 text-center font-semibold text-xs capitalize ${
                  item.investment_status === "active"
                    ? "text-green-600 bg-green-100"
                    : "text-red-600 bg-red-100"
                }`}
              >
                {item.investment_status}
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="text-sm text-gray-500">Hive Status</div>
              <div className={`rounded-md px-2 py-1 text-center font-semibold text-xs ${
                item.hive_status_summary.includes('All Completed') || item.hive_status_summary.includes('All In Progress')
                  ? "text-green-500"
                  : item.hive_status_summary.includes('All Inactive') || item.hive_status_summary === 'No hives'
                  ? "text-gray-500"
                  : "text-orange-500"
              }`}>
                {item.hive_status_summary}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableComponent;
