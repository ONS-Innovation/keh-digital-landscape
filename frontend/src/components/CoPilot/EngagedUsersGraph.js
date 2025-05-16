import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const EngagedUsersGraph = ({ data }) => {
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
          <Tooltip />
          <Legend verticalAlign="top" align="left" height={36} />
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey="engagedUsers"
            barSize={20}
            fill="#3B7AD9"
            yAxisId="left"
            legendType="rect"
            name="Engaged Users"
          />
          <YAxis
            tickLine={false}
            yAxisId="left"
            axisLine={{ stroke: "#f5f5f5" }}
            domain={[0, "dataMax + 5"]}
            tickCount={5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagedUsersGraph;