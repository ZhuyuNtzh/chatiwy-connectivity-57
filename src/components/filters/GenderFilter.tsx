
import { Button } from "@/components/ui/button";

interface GenderFilterProps {
  selectedGenders: string[];
  onGenderChange: (gender: string) => void;
}

const GenderFilter = ({ selectedGenders, onGenderChange }: GenderFilterProps) => {
  const isGenderActive = (gender: string) => selectedGenders.includes(gender);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Gender</div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isGenderActive("Male") ? "default" : "outline"}
          size="sm"
          onClick={() => onGenderChange("Male")}
        >
          Male
        </Button>
        <Button
          variant={isGenderActive("Female") ? "default" : "outline"}
          size="sm"
          onClick={() => onGenderChange("Female")}
        >
          Female
        </Button>
      </div>
    </div>
  );
};

export default GenderFilter;
