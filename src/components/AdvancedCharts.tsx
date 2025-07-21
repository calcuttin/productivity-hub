'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Calendar,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface ProductivityData {
  daily: { date: string; productivity: number }[];
  weekly: { week: string; productivity: number }[];
  monthly: { month: string; productivity: number }[];
  activityBreakdown: { activity: string; hours: number }[];
  timeDistribution: { category: string; percentage: number }[];
  goals: { goal: string; current: number; target: number }[];
}

interface ChartProps {
  data: ChartData;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  className?: string;
}

// Simple Canvas-based Chart Component
function SimpleChart({ data, type, title, className = '' }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    setDimensions({ width: rect.width, height: rect.height });

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw chart based on type
    switch (type) {
      case 'bar':
        drawBarChart(ctx, data, rect.width, rect.height);
        break;
      case 'line':
        drawLineChart(ctx, data, rect.width, rect.height);
        break;
      case 'pie':
        drawPieChart(ctx, data, rect.width, rect.height);
        break;
      case 'doughnut':
        drawDoughnutChart(ctx, data, rect.width, rect.height);
        break;
    }
  }, [data, type, dimensions]);

  const drawBarChart = (ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) => {
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const maxValue = Math.max(...data.datasets[0].data);
    const barWidth = chartWidth / data.labels.length * 0.8;
    const barSpacing = chartWidth / data.labels.length * 0.2;

    // Draw bars
    data.labels.forEach((label, index) => {
      const value = data.datasets[0].data[index];
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing);
      const y = height - padding - barHeight;

      // Bar
      ctx.fillStyle = data.datasets[0].backgroundColor?.[index] || '#3B82F6';
      ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + barWidth / 2, height - 10);

      // Value
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
    });
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) => {
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    const valueRange = maxValue - minValue;

    // Draw line
    ctx.strokeStyle = data.datasets[0].borderColor || '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.labels.forEach((label, index) => {
      const value = data.datasets[0].data[index];
      const x = padding + (index / (data.labels.length - 1)) * chartWidth;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw point
      ctx.fillStyle = data.datasets[0].backgroundColor?.[index] || '#3B82F6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.stroke();
  };

  const drawPieChart = (ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;

    data.labels.forEach((label, index) => {
      const value = data.datasets[0].data[index];
      const sliceAngle = (value / total) * 2 * Math.PI;

      // Draw slice
      ctx.fillStyle = data.datasets[0].backgroundColor?.[index] || '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, labelX, labelY + 4);

      currentAngle += sliceAngle;
    });
  };

  const drawDoughnutChart = (ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 3;
    const innerRadius = outerRadius * 0.6;

    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;

    data.labels.forEach((label, index) => {
      const value = data.datasets[0].data[index];
      const sliceAngle = (value / total) * 2 * Math.PI;

      // Draw slice
      ctx.fillStyle = data.datasets[0].backgroundColor?.[index] || '#3B82F6';
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(total.toString(), centerX, centerY + 6);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-64"
          style={{ maxHeight: '256px' }}
        />
      </div>
    </div>
  );
}

// Productivity Trends Chart
export function ProductivityTrendsChart({ data }: { data: ProductivityData }) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const chartData: ChartData = {
    labels: data[timeframe].map(item => {
      if (timeframe === 'daily' && 'date' in item) {
        return new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timeframe === 'weekly' && 'week' in item) {
        return `Week ${item.week}`;
      } else if (timeframe === 'monthly' && 'month' in item) {
        return new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      return '';
    }),
    datasets: [{
      label: 'Productivity Score',
      data: data[timeframe].map(item => item.productivity),
      borderColor: '#3B82F6',
      backgroundColor: data[timeframe].map(() => '#3B82F6'),
      borderWidth: 2
    }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Productivity Trends
        </h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <SimpleChart data={chartData} type="line" title="" />
    </div>
  );
}

// Activity Breakdown Chart
export function ActivityBreakdownChart({ data }: { data: ProductivityData }) {
  const chartData: ChartData = {
    labels: data.activityBreakdown.map(item => item.activity),
    datasets: [{
      label: 'Hours',
      data: data.activityBreakdown.map(item => item.hours),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
      ]
    }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Activity Breakdown
      </h3>
      <SimpleChart data={chartData} type="doughnut" title="" />
    </div>
  );
}

// Time Distribution Chart
export function TimeDistributionChart({ data }: { data: ProductivityData }) {
  const chartData: ChartData = {
    labels: data.timeDistribution.map(item => item.category),
    datasets: [{
      label: 'Percentage',
      data: data.timeDistribution.map(item => item.percentage),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
      ]
    }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Time Distribution
      </h3>
      <SimpleChart data={chartData} type="pie" title="" />
    </div>
  );
}

// Goals Progress Chart
export function GoalsProgressChart({ data }: { data: ProductivityData }) {
  const chartData: ChartData = {
    labels: data.goals.map(item => item.goal),
    datasets: [{
      label: 'Progress',
      data: data.goals.map(item => (item.current / item.target) * 100),
      backgroundColor: data.goals.map(item => 
        (item.current / item.target) >= 0.8 ? '#10B981' :
        (item.current / item.target) >= 0.6 ? '#F59E0B' : '#EF4444'
      )
    }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Goals Progress
      </h3>
      <SimpleChart data={chartData} type="bar" title="" />
    </div>
  );
}

// Main Advanced Charts Component
export default function AdvancedCharts() {
  const [data, setData] = useState<ProductivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from your analytics API
      // For now, we'll use mock data
      const mockData: ProductivityData = {
        daily: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
          productivity: Math.floor(Math.random() * 40) + 60
        })),
        weekly: Array.from({ length: 4 }, (_, i) => ({
          week: (i + 1).toString(),
          productivity: Math.floor(Math.random() * 30) + 70
        })),
        monthly: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(2024, i, 1).toISOString(),
          productivity: Math.floor(Math.random() * 25) + 75
        })),
        activityBreakdown: [
          { activity: 'Projects', hours: 25 },
          { activity: 'Workouts', hours: 8 },
          { activity: 'Research', hours: 12 },
          { activity: 'Meetings', hours: 6 },
          { activity: 'Break', hours: 4 }
        ],
        timeDistribution: [
          { category: 'Deep Work', percentage: 40 },
          { category: 'Meetings', percentage: 20 },
          { category: 'Planning', percentage: 15 },
          { category: 'Break', percentage: 10 },
          { category: 'Other', percentage: 15 }
        ],
        goals: [
          { goal: 'Complete Projects', current: 8, target: 10 },
          { goal: 'Workout Days', current: 4, target: 5 },
          { goal: 'Research Hours', current: 12, target: 15 },
          { goal: 'Productivity Score', current: 85, target: 90 }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityTrendsChart data={data} />
        <ActivityBreakdownChart data={data} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeDistributionChart data={data} />
        <GoalsProgressChart data={data} />
      </div>
    </div>
  );
} 