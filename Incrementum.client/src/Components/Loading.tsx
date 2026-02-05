type LoadingProps = {
  loading: boolean;
  loadingText?: string;
};

export default function Loading({ loading }: LoadingProps) {
  return (
    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {loading && (
        <span className="loader"></span>
      )}
    </div>
  );
}