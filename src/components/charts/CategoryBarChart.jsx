import { memo, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#475569',
        font: {
          size: 12,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
      },
      ticks: {
        color: '#94a3b8',
        precision: 0,
        callback: (value) => (Number.isFinite(value) ? value : ''),
      },
    },
  },
}

function CategoryBarChart({ categories }) {
  const chartData = useMemo(() => {
    const labels = categories.map((item) => item.label)
    const values = categories.map((item) => item.value)
    return {
      labels,
      datasets: [
        {
          label: 'Videos',
          data: values,
          borderRadius: 12,
          backgroundColor: 'rgba(47, 111, 236, 0.6)',
          hoverBackgroundColor: 'rgba(47, 111, 236, 0.85)',
          maxBarThickness: 42,
        },
      ],
    }
  }, [categories])

  return <Bar data={chartData} options={baseOptions} />
}

export default memo(CategoryBarChart)
