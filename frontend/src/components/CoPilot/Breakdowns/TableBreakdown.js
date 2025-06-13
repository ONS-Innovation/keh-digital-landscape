import React, { useMemo, useRef } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { formatNumberWithCommas } from "../../../utilities/getCommaSeparated";
import { getCellRenderers } from "../../../utilities/getCellRenderers";

ModuleRegistry.registerModules([AllCommunityModule]);

function TableBreakdown({ data, idField, idHeader, columns, headerMap, computedFields, tableContext = "", onViewDataClick }) {
    const gridRef = useRef();
    const containerRef = useRef();
    const cellRenderers = getCellRenderers(onViewDataClick);

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
        valueFormatter: !cellRenderers[key]
          ? key.toLowerCase().includes("rate")
            ? (params) => `${(params.value * 100).toFixed(1)}%`
            : (params) =>
                typeof params.value === "number"
                  ? formatNumberWithCommas(params.value)
                  : params.value
          : undefined,
        cellRenderer: cellRenderers[key] || undefined,
      }));
    }, [rowData, idField, idHeader, columns, headerMap, cellRenderers]);

    // Generate unique aria-label based on context
    const generateAriaLabel = () => {
      if (tableContext) {
        return `${tableContext} - ${idHeader || 'data'} table`;
      }
      return `Data table for ${idHeader || 'data'}`;
    };

    return (
      <div 
        ref={containerRef}
        style={{ height: 300}}
        role="region"
        aria-label={generateAriaLabel()}
        tabIndex="0"
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          onFirstDataRendered={(params) => {
            params.api.ensureIndexVisible(0);
          }}
          getRowId={(params) => params.data[idField]}
          domLayout="normal"
          navigateToNextCell={(params) => {
            return params.nextCellPosition;
          }}
        />
      </div>
    );
  }  

export default TableBreakdown;