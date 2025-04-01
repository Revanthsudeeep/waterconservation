import { Droplet } from 'lucide-react';

interface Props {
  ph: number;
  tds: number;
  turbidity: number;
}

const WaterQualityIndicator = ({ ph, tds, turbidity }: Props) => {
  const getQualityStatus = () => {
    // Simplified quality check
    if (ph >= 6.5 && ph <= 8.5 && tds < 500 && turbidity < 5) {
      return { status: 'Good', color: 'text-green-600' };
    }
    return { status: 'Needs Attention', color: 'text-yellow-600' };
  };

  const { status, color } = getQualityStatus();

  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-semibold mb-2">Water Quality</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>pH Level</span>
          <span>{ph}</span>
        </div>
        <div className="flex justify-between">
          <span>TDS (mg/L)</span>
          <span>{tds}</span>
        </div>
        <div className="flex justify-between">
          <span>Turbidity (NTU)</span>
          <span>{turbidity}</span>
        </div>
        <div className={`flex items-center ${color} mt-2`}>
          <Droplet className="w-4 h-4 mr-1" />
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityIndicator; 