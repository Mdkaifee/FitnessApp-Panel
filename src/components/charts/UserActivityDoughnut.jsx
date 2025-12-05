import { memo, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed || 0}`,
      },
    },
  },
}

function UserActivityDoughnut({ active, inactive }) {
  const chartData = useMemo(() => {
    const safeActive = Number.isFinite(active) ? active : 0
    const safeInactive = Number.isFinite(inactive) ? inactive : 0
    return {
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          data: [safeActive, safeInactive],
          backgroundColor: ['rgba(34, 197, 94, 0.9)', 'rgba(148, 163, 184, 0.7)'],
          borderWidth: 0,
        },
      ],
    }
  }, [active, inactive])

  return <Doughnut data={chartData} options={baseOptions} />
}

export default memo(UserActivityDoughnut)
