import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { request } from "../api/http";
import {
  gridTheme,
  defaultColDef,
  money,
  dateLabel,
  rowSelection,
} from "../grid";
import { useDeskStore } from "../store/useDeskStore";

const columns = [
  { field: "id", headerName: "ID", maxWidth: 75, minWidth: 65 },
  { field: "name", headerName: "ПРОЕКТ", minWidth: 260, flex: 2 },
  {
    field: "budget",
    headerName: "БЮДЖЕТ",
    valueFormatter: (p) => (p.value == null ? "" : money(p.value)),
  },
  {
    field: "start_date",
    headerName: "НАЧАЛО",
    valueFormatter: (p) => dateLabel(p.value),
  },
  {
    field: "team_size",
    headerName: "КОМАНДА",
    valueFormatter: (p) => (p.value == null ? "" : `${p.value} чел.`),
  },
];
export default function ProjectsGrid({ revision, onTotal, onError, onLoaded }) {
  const selectProject = useDeskStore((state) => state.selectProject);
  const datasource = useMemo(
    () => ({
      getRows: async (params) => {
        try {
          const data = await request(
            `/projects?offset=${params.startRow}&limit=${params.endRow - params.startRow}`,
          );
          params.successCallback(data.items, data.total);
          onTotal(data.total);
          onLoaded();
        } catch (error) {
          params.failCallback();
          onError(error.message);
        }
      },
    }),
    [revision, onTotal, onError, onLoaded],
  );
  return (
    <div className="grid projects-grid">
      <AgGridReact
        theme={gridTheme}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        rowModelType="infinite"
        datasource={datasource}
        cacheBlockSize={50}
        maxBlocksInCache={5}
        rowSelection={rowSelection}
        getRowId={(p) => String(p.data.id)}
        onSelectionChanged={(event) =>
          selectProject(event.api.getSelectedRows()[0] || null)
        }
      />
    </div>
  );
}
