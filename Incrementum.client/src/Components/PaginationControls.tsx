type PaginationControlsProps = {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function PaginationControls({ page, hasMore, onPrev, onNext }: PaginationControlsProps) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="pagination-button"
      >
        Previous
      </button>
      
      <button
        onClick={onNext}
        disabled={!hasMore}
        className="pagination-button"
      >
        Next
      </button>
    </div>
  );
}