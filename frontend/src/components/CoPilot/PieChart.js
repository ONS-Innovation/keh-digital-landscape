import React, { useMemo } from "react";
import "../../styles/CoPilotPage.css";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const entries = 7;

const colourPalette = [
    "#2ecc71",
    "#e74c3c",
    "#3498db",
    "#f1c40f",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
  ];

const PieChart = ({ engagedUsers, title = "User Engagement"}) => {
  const data = useMemo(() => {
    const sortedEntries = Object.entries(engagedUsers).sort((a, b) => b[1] - a[1]);
    const topEntries = sortedEntries.slice(0, entries);
    const otherEntries = sortedEntries.slice(entries);

    const otherTotal = otherEntries.reduce((sum, [, count]) => sum + count, 0);
    const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0) || 1;

    const pieData = topEntries.map(([label, count], index) => ({
      name: label,
      value: parseFloat(((count / total) * 100).toFixed(1)),
      count,
      color: colourPalette[index % colourPalette.length]
    }));

    if (otherTotal > 0) {
      pieData.push({
        name: "other",
        value: parseFloat(((otherTotal / total) * 100).toFixed(1)),
        count: otherTotal,
        color: "#fd79a8"
      });
    }

    return pieData;
  }, [engagedUsers]);

  return (
    <div className="copilot-pie-chart">
      <h3>{title}</h3>
      <ResponsiveContainer>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}%`, name]} />
          <Legend iconType="circle" iconSize={10}/>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
