import { Button, TextField } from '@mui/material';
import { Box } from '@mui/system';
import axios from 'axios';
import copy from 'copy-to-clipboard';
import { FC, FormEventHandler, useCallback, useEffect, useState } from 'react';
import { useRecruitmentPost, useRecruitmentPostMutation } from '../../utils/apis/recruitment-api';
import { useToast } from '../Common/ToastContext';
import LoaderPage from '../LoaderPage';

interface RecruitmentPageProps {}

const RecruitmentPage: FC<RecruitmentPageProps> = () => {
  const { data, isSuccess, isLoading } = useRecruitmentPost();
  const recruitmentPostMutation = useRecruitmentPostMutation();
  const [message, setMessage] = useState('');
  const toast = useToast();

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

  const handleCopyClick = async (isHtml: boolean) => {
    const response = await axios.get('/api/recruitment-post/generate', {
      params: {
        html: isHtml ? true : false
      }
    });

    const post = response.data;

    copy(post);

    toast('Copied message to clipboard', 'success');
  };

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
        <Box display="flex" alignItems="center" gap="8px">
          <Button onClick={() => handleCopyClick(true)}>Copy HTML</Button>
          <Button onClick={() => handleCopyClick(false)}>Copy Markdown</Button>
          <Button variant="contained" color="primary" type="submit">
            Save Message
          </Button>
        </Box>
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
