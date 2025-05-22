import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const AcceptanceGraph = ({ data }) => {
  return (
    <div className="copilot-graph-container">
      <ResponsiveContainer>
        <ComposedChart
          width={400}
          height={300}
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#f5f5f5" vertical={false} />
          <XAxis
            dataKey="date"
            interval={data.length - 2}
            tickLine={false}
            axisLine={{ stroke: "#f5f5f5" }}
          />
          <Tooltip wrapperStyle={{color: "black"}} formatter={(value, name) =>
            name === "Acceptance Rate" ? `${value.toFixed(2)}%` : value
          } />
          <Legend verticalAlign="top" align="left" height={36} />
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey="acceptances"
            barSize={20}
            fill="#70c4e6"
            yAxisId="left"
            legendType="rect"
            name="Acceptances"
          />
          <Line
            dot={false}
            strokeWidth={2}
            strokeLinecap="round"
            type="monotone"
            dataKey="acceptanceRate"
            stroke="#3B7AD9"
            yAxisId="right"
            legendType="rect"
            name="Acceptance Rate"
          />
          <YAxis
            tickLine={false}
            yAxisId="left"
            axisLine={{ stroke: "#f5f5f5" }}
            domain={[0, "dataMax + 5"]}
            tickCount={5}
          />
          <YAxis
            tickLine={false}
            yAxisId="right"
            orientation="right"
            stroke="#3B7AD9"
            axisLine={{ stroke: "#f5f5f5" }}
            domain={[0, (dataMax) => Math.ceil(dataMax / 10) * 10]}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            tickCount={5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AcceptanceGraph;