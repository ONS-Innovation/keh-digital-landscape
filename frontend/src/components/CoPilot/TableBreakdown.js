import React, { useMemo, useEffect, useRef } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule]);

function TableBreakdown({ data, idField, idHeader, columns, headerMap, computedFields, customCellRenderers = {} }) {
    const gridRef = useRef(null);
    
    const defaultColDef = useMemo(() => ({
      sortable: true,
      filter: true,
      cellStyle: { textAlign: "left" },
      flex: 1,
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
        valueFormatter: !customCellRenderers[key] && key.toLowerCase().includes("rate")
        ? (params) => `${(params.value * 100).toFixed(1)}%`
        : undefined,
        cellRenderer: customCellRenderers[key] || undefined,
      }));
    }, [rowData, idField, idHeader, columns, headerMap, customCellRenderers]);

    const onGridReady = (params) => {
      // Store API reference
      if (gridRef.current) {
        gridRef.current.api = params.api;
        gridRef.current.columnApi = params.columnApi;
      }
    };

    return (
      <div style={{ height: 300}}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          suppressRowVirtualisation={false}
          ensureDomOrder={true}
          suppressColumnVirtualisation={false}
          onGridReady={onGridReady}
          rowRole="row"
          rowAriaRole="row"
          headerRowAriaRole="row"
          overlayNoRowsTemplate="No data available"
          overlayLoadingTemplate="Loading data"
          onFirstDataRendered={params => {
            // Force refresh to ensure ARIA attributes are applied
            if (gridRef.current && gridRef.current.api) {
              gridRef.current.api.refreshCells({ force: true });
            }
          }}
        />
      </div>
    );
  }  

export default TableBreakdown;
