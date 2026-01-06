import { memo, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const COLOR_PALETTE = ['#FA99B5', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316']

const GENDER_COLOR_MAP = {
  female: '#FA99B5',
  male: '#3b82f6',
  all: '#8b5cf6',
  other: '#a3a3a3',
}

const getGenderColor = (label, index) => {
  if (!label) return COLOR_PALETTE[index % COLOR_PALETTE.length]
  const normalized = label.toLowerCase()
  return GENDER_COLOR_MAP[normalized] ?? COLOR_PALETTE[index % COLOR_PALETTE.length]
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        color: 'rgba(226, 232, 240, 0.5)',
        drawBorder: false,
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 12,
        },
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      suggestedMax: 2,
      grid: {
        color: 'rgba(226, 232, 240, 0.8)',
        drawBorder: false,
      },
      ticks: {
        color: '#a5b4fc',
        precision: 0,
        callback: (value) => String(value).padStart(2, '0'),
        font: {
          size: 12,
        },
      },
    },
  },
}

const formatCategoryLabel = (label = '') =>
  label.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim()

const BAR_WIDTH = 18
const CategoryGenderChart = ({ entries }) => {
  const { data, labels } = useMemo(() => {
    const categories = Array.from(new Set(entries.map((entry) => entry.category)))
    const totalsByCategory = entries.reduce((acc, entry) => {
      const key = entry.category
      acc[key] = (acc[key] ?? 0) + (entry.value ?? 0)
      return acc
    }, {})
    const sortedCategories = [...categories].sort((a, b) => {
      const diff = (totalsByCategory[a] ?? 0) - (totalsByCategory[b] ?? 0)
      if (diff !== 0) return diff
      return a.localeCompare(b)
    })
    const genderLabels = Array.from(new Set(entries.map((entry) => entry.gender)))

    const datasets = genderLabels.map((gender, index) => {
      const backgroundColor = getGenderColor(gender, index)
      const datasetValues = sortedCategories.map((category) => {
        const match = entries.find((entry) => entry.category === category && entry.gender === gender)
        return match ? match.value : 0
      })
      const totalForDataset = datasetValues.reduce((total, value) => total + value, 0)
      const radius = BAR_WIDTH
      return {
        label: gender,
        data: datasetValues,
        backgroundColor,
        barThickness: totalForDataset === 0 ? 0 : BAR_WIDTH,
        maxBarThickness: BAR_WIDTH,
        borderRadius:
          totalForDataset === 0
            ? 0
            : {
                topLeft: radius,
                topRight: radius,
                bottomLeft: radius,
                bottomRight: radius,
              },
        borderSkipped: false,
      }
    })

    return {
      data: {
        labels: sortedCategories.map((category) => formatCategoryLabel(category)),
        datasets,
      },
      labels: genderLabels,
    }
  }, [entries])

  return (
    <div className="category-gender-chart">
      <div className="category-gender-chart__canvas">
        <Bar data={data} options={baseOptions} />
      </div>
      {labels.length > 0 && (
        <div className="category-gender-legend">
          {labels.map((label, index) => (
            <span key={label} className="category-gender-legend__item">
              <span
                className="category-gender-legend__dot"
                style={{ backgroundColor: getGenderColor(label, index) }}
              />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(CategoryGenderChart)
