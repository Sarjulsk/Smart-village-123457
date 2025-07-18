import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600'
  }
};

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colors = colorMap[color];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 ${colors.bg} rounded-lg`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
