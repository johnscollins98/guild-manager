import { Button, TextField } from '@mui/material';
import { Box } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState, type FC, type FormEventHandler } from 'react';
import {
  recruitmentApi,
  useRecruitmentPost,
  useRecruitmentPostMutation
} from '../../lib/apis/recruitment-api';
import LoaderPage from '../common/loader-page';
import { useToast } from '../common/toast/toast-context';

const RecruitmentPage: FC = () => {
  const { data, isSuccess, isLoading } = useRecruitmentPost();
  const recruitmentPostMutation = useRecruitmentPostMutation();
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isSuccess && data) {
      setMessage(data.content);
      setTitle(data.title);
    }
  }, [isSuccess, data]);

  const submitHandler: FormEventHandler<HTMLFormElement> = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();

      recruitmentPostMutation.mutate({ title: title, content: message });
    },
    [message, recruitmentPostMutation, title]
  );

  const handleCopyClick = async (isHtml: boolean) => {
    const post = await recruitmentApi
      .getGeneratedPost(isHtml)
      .catch(() => toast('Failed to generate message', 'error'));

    if (post) {
      copy(post);
      toast('Copied message to clipboard', 'success');
    }
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
      <TextField
        value={title}
        required
        onChange={e => setTitle(e.target.value)}
        fullWidth
        name="Title"
        label="Title"
      />
      <div style={{ overflow: 'auto', paddingTop: '16px' }}>
        <TextField
          multiline
          label="Content"
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
