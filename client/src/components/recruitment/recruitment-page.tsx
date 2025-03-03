import Code from '@mui/icons-material/Code';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { Button, IconButton, TextField, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useMemo, useState, type FC, type FormEventHandler } from 'react';
import {
  recruitmentApi,
  recruitmentQuery,
  useRecruitmentPostMutation
} from '../../lib/apis/recruitment-api';
import { useToast } from '../common/toast/toast-context';

import { useSuspenseQueries } from '@tanstack/react-query';
import { authQuery } from '../../lib/apis/auth-api';
import './recruitment-page.scss';

const RecruitmentPage: FC = () => {
  const [recruitmentPost, auth] = useSuspenseQueries({ queries: [recruitmentQuery, authQuery] });
  const recruitmentPostMutation = useRecruitmentPostMutation();
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const toast = useToast();

  const isModified = useMemo(() => {
    return (
      title !== (recruitmentPost.data?.title ?? '') ||
      message !== (recruitmentPost.data?.content ?? '')
    );
  }, [recruitmentPost.data, title, message]);

  useEffect(() => {
    if (recruitmentPost.data) {
      setMessage(recruitmentPost.data.content);
      setTitle(recruitmentPost.data.title);
    }
  }, [recruitmentPost.data]);

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

      setMessage(recruitmentPost.data?.content ?? '');
      setTitle(recruitmentPost.data?.title ?? '');
    },
    [recruitmentPost.data]
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

  return (
    <form
      onSubmit={submitHandler}
      onReset={resetHandler}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
    >
      <Box justifyContent="space-between" alignItems="center" display="flex">
        <h2>Recruitment Post</h2>
        {auth.data.permissions.RECRUITMENT && (
          <Box display="flex" alignItems="center" gap="8px">
            <Button variant="text" type="reset" disabled={!isModified}>
              Reset
            </Button>
            <Button variant="contained" color="primary" type="submit" disabled={!isModified}>
              Save Changes
            </Button>
          </Box>
        )}
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
          disabled={!auth.data.permissions.RECRUITMENT}
          required
          onChange={e => setTitle(e.target.value)}
          fullWidth
          name="Title"
          label="Title"
          InputProps={{ sx: { paddingRight: '45px' } }}
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
          disabled={!auth.data.permissions.RECRUITMENT}
          onChange={e => setMessage(e.target.value)}
          fullWidth
          InputProps={{
            sx: { fontFamily: 'Consolas, Menlo, Ubuntu, Roboto, monospace', paddingRight: '95px' }
          }}
          name="message"
        />
      </div>
    </form>
  );
};

export default RecruitmentPage;
