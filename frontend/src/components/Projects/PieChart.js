import React, { useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CLOUD_PROVIDERS } from '../../constants/projectConstants';

/**
 * PieChart component displays the percentage of projects by a specified category.
 *
 * @param {Object} props - The props passed to the component
 * @param {Array} props.projectsData - The array of projects data
 * @param {string} props.title - The title of the chart
 * @param {string} props.categoryField - The field to use for categorisation (e.g., "Stage", "Developed")
 * @param {Array} props.categories - The categories to display (e.g., ["Active Support", "Development", "Unsupported"])
 * @param {Object} props.categoryLabels - Optional mapping of category values to display labels
 * @param {Object} props.categoryColours - Mapping of category values to colours
 * @param {function} props.getCategoryValue - Function to extract category value from a project
 * @param {boolean} props.splitSemicolon - Whether to split the category field by semicolon
 * @param {boolean} props.dynamicCategories - Whether to dynamically detect categories from the data
 * @param {number} props.maxCategories - Maximum number of categories to display
 * @param {boolean} props.cloudProvidersOnly - Whether to specifically look for major cloud providers in semicolon-separated values
 * @returns {JSX.Element} - The rendered PieChart component
 */
const PieChart = ({
  projectsData,
  title,
  categoryField,
  categories = [],
  categoryLabels = {},
  categoryColours = {},
  getCategoryValue = (project, field) => project[field] || 'Unknown',
  splitSemicolon = false,
  dynamicCategories = false,
  maxCategories = 8,
  cloudProvidersOnly = false,
}) => {
  // Generate colour palette for dynamic categories
  const defaultColourPalette = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    '#2ecc71',
    '#f39c12',
    '#1abc9c',
    '#d35400',
    '#8e44ad',
    '#16a085',
    '#27ae60',
    '#f1c40f',
    '#e67e22',
  ];

  // Pre-defined cloud providers detection for architecture field - this can change
  const cloudProviders = CLOUD_PROVIDERS;

  // Use useMemo to calculate the data only when dependencies change
  const data = useMemo(() => {
    // Check for empty data first
    if (!projectsData || projectsData.length === 0) {
      return [];
    }

    // Initialise with empty counts
    let categoryCounts = {};
    let detectedCategories = [];

    // Handle cloud providers mode (special case for architecture field)
    if (cloudProvidersOnly && splitSemicolon) {
      // Use predefined cloud provider categories
      const providerCategories = Object.keys(cloudProviders);
      providerCategories.forEach(provider => {
        categoryCounts[provider] = 0;
      });

      // Count instances of each cloud provider
      projectsData.forEach(project => {
        const value = project[categoryField];
        if (!value) return;

        const values = value
          .split(';')
          .map(v => v.trim().toLowerCase())
          .filter(v => v);

        // For each architecture value, check which cloud provider it matches
        values.forEach(val => {
          let matched = false;

          // Check each provider's keywords
          for (const [provider, keywords] of Object.entries(cloudProviders)) {
            if (provider === 'Other') continue; // Skip Other for now

            // Check if this value contains any of the provider's keywords
            if (keywords.some(keyword => val.includes(keyword.toLowerCase()))) {
              categoryCounts[provider] += 1;
              matched = true;
              break;
            }
          }

          // If no match found, count as Other
          if (!matched) {
            categoryCounts['Other'] += 1;
          }
        });
      });

      // Calculate percentages and format data
      const totalValues =
        Object.values(categoryCounts).reduce((sum, count) => sum + count, 0) ||
        1;

      const chartData = providerCategories
        .map(category => {
          const count = categoryCounts[category];
          const percentage = (count / totalValues) * 100;
          return {
            name: categoryLabels[category] || category,
            value: parseFloat(percentage.toFixed(1)),
            count: count,
            category: category, // Store original category for colour mapping
          };
        })
        .sort((a, b) => b.count - a.count); // Sort by count descending

      return chartData;
    }

    // Dynamically detect categories if enabled
    else if (dynamicCategories) {
      const uniqueValues = new Set();

      // Collect all unique values
      projectsData.forEach(project => {
        let fieldValue = project[categoryField];

        if (!fieldValue) return;

        if (splitSemicolon) {
          fieldValue.split(';').forEach(value => {
            const trimmedValue = value.trim();
            if (trimmedValue) {
              uniqueValues.add(trimmedValue);
            }
          });
        } else {
          uniqueValues.add(fieldValue);
        }
      });

      // Convert to array and limit if needed
      detectedCategories = Array.from(uniqueValues);

      // Sort by frequency before limiting
      const valueCounts = {};
      projectsData.forEach(project => {
        let fieldValue = project[categoryField];
        if (!fieldValue) return;

        if (splitSemicolon) {
          fieldValue.split(';').forEach(value => {
            const trimmedValue = value.trim();
            if (trimmedValue) {
              valueCounts[trimmedValue] = (valueCounts[trimmedValue] || 0) + 1;
            }
          });
        } else {
          valueCounts[fieldValue] = (valueCounts[fieldValue] || 0) + 1;
        }
      });

      // Sort by count and limit to maxCategories
      detectedCategories.sort(
        (a, b) => (valueCounts[b] || 0) - (valueCounts[a] || 0)
      );

      if (detectedCategories.length > maxCategories) {
        // Keep top categories and add "Other"
        detectedCategories = detectedCategories.slice(0, maxCategories - 1);
        detectedCategories.push('Other');
      }

      // Use provided categories or detected ones
      const finalCategories = detectedCategories;

      // Initialise category counts
      finalCategories.forEach(category => {
        categoryCounts[category] = 0;
      });

      // Count projects or values for each category
      if (splitSemicolon) {
        projectsData.forEach(project => {
          const value = project[categoryField];
          if (!value) return;

          const values = value
            .split(';')
            .map(v => v.trim())
            .filter(v => v);

          values.forEach(val => {
            // If this exact category exists, count it
            if (categoryCounts[val] !== undefined) {
              categoryCounts[val] += 1;
            }
            // If we're using dynamic categories with "Other" and this isn't a known category
            else if (finalCategories.includes('Other')) {
              categoryCounts['Other'] += 1;
            }
          });
        });
      } else {
        projectsData.forEach(project => {
          const categoryValue = getCategoryValue(project, categoryField);

          // If this exact category exists, count it
          if (categoryCounts[categoryValue] !== undefined) {
            categoryCounts[categoryValue] += 1;
          }
          // If we have an "Other" category and this isn't a known category
          else if (finalCategories.includes('Other')) {
            categoryCounts['Other'] += 1;
          }
        });
      }

      // Calculate percentages and format data for the chart
      const totalValues =
        Object.values(categoryCounts).reduce((sum, count) => sum + count, 0) ||
        1;

      const chartData = finalCategories
        .map(category => {
          const count = categoryCounts[category];
          const percentage = (count / totalValues) * 100;
          return {
            name: categoryLabels[category] || category,
            value: parseFloat(percentage.toFixed(1)),
            count: count,
            category: category, // Store original category for colour mapping
          };
        })
        .sort((a, b) => b.count - a.count); // Sort by count descending

      return chartData;
    } else {
      // Use provided categories
      const finalCategories = categories;

      // Initialise category counts
      finalCategories.forEach(category => {
        categoryCounts[category] = 0;
      });

      // Count projects or values for each category
      if (splitSemicolon) {
        projectsData.forEach(project => {
          const value = project[categoryField];
          if (!value) return;

          const values = value
            .split(';')
            .map(v => v.trim())
            .filter(v => v);

          values.forEach(val => {
            let matched = false;

            // Try to match to any category
            for (const category of finalCategories) {
              if (category === 'Other') continue;

              if (val.toLowerCase().includes(category.toLowerCase())) {
                categoryCounts[category] += 1;
                matched = true;
                break;
              }
            }

            // If no match and we have an "Other" category
            if (!matched && finalCategories.includes('Other')) {
              categoryCounts['Other'] += 1;
            }
          });
        });
      } else {
        projectsData.forEach(project => {
          const categoryValue = getCategoryValue(project, categoryField);

          // If this exact category exists, count it
          if (categoryCounts[categoryValue] !== undefined) {
            categoryCounts[categoryValue] += 1;
          }
          // If we have an "Other" category and this isn't a known category
          else if (finalCategories.includes('Other')) {
            categoryCounts['Other'] += 1;
          }
        });
      }

      // Calculate percentages and format data for the chart
      const totalValues =
        Object.values(categoryCounts).reduce((sum, count) => sum + count, 0) ||
        1;

      const chartData = finalCategories
        .map(category => {
          const count = categoryCounts[category];
          const percentage = (count / totalValues) * 100;
          return {
            name: categoryLabels[category] || category,
            value: parseFloat(percentage.toFixed(1)),
            count: count,
            category: category, // Store original category for colour mapping
          };
        })
        .sort((a, b) => b.count - a.count); // Sort by count descending

      return chartData;
    }
  }, [
    projectsData,
    categoryField,
    categories,
    categoryLabels,
    getCategoryValue,
    splitSemicolon,
    dynamicCategories,
    maxCategories,
    cloudProvidersOnly,
    cloudProviders,
  ]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{data.name}</p>
          <p className="count">
            {`${data.count} ${splitSemicolon ? 'instances' : 'projects'}`}{' '}
            {data.value ? `(${data.value}%)` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer for the pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    // Don't show labels for slices smaller than 5% or with 0 value
    if (percent < 0.05 || percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  /**
   * Gets the colour for a category.
   *
   * @param {string} category - The category to get the colour for.
   * @param {number} index - The index of the category.
   * @returns {string} - The colour of the category.
   */
  const getColourForCategory = (category, index) => {
    // If a specific colour is provided for this category, use it
    if (categoryColours[category]) {
      return categoryColours[category];
    }

    // Otherwise use position in the default palette
    return defaultColourPalette[index % defaultColourPalette.length];
  };

  // If no data to display, show a message
  if (!projectsData || projectsData.length === 0 || data.length === 0) {
    return (
      <div className="projects-chart">
        <h3>{title}</h3>
        <div className="chart-no-data">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Filter out 0 value entries for the actual pie chart, but keep them for the legend
  const pieData = data.filter(item => item.value > 0);

  return (
    <div className="projects-chart">
      <h3>{title}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <RechartsPieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={75}
              fill="#8884d8"
              dataKey="value"
              opacity={0.5}
              isAnimationActive={false}
              nameKey="name"
              role="presentation"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColourForCategory(entry.category, index)}
                  role="img"
                  aria-label={`${entry.name}: ${entry.value}%, ${entry.count} ${splitSemicolon ? 'instances' : 'projects'}`}
                >
                  <title>{`${entry.name}: ${entry.value}%, ${entry.count} ${splitSemicolon ? 'instances' : 'projects'}`}</title>
                </Cell>
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={10}
              payload={data.map((entry, index) => ({
                value: entry.name,
                type: 'circle',
                id: entry.category,
                color: getColourForCategory(entry.category, index),
              }))}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChart;
