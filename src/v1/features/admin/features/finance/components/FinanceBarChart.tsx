import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface MonthlyRevenueData {
  monthly_revenue_trend: {
    [month: string]: string; // e.g. "January": "100.00"
  };
}

interface FinanceBarChartProps {
  data: MonthlyRevenueData;
}

const FinanceBarChart: React.FC<FinanceBarChartProps> = ({ data }) => {
  const monthlyRevenue = data.monthly_revenue_trend;

  const months = Object.keys(monthlyRevenue);
  const revenueValues = Object.values(monthlyRevenue).map((val) =>
    parseFloat(val)
  );

  const ChartData: {
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } = {
    series: [
      {
        name: "Monthly Revenue",
        data: revenueValues,
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        fontFamily: `inherit`,
        foreColor: "#a1aab2",
        toolbar: {
          show: false,
        },
      },
      colors: ["#7987FF"],
      plotOptions: {
        bar: {
          horizontal: false,

          borderRadius: 4,

          columnWidth: "20%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: months,
        labels: {
          formatter: (value: string) => value.slice(0, 3),
        },
        axisBorder: {
          color: "rgba(173,181,189,0.3)",
        },
      },
      yaxis: {
        title: {
          text: "$ (thousands)",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter(val: number) {
            return `$ ${val.toFixed(2)} thousands`;
          },
        },
      },
      grid: {
        show: false,
      },
      legend: {
        show: true,
        position: "bottom",
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            yaxis: {
              show: false,
            },
          },
        },
      ],
    },
  };

  return (
    <div>
      <Chart
        options={ChartData.options}
        series={ChartData.series}
        type="bar"
        height="300px"
        width="100%"
      />
    </div>
  );
};

export default FinanceBarChart;
