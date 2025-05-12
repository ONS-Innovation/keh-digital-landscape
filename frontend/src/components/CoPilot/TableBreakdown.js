import React, { useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule]);

function TableBreakdown({ data, idField, idHeader, columns, headerMap, computedFields }) {
    const defaultColDef = useMemo(() => ({
      sortable: true,
      filter: true,
      cellStyle: { textAlign: "center" },
      flex: 1,
      maxWidth: 200,
    }), []);
  
    const rowData = useMemo(() => {
      return Object.entries(data).map(([id, stats]) => ({
        [idField]: id || "(unknown)",
        ...stats,
        ...(computedFields ? computedFields(stats) : {}),
      }));
    }, [data, idField, computedFields]);
  
    const colDefs = useMemo(() => {
      if (!rowData.length) return [];
  
      const keys = [idField, ...columns];
      return keys.map((key) => ({
        field: key,
        headerName: key === idField ? idHeader : headerMap[key] || key,
        valueFormatter: (params) =>
          key.toLowerCase().includes("rate")
            ? `${(params.value * 100).toFixed(1)}%`
            : params.value,
      }));
    }, [rowData, idField, idHeader, columns, headerMap]);
  
    return (
      <div style={{ height: 300, minWidth: 750 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
    );
  }  

export default TableBreakdown;
