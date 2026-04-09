type LoadingProps = {
  loading: boolean;
  loadingText?: string;
};

export default function Loading({ loading }: LoadingProps) {
  return (
    <div className="loading-wrapper">
      {loading && (
        <span className="loader"></span>
      )}
    </div>
  );
}