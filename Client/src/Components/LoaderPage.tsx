import CircularProgress from '@mui/material/CircularProgress';

const LoaderPage = () => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CircularProgress size={100} />
    </div>
  );
};

export default LoaderPage;
