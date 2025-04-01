import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExplanationCardProps } from "@/types";

const ExplanationCard = ({ explanation }: ExplanationCardProps) => {
  return (
    <Card className="border-l-4 border-secondary dark:border-violet-600">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Schedule Optimization</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300">
          {explanation}
        </p>
      </CardContent>
    </Card>
  );
};

export default ExplanationCard;
