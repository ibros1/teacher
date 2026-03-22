import { cloneElement, isValidElement, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export type AdminStatCard = {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  iconContainerClassName?: string;
  iconClassName?: string;
};

type Props = {
  items: AdminStatCard[];
  columnsClassName?: string;
};

const DEFAULT_ICON_STYLES = [
  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
];

const AdminStatsCards = ({ items, columnsClassName }: Props) => {
  return (
    <div
      className={
        columnsClassName ??
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      }
    >
      {items.map((item, idx) => (
        (() => {
          const style = DEFAULT_ICON_STYLES[idx % DEFAULT_ICON_STYLES.length];
          const iconContainerClassName =
            item.iconContainerClassName ??
            `inline-flex items-center justify-center h-10 w-10 rounded-full ${style}`;
          const iconClassName =
            item.iconClassName ??
            "h-5 w-5";

          const icon = item.icon
            ? isValidElement(item.icon)
              ? cloneElement(item.icon as any, {
                  className: [
                    (item.icon as any).props?.className,
                    iconClassName,
                  ]
                    .filter(Boolean)
                    .join(" "),
                })
              : item.icon
            : null;

          return (
        <Card key={idx} className="dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            {item.icon ? (
              <div className={iconContainerClassName}>
                {icon}
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{item.value}</div>
            {item.subtitle ? (
              <div className="text-xs text-muted-foreground mt-1">
                {item.subtitle}
              </div>
            ) : null}
          </CardContent>
        </Card>
          );
        })()
      ))}
    </div>
  );
};

export default AdminStatsCards;
