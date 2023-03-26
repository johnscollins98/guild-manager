import { Button, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { FC, FormEventHandler, useCallback, useEffect, useState } from 'react';
import { useRecruitmentPost, useRecruitmentPostMutation } from '../../utils/apis/recruitment-api';
import LoaderPage from '../LoaderPage';

interface RecruitmentPageProps {}

const RecruitmentPage: FC<RecruitmentPageProps> = () => {
  const { data, isSuccess, isLoading } = useRecruitmentPost();
  const recruitmentPostMutation = useRecruitmentPostMutation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isSuccess && data) {
      setMessage(data.content);
    }
  }, [isSuccess, data]);

  const submitHandler: FormEventHandler<HTMLFormElement> = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();

      recruitmentPostMutation.mutate({ content: message });
    },
    [message]
  );

  if (isLoading) {
    return <LoaderPage />;
  }

  return (
    <form
      onSubmit={submitHandler}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
    >
      <Box justifyContent="space-between" alignItems="center" display="flex">
        <h2>Recruitment Post</h2>
        <Button type="submit">Save Message</Button>
      </Box>
      <div style={{ overflow: 'auto' }}>
        <TextField
          multiline
          value={message}
          onChange={e => setMessage(e.target.value)}
          fullWidth
          InputProps={{ sx: { fontFamily: 'Consolas, Menlo, Ubuntu, Roboto, monospace' } }}
          name="message"
        />
      </div>
    </form>
  );
};

export default RecruitmentPage;
