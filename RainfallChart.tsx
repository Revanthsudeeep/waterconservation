import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RainfallData {
  month: string;
  amount: number;
}

interface Props {
  data: RainfallData[];
}

const RainfallChart = ({ data }: Props) => {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: data.map(d => d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      }
    ]
  };

  return (
    <Line 
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Monthly Rainfall Trends'
          }
        }
      }}
    />
  );
};

export default RainfallChart; 