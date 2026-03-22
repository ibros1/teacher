import { Button } from "../../components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

const AdminPagination = ({
  page,
  totalPages,
  onPrev,
  onNext,
  className,
}: Props) => {
  return (
    <div className={className ?? "flex items-center justify-between mt-6"}>
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={page <= 1}
      >
        Prev
      </Button>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Page {page} of {totalPages}
      </div>
      <Button
        variant="outline"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default AdminPagination;
