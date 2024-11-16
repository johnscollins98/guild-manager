import Code from '@mui/icons-material/Code';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { Button, IconButton, TextField, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useMemo, useState, type FC, type FormEventHandler } from 'react';
import {
  recruitmentApi,
  useRecruitmentPost,
  useRecruitmentPostMutation
} from '../../lib/apis/recruitment-api';
import LoaderPage from '../common/loader-page';
import { useToast } from '../common/toast/toast-context';

import './recruitment-page.scss';

const RecruitmentPage: FC = () => {
  const { data, isSuccess, isLoading } = useRecruitmentPost();
  const recruitmentPostMutation = useRecruitmentPostMutation();
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const toast = useToast();

  const isModified = useMemo(() => {
    if (!data) return false;

    return title !== data.title || message !== data.content;
  }, [data, title, message]);

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

  const resetHandler: FormEventHandler<HTMLFormElement> = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();

      setMessage(data?.content ?? '');
      setTitle(data?.title ?? '');
    },
    [data]
  );

  const handleCopyClick = async (isHtml: boolean) => {
    const post = await recruitmentApi
      .getGeneratedPost(isHtml)
      .catch(() => toast('Failed to generate message', 'error'));

    if (post) {
      copy(post, { format: isHtml ? 'text/html' : 'text/plain' });
      toast('Copied message to clipboard', 'success');
    }
  };

  if (isLoading) {
    return <LoaderPage />;
  }

  return (
    <form
      onSubmit={submitHandler}
      onReset={resetHandler}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
    >
      <Box justifyContent="space-between" alignItems="center" display="flex">
        <h2>Recruitment Post</h2>
        <Box display="flex" alignItems="center" gap="8px">
          <Button variant="text" type="reset" disabled={!isModified}>
            Reset
          </Button>
          <Button variant="contained" color="primary" type="submit" disabled={!isModified}>
            Save Changes
          </Button>
        </Box>
      </Box>
      <div className="input-wrapper">
        <div className="buttons centered">
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={() => copy(title)}>
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </div>
        <TextField
          value={title}
          required
          onChange={e => setTitle(e.target.value)}
          fullWidth
          name="Title"
          label="Title"
        />
      </div>
      <div style={{ overflow: 'auto', paddingTop: '16px' }} className="input-wrapper">
        <div className="buttons">
          <Tooltip title="Copy as HTML/Rich Text">
            <IconButton onClick={() => handleCopyClick(true)}>
              <ContentCopy />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy as Markdown">
            <IconButton onClick={() => handleCopyClick(false)}>
              <Code />
            </IconButton>
          </Tooltip>
        </div>
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
