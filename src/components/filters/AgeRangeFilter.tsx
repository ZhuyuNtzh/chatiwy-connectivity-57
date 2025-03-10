
import { Slider } from "@/components/ui/slider";

interface AgeRangeFilterProps {
  ageRange: [number, number];
  onAgeChange: (value: number[]) => void;
}

const AgeRangeFilter = ({ ageRange, onAgeChange }: AgeRangeFilterProps) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Age Range: {ageRange[0]} - {ageRange[1]}</div>
      <Slider
        defaultValue={[18, 80]}
        min={18}
        max={80}
        step={1}
        value={[ageRange[0], ageRange[1]]}
        onValueChange={onAgeChange}
        className="py-4"
      />
    </div>
  );
};

export default AgeRangeFilter;
