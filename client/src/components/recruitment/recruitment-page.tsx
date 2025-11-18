import Code from '@mui/icons-material/Code';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { Button, CircularProgress, IconButton, TextField, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useState, type FormEventHandler } from 'react';
import {
  recruitmentApi,
  recruitmentQuery,
  useRecruitmentPostMutation
} from '../../lib/apis/recruitment-api';
import { useToast } from '../common/toast/toast-context';

import { useQuery } from '@tanstack/react-query';
import { authQuery } from '../../lib/apis/auth-api';
import './recruitment-page.scss';

const RecruitmentPage = () => {
  const recruitmentPost = useQuery(recruitmentQuery);
  const auth = useQuery(authQuery);

  const recruitmentPostMutation = useRecruitmentPostMutation();
  const toast = useToast();

  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const messageToDisplay = message ?? recruitmentPost.data?.content ?? '';
  const titleToDisplay = title ?? recruitmentPost.data?.title ?? '';
  const isModified = title !== null || message !== null;

  const submitHandler: FormEventHandler<HTMLFormElement> = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();

      recruitmentPostMutation.mutate({ title: titleToDisplay, content: messageToDisplay });
    },
    [messageToDisplay, recruitmentPostMutation, titleToDisplay]
  );

  const resetHandler: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    e.stopPropagation();

    setMessage(null);
    setTitle(null);
  };

  const handleCopyClick = async (isHtml: boolean) => {
    const post = await recruitmentApi
      .getGeneratedPost(isHtml)
      .catch(() => toast('Failed to generate message', 'error'));

    if (post) {
      const type = isHtml ? 'text/html' : 'text/plain';
      setTimeout(() => {
        navigator.clipboard
          .write([
            new ClipboardItem({
              [type]: new Promise(resolve => resolve(new Blob([post], { type })))
            })
          ])
          .then(() => toast('Copied message to clipboard', 'success'))
          .catch(err => toast(`Failed to copy to clipboard - ${err}`, 'error'));
      });
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      onReset={resetHandler}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
    >
      <Box justifyContent="space-between" alignItems="center" display="flex">
        <Box gap={2} alignItems="center" display="flex">
          <h2>Recruitment Post</h2>
          {(auth.isLoading || recruitmentPost.isLoading) && <CircularProgress size={24} />}
        </Box>
        {auth.data?.permissions.RECRUITMENT && (
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
            <IconButton
              onClick={() =>
                navigator.clipboard
                  .writeText(titleToDisplay)
                  .then(() => toast('Copied title to clipboard.', 'success'))
                  .catch(e => toast(`Failed to copy title: ${e}`, 'error'))
              }
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </div>
        <TextField
          value={titleToDisplay}
          disabled={!auth.data?.permissions.RECRUITMENT || recruitmentPost.isLoading}
          required
          onChange={e => setTitle(e.target.value)}
          fullWidth
          name="Title"
          label="Title"
          InputProps={{ sx: { paddingRight: '45px' } }}
        />
      </div>
      <div
        style={{
          flex: 1,
          paddingTop: '16px',
          overflow: 'hidden',
          borderRadius: '4px'
        }}
        className="input-wrapper"
      >
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
          rows={1}
          value={messageToDisplay}
          disabled={!auth.data?.permissions.RECRUITMENT || recruitmentPost.isLoading}
          onChange={e => setMessage(e.target.value)}
          fullWidth
          sx={{ height: '100%' }}
          slotProps={{
            htmlInput: {
              style: {
                height: '95%',
                overflow: 'hidden',
                paddingRight: '95px',
                fontFamily: 'Consolas, Menlo, Ubuntu, Roboto, monospace'
              }
            },
            input: {
              sx: {
                height: '100%',
                paddingRight: '0px'
              },
              disableUnderline: true
            }
          }}
          name="message"
        />
      </div>
    </form>
  );
};

export default RecruitmentPage;
