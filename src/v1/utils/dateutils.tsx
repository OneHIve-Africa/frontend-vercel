import { parse, format, isValid } from "date-fns";

/**
 * Type definitions for date utility functions
 */
type DateInput = string | Date | number | null | undefined;
type DateFormat = string;

/**
 * Date formatting utility functions using date-fns with TypeScript type safety
 */
export const dateUtils = {
  /**
   * Formats a date string from MM/DD/YYYY to a specified output format
   * @param dateString - Date string in MM/DD/YYYY format (e.g., "04/07/2025")
   * @param outputFormat - Desired output format (default: "yyyy-MM-dd")
   * @returns Formatted date string or empty string if invalid
   */
  formatDate: (
    dateString: string | null | undefined,
    outputFormat: DateFormat = "dd/MM/yyyy"
  ): string => {
    try {
      if (!dateString) return "";

      const dateObject = new Date(dateString);

      if (!isValid(dateObject)) {
        // If direct parsing fails, try with date-fns for specific formats if needed
        const parsedDate = parse(dateString, "MM/dd/yyyy", new Date());
        if (isValid(parsedDate)) {
          return format(parsedDate, outputFormat);
        }
        console.warn(`Invalid date value: ${dateString}`);
        return "";
      }

      return format(dateObject, outputFormat);
    } catch (error) {
      console.error(
        `Error formatting date: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return "";
    }
  },

  /**
   * Flexible date formatter that tries to determine the input format automatically
   * @param dateValue - Date value (string, Date object, or timestamp)
   * @param outputFormat - Desired output format (default: "yyyy-MM-dd")
   * @returns Formatted date string or empty string if invalid
   */
  formatDateFlexible: (
    dateValue: DateInput,
    outputFormat: DateFormat = "yyyy-MM-dd"
  ): string => {
    try {
      if (!dateValue) return "";

      let dateObject: Date;

      // Handle different input types
      if (dateValue instanceof Date) {
        dateObject = dateValue;
      } else if (typeof dateValue === "string") {
        // Check for MM/DD/YYYY format
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
          dateObject = parse(dateValue, "MM/dd/yyyy", new Date());
        }
        // Check for DD/MM/YYYY format
        else if (
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(dateValue)
        ) {
          dateObject = parse(dateValue, "dd/MM/yyyy", new Date());
        }
        // ISO format: YYYY-MM-DD
        else if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateValue)) {
          dateObject = parse(dateValue, "yyyy-MM-dd", new Date());
        }
        // Let date-fns try to parse it as a fallback
        else {
          dateObject = new Date(dateValue);
        }
      } else if (typeof dateValue === "number") {
        // Assume it's a timestamp
        dateObject = new Date(dateValue);
      } else {
        return "";
      }

      if (!isValid(dateObject)) {
        console.warn(`Could not parse date value: ${String(dateValue)}`);
        return "";
      }

      return format(dateObject, outputFormat);
    } catch (error) {
      console.error(
        `Error in flexible date formatting: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return "";
    }
  },

  /**
   * Type guard to check if a string is a valid date in MM/DD/YYYY format
   * @param value - String to check
   * @returns Whether the string is a valid date in MM/DD/YYYY format
   */
  isValidMMDDYYYYDate: (value: string): boolean => {
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      return false;
    }

    const parsedDate = parse(value, "MM/dd/yyyy", new Date());
    return isValid(parsedDate);
  },

  /**
   * Safely formats an investment date for your specific use case
   * @param investmentDate - The investment date to format
   * @returns Formatted date string in YYYY-MM-DD format or empty string if invalid
   */
  formatInvestmentDate: (investmentDate: string): string => {
    // For your specific case with "04/07/2025"
    if (!investmentDate) return "";

    try {
      const parsedDate = parse(investmentDate, "MM/dd/yyyy", new Date());
      if (!isValid(parsedDate)) {
        return "";
      }
      return format(parsedDate, "yyyy-MM-dd");
    } catch {
      return "";
    }
  },
};
