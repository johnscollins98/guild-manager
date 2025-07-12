import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { usePostEvents } from '../../lib/apis/discord-api';
import { useEventSettings } from '../../lib/apis/event-api';
import LoaderPage from '../common/loader-page';

interface Props {
  onClose: () => void;
}

const EventPosterForm = ({ onClose }: Props) => {
  const [editMessages, setEditMessages] = useState(false);
  const [postChannel, setPostChannel] = useState('');
  const [messageId, setMessageId] = useState('');
  const [posting, setPosting] = useState(false);
  const { data } = useEventSettings();
  const postEventsMutation = usePostEvents();

  useEffect(() => {
    if (data) {
      setPostChannel(data.channelId ?? '');
      setEditMessages(data.editMessages);
      setMessageId(data.messageId ?? '');
    }
  }, [data]);

  const submitHandler = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPosting(true);

      await postEventsMutation.mutateAsync({
        channelId: postChannel,
        editMessages,
        messageId: messageId
      });

      onClose();
      setPosting(false);
    },
    [postChannel, editMessages, messageId, setPosting, onClose, postEventsMutation]
  );

  if (posting)
    return (
      <div style={{ height: '300px' }}>
        <LoaderPage />
      </div>
    );

  return (
    <form onSubmit={submitHandler}>
      <div>
        <TextField
          onChange={e => setPostChannel(e.target.value)}
          value={postChannel}
          label="Channel ID to post to"
          size="small"
          variant="standard"
          margin="dense"
          fullWidth
          disabled={posting}
          required
        />
      </div>
      <FormControlLabel
        control={
          <Switch
            checked={editMessages}
            onChange={e => {
              setEditMessages(e.target.checked);
            }}
            disabled={posting}
          />
        }
        label="Edit existing message?"
      />
      {editMessages ? (
        <div style={{ marginTop: '16px' }}>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            variant="standard"
            placeholder="Enter Message ID"
            label="Message ID"
            InputLabelProps={{ shrink: true }}
            value={messageId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageId(e.target.value)}
            disabled={posting}
            required
          />
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '16px'
        }}
      >
        <Button variant="text" onClick={onClose} style={{ marginRight: '8px' }} disabled={posting}>
          Close
        </Button>
        <Button variant="contained" color="primary" type="submit" disabled={posting}>
          Submit
        </Button>
      </div>
    </form>
  );
};

export default EventPosterForm;
