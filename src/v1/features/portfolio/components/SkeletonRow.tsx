import { TableRow, TableCell } from "@/components/Table";

interface propsType {
  colums: number;
}
const SkeletonRow: React.FC<propsType> = ({ colums = 6 }) => (
  <TableRow className="animate-pulse border-none cursor-pointer">
    {Array.from({ length: colums }).map((_, i) => (
      <TableCell key={i} className="border-none">
        <div className="h-6 bg-gray-300 rounded w-full"></div>
      </TableCell>
    ))}
  </TableRow>
);

export default SkeletonRow;
