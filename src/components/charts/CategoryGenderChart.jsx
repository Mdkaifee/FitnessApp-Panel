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

const COLOR_PALETTE = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(139, 92, 246, 0.8)',
]

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        color: '#475569',
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
      },
      ticks: {
        color: '#94a3b8',
        precision: 0,
      },
    },
  },
}

const CategoryGenderChart = ({ entries }) => {
  const data = useMemo(() => {
    const categories = Array.from(new Set(entries.map((entry) => entry.category)))
    const genderLabels = Array.from(new Set(entries.map((entry) => entry.gender)))

    const datasets = genderLabels.map((gender, index) => {
      const backgroundColor = COLOR_PALETTE[index % COLOR_PALETTE.length]
      const datasetValues = categories.map((category) => {
        const match = entries.find((entry) => entry.category === category && entry.gender === gender)
        return match ? match.value : 0
      })
      return {
        label: gender,
        data: datasetValues,
        backgroundColor,
        borderRadius: 8,
      }
    })

    return {
      labels: categories,
      datasets,
    }
  }, [entries])

  return <Bar data={data} options={baseOptions} />
}

export default memo(CategoryGenderChart)
