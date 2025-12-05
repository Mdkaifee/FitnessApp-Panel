import { memo, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = [
  'rgba(99, 102, 241, 0.9)',
  'rgba(59, 130, 246, 0.9)',
  'rgba(16, 185, 129, 0.9)',
  'rgba(248, 113, 113, 0.9)',
  'rgba(251, 191, 36, 0.9)',
]

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 14,
        boxHeight: 14,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed ?? 0}`,
      },
    },
  },
}

function VideoGenderChart({ entries }) {
  const chartData = useMemo(() => {
    const labels = entries.map((entry) => entry.label)
    const values = entries.map((entry) => entry.value)
    const backgroundColor = values.map((_, index) => COLORS[index % COLORS.length])
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor,
          borderWidth: 0,
        },
      ],
    }
  }, [entries])

  if (!entries.length) {
    return <p className="chart-empty">No gender data available.</p>
  }

  return <Doughnut data={chartData} options={OPTIONS} />
}

export default memo(VideoGenderChart)
