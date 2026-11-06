import { AgGridReact } from "ag-grid-react";
import {
  gridTheme,
  defaultColDef,
  money,
  dateLabel,
  rowSelection,
} from "../grid";
import { useDeskStore } from "../store/useDeskStore";
const priorities = { 1: "Высокий", 2: "Средний", 3: "Низкий" };
const columns = [
  { field: "id", headerName: "ID", maxWidth: 75, minWidth: 65 },
  { field: "title", headerName: "ЗАДАЧА", minWidth: 260, flex: 2 },
  {
    field: "cost",
    headerName: "СТОИМОСТЬ",
    valueFormatter: (p) => money(p.value),
  },
  {
    field: "due_date",
    headerName: "СРОК",
    valueFormatter: (p) => dateLabel(p.value),
  },
  {
    field: "priority",
    headerName: "ПРИОРИТЕТ",
    cellRenderer: (p) => (
      <span className={`badge priority-${p.value}`}>{priorities[p.value]}</span>
    ),
  },
];
export default function TasksGrid({ tasks, loading }) {
  const selectTask = useDeskStore((state) => state.selectTask);
  return (
    <div className="grid tasks-grid">
      <AgGridReact
        theme={gridTheme}
        columnDefs={columns}
        defaultColDef={{ ...defaultColDef, sortable: true }}
        rowData={tasks}
        loading={loading}
        rowSelection={rowSelection}
        getRowId={(p) => String(p.data.id)}
        overlayNoRowsTemplate="<span>В этом проекте пока нет задач</span>"
        onSelectionChanged={(event) =>
          selectTask(event.api.getSelectedRows()[0] || null)
        }
      />
    </div>
  );
}
