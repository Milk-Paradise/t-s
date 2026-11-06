import { themeQuartz } from "ag-grid-community";
export const gridTheme = themeQuartz.withParams({
  accentColor: "#5264dd",
  backgroundColor: "#ffffff",
  foregroundColor: "#28354a",
  borderColor: "#e8edf4",
  headerBackgroundColor: "#f7f9fc",
  fontFamily: "Inter, Segoe UI, sans-serif",
  fontSize: 13,
  headerFontSize: 11,
  rowHeight: 45,
  headerHeight: 40,
});
export const defaultColDef = {
  flex: 1,
  minWidth: 115,
  resizable: true,
  sortable: false,
};
export const money = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value));
export const dateLabel = (value) =>
  value ? value.slice(0, 10).split("-").reverse().join(".") : "";
export const rowSelection = {
  mode: "singleRow",
  checkboxes: false,
  enableClickSelection: true,
};
