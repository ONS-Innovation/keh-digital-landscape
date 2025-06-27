import React, { useMemo } from 'react';
import '../../../styles/CopilotPage.css';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const entries = 7;

const colourPalette = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
];

const PieChart = ({ engagedUsers, title = 'User Engagement' }) => {
  const data = useMemo(() => {
    const filteredEntries = Object.entries(engagedUsers).filter(
      ([key]) => key.toLowerCase() !== 'unknown'
    );
    const sortedEntries = filteredEntries.sort((a, b) => b[1] - a[1]);
    const topEntries = sortedEntries.slice(0, entries);
    const otherEntries = sortedEntries.slice(entries);

    const otherTotal = otherEntries.reduce((sum, [, count]) => sum + count, 0);
    const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0) || 1;

    const pieData = topEntries.map(([label, count], index) => ({
      name: label,
      value: parseFloat(((count / total) * 100).toFixed(1)),
      count,
      color: colourPalette[index % colourPalette.length],
    }));

    if (otherTotal > 0) {
      pieData.push({
        name: 'other',
        value: parseFloat(((otherTotal / total) * 100).toFixed(1)),
        count: otherTotal,
        color: '#fd79a8',
      });
    }

    return pieData;
  }, [engagedUsers]);

  return (
    <div className="copilot-pie-chart">
      <h3>{title}</h3>
      <ResponsiveContainer>
        <RechartsPieChart>
          <title>{title}</title>
          <desc>Pie chart showing {title} distribution by percentage.</desc>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                aria-label={`${entry.name}: ${entry.value}% with ${entry.count} entries`}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}%`, name]} />
          <Legend iconType="circle" iconSize={10} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
