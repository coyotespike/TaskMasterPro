import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExplanationCardProps } from "@/types";
import { LightbulbIcon } from "lucide-react";

const ExplanationCard = ({ explanation }: ExplanationCardProps) => {
  return (
    <Card className="card-shadow border-0 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 overflow-hidden">
      <CardHeader className="pb-2 border-b border-indigo-100 dark:border-indigo-800/30">
        <CardTitle className="text-xl font-semibold flex items-center text-indigo-700 dark:text-indigo-400">
          <LightbulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            AI Optimization Logic
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {explanation}
        </p>
      </CardContent>
    </Card>
  );
};

export default ExplanationCard;
