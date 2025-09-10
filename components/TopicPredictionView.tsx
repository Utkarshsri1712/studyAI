import React from 'react';
import type { Topic } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopicPredictionViewProps {
  result: Topic[] | null;
  theme: 'light' | 'dark';
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const isDark = theme === 'dark';
    return (
      <div 
        className="p-2 rounded-md shadow-lg border"
        style={{
            backgroundColor: isDark ? 'hsl(222 47% 11%)' : 'hsl(0 0% 100%)',
            borderColor: isDark ? 'hsl(215 28% 17%)' : 'hsl(210 40% 96.1%)'
        }}
    >
        <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{label}</p>
        <p className={isDark ? 'text-sky-400' : 'text-primary'}>{`Probability: ${payload[0].value}%`}</p>
      </div>
    );
  }

  return null;
};

export const TopicPredictionView: React.FC<TopicPredictionViewProps> = ({ result, theme }) => {
  if (!result) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        Predicted topics chart will be displayed here after analysis.
      </div>
    );
  }
  
  const sortedResult = [...result].sort((a, b) => b.probability - a.probability);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 or slate-200
  const axisColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 or slate-500
  const tickColor = isDark ? '#e2e8f0' : '#334155'; // slate-200 or slate-700
  const barColor = isDark ? '#38bdf8' : '#4f46e5'; // sky-400 or indigo-600

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Predicted Exam Topics</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={sortedResult}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis type="number" stroke={axisColor} domain={[0, 100]} tick={{ fill: tickColor }} unit="%"/>
            <YAxis 
                dataKey="topic" 
                type="category" 
                stroke={axisColor}
                width={150} 
                tick={{ fill: tickColor, width: 140 }}
                tickLine={false}
                axisLine={false}
                interval={0}
            />
            <Tooltip 
                content={<CustomTooltip theme={theme} />} 
                cursor={{ fill: isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(79, 70, 229, 0.1)'}}
            />
            <Legend wrapperStyle={{ color: tickColor }}/>
            <Bar dataKey="probability" name="Probability (%)" fill={barColor} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};