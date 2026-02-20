/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Button } from "@/components/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { FilterIcon, RefreshCwIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "../store/PortfolioStore";
import { DUMMY_DATA, STATUS_OPTIONS } from "../lib/dummydata";
import { HiveStatus } from "./../lib/types";

const FilterComponent: React.FC = () => {
  const { filters, applyFilters, resetFilters } = usePortfolioStore();

  const handleDateChange = (d: Date | null) => {
    const newDate = d ? d.toISOString() : "";
    applyFilters({ ...filters, date: newDate });
  };

  const handleHiveIdChange = (value: string) => {
    applyFilters({ ...filters, hiveId: value });
  };

  const handleHiveStatusChange = (value: string) => {
    applyFilters({ ...filters, hiveStatus: value as HiveStatus | "all" });
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <div className="flex items-center justify-between gap-4 w-full h-full">
      <div className="border-r-2 border-r-gray-300/45 px-4 flex-1 py-2 h-full">
        <FilterIcon className="w-5 h-5 text-gray-700" />
      </div>
      <div className="border-r-2 border-r-gray-300/45 px-4 h-fit flex-1 py-2 whitespace-nowrap">
        Filter By
      </div>

      {/* Date Filter */}
      <div className="border-r-2 border-r-gray-300/45 px-4 flex-1 py-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "w-[240px] justify-start text-left font-normal bg-white border-none shadow-none focus:border-none focus:outline-none outline-none",
                !filters.date && "text-black"
              )}
            >
              {filters.date ? (
                format(new Date(filters.date), "PPP")
              ) : (
                <span>Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <DatePicker
              selected={filters.date ? new Date(filters.date) : null}
              onChange={(d: Date | null) => handleDateChange(d)}
              className="uid"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Hive ID Filter */}
      <div className="border-r-2 border-r-gray-300/45 px-4 flex-1 py-2">
        <Select onValueChange={(value: string) => handleHiveIdChange(value)}>
          <SelectTrigger className="w-40 border-none shadow-none focus:border-none outline-none focus:outline-none">
            <SelectValue placeholder="Hive ID" />
          </SelectTrigger>
          <SelectContent className="bg-white w-72 py-4 text-black">
            {DUMMY_DATA.map((data) => (
              <SelectItem
                key={data.id}
                value={data.id}
                className="px-5 hover:bg-gray-200 py-4"
              >
                {data.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hive Status Filter */}
      <div className="border-r-2 border-r-gray-300/45 px-4 flex-1 py-2">
        <Select
          onValueChange={(value: string) => handleHiveStatusChange(value)}
        >
          <SelectTrigger className="w-40 border-none shadow-none focus:border-none outline-none focus:outline-none">
            <SelectValue placeholder="Hive Status" />
          </SelectTrigger>
          <SelectContent className="bg-white w-72 py-4 text-black">
            {STATUS_OPTIONS.map((data) => (
              <SelectItem
                key={data}
                value={data}
                className="px-5 hover:bg-gray-200 py-4"
              >
                {data}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <div>
        <Button
          className="text-red-500 shadow-none bg-white h-full"
          onClick={handleReset}
        >
          <RefreshCwIcon className="w-5 h-5 mr-2" />
          Reset Filter
        </Button>
      </div>
    </div>
  );
};

export default FilterComponent;
