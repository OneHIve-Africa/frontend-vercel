import { Investment } from "@/v1/api/types";
import { DashboardStats } from "@/v1/api/InvestorDashboardApi";

interface ProfileData {
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  phone?: string;
  account_id?: string;
}

export const exportToCSV = (
  investments: Investment[],
  stats: DashboardStats | null | undefined,
  profile: ProfileData | null | undefined
) => {
  const investorName = profile?.user
    ? `${profile.user.first_name || ""} ${profile.user.last_name || ""}`.trim() || "Investor"
    : "Investor";
  const email = profile?.user?.email || "N/A";
  const dateStr = new Date().toLocaleDateString("en-GB");

  const headers = [
    "Reference",
    "Package Type",
    "Hives Count",
    "Amount (GHS)",
    "Status",
    "Purchase Date",
    "Projected Return (GHS)",
  ];

  const rows = investments.map((inv) => {
    const hives = inv.number_of_hives || 1;
    const amount = parseFloat(inv.amount || "0");
    const earned = parseFloat(inv.interest_earned || "0");
    const toEarn = parseFloat(inv.interest_to_be_earned || "0");
    const estReturn = earned + toEarn > 0 ? earned + toEarn : amount * 0.35;
    const date = inv.investment_date
      ? new Date(inv.investment_date).toLocaleDateString("en-GB")
      : "N/A";
    return [
      `"INV-${inv.id}"`,
      `"${inv.hive_status_summary || "Smart Hive"}"`,
      hives,
      amount.toFixed(2),
      `"${inv.investment_status || "Active"}"`,
      `"${date}"`,
      estReturn.toFixed(2),
    ].join(",");
  });

  const totalInvested = stats
    ? parseFloat(stats.total_invested || "0")
    : investments.reduce((acc, i) => acc + parseFloat(i.amount || "0"), 0);
  const totalReturns = stats
    ? parseFloat(stats.expected_returns || "0")
    : totalInvested * 1.35;

  const csvContent = [
    `"ONEHIVE AFRICA - INVESTOR PORTFOLIO STATEMENT"`,
    `"Generated On: ${dateStr}"`,
    `"Investor Name: ${investorName}"`,
    `"Email: ${email}"`,
    `"Total Invested: GHS ${totalInvested.toLocaleString()}"`,
    `"Total Estimated Returns: GHS ${totalReturns.toLocaleString()}"`,
    "",
    headers.join(","),
    ...rows,
    "",
    `"Summary","Total Hives: ${investments.length}","","Total Capital: GHS ${totalInvested.toLocaleString()}","","","Total Est. Return: GHS ${totalReturns.toLocaleString()}"`,
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `OneHive_Statement_${dateStr.replace(/\//g, "-")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printStatement = (
  investments: Investment[],
  stats: DashboardStats | null | undefined,
  profile: ProfileData | null | undefined
) => {
  const investorName = profile?.user
    ? `${profile.user.first_name || ""} ${profile.user.last_name || ""}`.trim() || "OneHive Investor"
    : "OneHive Investor";
  const email = profile?.user?.email || "investor@onehiveafrica.com";
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalInvested = stats
    ? parseFloat(stats.total_invested || "0")
    : investments.reduce((acc, i) => acc + parseFloat(i.amount || "0"), 0);
  const totalReturns = stats
    ? parseFloat(stats.expected_returns || "0")
    : totalInvested * 1.35;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate your printable statement.");
    return;
  }

  const tableRows = investments
    .map((inv) => {
      const hives = inv.number_of_hives || 1;
      const amount = parseFloat(inv.amount || "0");
      const earned = parseFloat(inv.interest_earned || "0");
      const toEarn = parseFloat(inv.interest_to_be_earned || "0");
      const estReturn = earned + toEarn > 0 ? earned + toEarn : amount * 0.35;
      const date = inv.investment_date
        ? new Date(inv.investment_date).toLocaleDateString("en-GB")
        : "N/A";
      return `
        <tr style="border-bottom: 1px solid #e7e5e4;">
          <td style="padding: 10px 12px; font-family: monospace; font-size: 11px;">INV-${inv.id}</td>
          <td style="padding: 10px 12px; font-weight: 600;">${inv.hive_status_summary || "Smart Hive Model"}</td>
          <td style="padding: 10px 12px; text-align: center;">${hives}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 600;">GHS ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; background: #dcfce7; color: #15803d; text-transform: uppercase;">${inv.investment_status || "Active"}</span>
          </td>
          <td style="padding: 10px 12px;">${date}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #b45309;">GHS ${estReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OneHive Africa - Investor Statement</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1c1917; margin: 40px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #d97706; display: flex; align-items: center; gap: 8px; }
          .badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
          .kpi-card { background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px 18px; }
          .kpi-title { font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: 600; }
          .kpi-value { font-size: 20px; font-weight: 800; color: #1c1917; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px; }
          th { background: #f5f5f4; color: #44403c; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d6d3d1; }
          .footer { margin-top: 40px; border-top: 1px solid #e7e5e4; padding-top: 16px; font-size: 11px; color: #78716c; text-align: center; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🐝 OneHive Africa</div>
            <div style="font-size: 12px; color: #78716c; margin-top: 4px;">Smart Apiculture & Commercial Beekeeping Investment Platform</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">Official Statement</span>
            <div style="font-size: 12px; color: #78716c; margin-top: 6px;">Date: ${dateStr}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <div style="color: #78716c; font-size: 11px; text-transform: uppercase;">Investor Details</div>
            <div style="font-weight: 700; font-size: 14px; margin-top: 2px;">${investorName}</div>
            <div style="color: #57534e;">${email}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #78716c; font-size: 11px; text-transform: uppercase;">Account Status</div>
            <div style="font-weight: 700; color: #16a34a; font-size: 14px; margin-top: 2px;">Verified Active Investor</div>
            <div style="color: #57534e;">OneHive Network Ghana</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Total Active Capital</div>
            <div class="kpi-value" style="color: #d97706;">GHS ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Active Beehives</div>
            <div class="kpi-value">${investments.length} Hives</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Target Dividend Payout</div>
            <div class="kpi-value" style="color: #16a34a;">GHS ${totalReturns.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <h4 style="font-size: 14px; margin-bottom: 12px; font-weight: 700;">Hive Investment Portfolio & Allocation Breakdown</h4>
        <table>
          <thead>
            <tr>
              <th>Ref ID</th>
              <th>Package</th>
              <th style="text-align: center;">Hives</th>
              <th style="text-align: right;">Capital</th>
              <th style="text-align: center;">Status</th>
              <th>Date</th>
              <th style="text-align: right;">Est. Return</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <p>OneHive Africa Platform • Smart Apiculture Investments & Environmental Impact</p>
          <p>This statement is an electronically verified record generated on behalf of the registered investor. For assistance, contact support@onehiveafrica.com</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
