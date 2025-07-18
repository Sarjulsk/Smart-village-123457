import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LocationChartProps {
  data: { location: string; count: number }[];
}

const COLORS = {
  village: '#10b981', // green
  city: '#f59e0b', // yellow
  abroad: '#8b5cf6', // purple
};

const LOCATION_LABELS = {
  village: 'In Village',
  city: 'In Cities',
  abroad: 'Abroad',
};

export default function LocationChart({ data }: LocationChartProps) {
  const chartData = data.map(item => ({
    name: LOCATION_LABELS[item.location as keyof typeof LOCATION_LABELS] || item.location,
    value: item.count,
    color: COLORS[item.location as keyof typeof COLORS] || '#6b7280',
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'People']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
