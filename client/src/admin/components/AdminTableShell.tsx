import type { ReactNode } from "react";
import { Card, CardContent } from "../../components/ui/card";

type Props = {
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
};

const AdminTableShell = ({ toolbar, children, className }: Props) => {
  return (
    <Card className={className ?? "mt-6 dark:border-gray-700"}>
      <CardContent className="p-4">
        {toolbar ? <div className="mb-4">{toolbar}</div> : null}
        {children}
      </CardContent>
    </Card>
  );
};

export default AdminTableShell;
