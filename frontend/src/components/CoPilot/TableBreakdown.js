import React, { useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const headerMap = {
    language: "Language",
    suggestions: "Suggestions",
    acceptances: "Acceptances",
    acceptanceRate: "Acceptance Rate",
    linesSuggested: "Lines of Code Suggested",
    linesAccepted: "Lines of Code Accepted",
    lineAcceptanceRate: "Line Acceptance Rate",
    chats: "Chats",
    insertions: "Insertions",
    copies: "Copies",
    insertionRate: "Insertion Rate",
    copyRate: "Copy Rate",
};

function TableBreakdown({ data }) {

    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            filter: true,
            cellStyle: { textAlign: "center" },
        };
    }, []);

    const rowData = useMemo(() => {
        return Object.entries(data).map(([language, stats]) => ({
            language: language || "(unknown)",
            ...stats,
            ...(stats.suggestions
                ? { acceptanceRate: stats.acceptances / stats.suggestions }
                : {}),
            ...(stats.linesSuggested
                ? { lineAcceptanceRate: stats.linesAccepted / stats.linesSuggested }
                : {}),
        }));
    }, [data]);

    const colDefs = useMemo(() => {
        if (!rowData.length) return [];

        const sampleRow = rowData[0];
        return Object.keys(sampleRow).map((key) => ({
            field: key,
            headerName: headerMap[key] || key,
            valueFormatter: (params) =>
                key.toLowerCase().includes("rate")
                    ? `${(params.value * 100).toFixed(1)}%`
                    : params.value,
        }));
    }, [rowData]);

    return (
        <div className="ag-theme-quartz" style={{ height: 300 }}>
            <AgGridReact
            rowData={rowData} 
            columnDefs={colDefs} 
            defaultColDef={defaultColDef} 
            pagination={true}
            paginationPageSize={10}/>
        </div>
    );
}

export default TableBreakdown;
