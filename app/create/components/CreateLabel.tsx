import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CreateLabel = ({
  className,
  text,
  required = false,
}: {
  className?: string;
  required?: boolean;
  text: string;
}) => {
  return (
    <Label
      className={cn(
        "text-gray-300 text-sm capitalize",
        className
      )}
    >
      {text}
      {required && <span className="text-red-500">*</span>}
    </Label>
  );
};

export default CreateLabel;
