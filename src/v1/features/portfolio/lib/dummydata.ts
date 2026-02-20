import { HiveStatus, InvestmentRecord, InvestmentStatus } from "./types";

const STATUS_OPTIONS: InvestmentStatus[] = [
  "Active",
  "Completed",
  "Pending",
  "Terminated",
];

const HIVE_STATUS_OPTIONS: HiveStatus[] = [
  "Under Construction",
  "Deployed",
  "Colonized",
  "Uncolonized",
  "Due Harvest",
];

const DUMMY_DATA: InvestmentRecord[] = [
  {
    id: "00001",
    investmentAmount: "GHS 5,000",
    investmentDate: "04/07/2025",
    interestEarned: "GHS 5,000",
    maturityDate: "04/07/2025",
    investmentStatus: "Completed",
    hiveStatus: "Under Construction",
  },
  {
    id: "00002",
    investmentAmount: "GHS 7,500",
    investmentDate: "05/07/2025",
    interestEarned: "GHS 7,500",
    maturityDate: "05/07/2025",
    investmentStatus: "Active",
    hiveStatus: "Deployed",
  },
  {
    id: "00003",
    investmentAmount: "GHS 10,000",
    investmentDate: "06/07/2025",
    interestEarned: "GHS 10,000",
    maturityDate: "06/07/2025",
    investmentStatus: "Completed",
    hiveStatus: "Colonized",
  },
  {
    id: "00004",
    investmentAmount: "GHS 3,000",
    investmentDate: "07/07/2025",
    interestEarned: "GHS 3,000",
    maturityDate: "07/07/2025",
    investmentStatus: "Pending",
    hiveStatus: "Uncolonized",
  },
  {
    id: "00005",
    investmentAmount: "GHS 8,000",
    investmentDate: "08/07/2025",
    interestEarned: "GHS 8,000",
    maturityDate: "08/07/2025",
    investmentStatus: "Terminated",
    hiveStatus: "Due Harvest",
  },
  {
    id: "00006",
    investmentAmount: "GHS 6,500",
    investmentDate: "09/07/2025",
    interestEarned: "GHS 6,500",
    maturityDate: "09/07/2025",
    investmentStatus: "Active",
    hiveStatus: "Deployed",
  },
  {
    id: "00007",
    investmentAmount: "GHS 4,500",
    investmentDate: "10/07/2025",
    interestEarned: "GHS 4,500",
    maturityDate: "10/07/2025",
    investmentStatus: "Completed",
    hiveStatus: "Colonized",
  },
  {
    id: "00008",
    investmentAmount: "GHS 9,000",
    investmentDate: "11/07/2025",
    interestEarned: "GHS 9,000",
    maturityDate: "11/07/2025",
    investmentStatus: "Pending",
    hiveStatus: "Uncolonized",
  },
  {
    id: "00009",
    investmentAmount: "GHS 2,500",
    investmentDate: "12/07/2025",
    interestEarned: "GHS 2,500",
    maturityDate: "12/07/2025",
    investmentStatus: "Terminated",
    hiveStatus: "Due Harvest",
  },
  {
    id: "00010",
    investmentAmount: "GHS 7,000",
    investmentDate: "13/07/2025",
    interestEarned: "GHS 7,000",
    maturityDate: "13/07/2025",
    investmentStatus: "Active",
    hiveStatus: "Deployed",
  },
];

export { STATUS_OPTIONS, DUMMY_DATA, HIVE_STATUS_OPTIONS };
