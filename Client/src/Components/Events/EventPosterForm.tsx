import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import React, { useCallback, useEffect, useState } from 'react';
import { usePostEvents } from '../../utils/apis/discord-api';
import { useEventSettings } from '../../utils/apis/event-api';
import { useToast } from '../Common/ToastContext';
import LoaderPage from '../LoaderPage';

interface Props {
  onClose: () => void;
}

const EventPosterForm = ({ onClose }: Props) => {
  const [editMessages, setEditMessages] = useState(false);
  const [postChannel, setPostChannel] = useState('');
  const [existingMessageIds, setExistingMessageIds] = useState({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: ''
  });
  const [posting, setPosting] = useState(false);
  const { isLoading, error, data } = useEventSettings();
  const postEventsMutation = usePostEvents();

  useEffect(() => {
    if (data) {
      setPostChannel(data.channelId || '');
      setEditMessages(data.editMessages || false);

      if (data.existingMessageIds) {
        setExistingMessageIds({
          Monday: data.existingMessageIds.Monday || '',
          Tuesday: data.existingMessageIds.Tuesday || '',
          Wednesday: data.existingMessageIds.Wednesday || '',
          Thursday: data.existingMessageIds.Thursday || '',
          Friday: data.existingMessageIds.Friday || '',
          Saturday: data.existingMessageIds.Saturday || '',
          Sunday: data.existingMessageIds.Sunday || ''
        });
      }
    }
  }, [data]);

  const submitHandler = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPosting(true);
      await postEventsMutation.mutateAsync({
        channelId: postChannel,
        editMessages,
        existingMessageIds
      });
      onClose();
      setPosting(false);
    },
    [postChannel, editMessages, existingMessageIds, setPosting, onClose]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, day: string) => {
      e.preventDefault();
      setExistingMessageIds({ ...existingMessageIds, [day]: e.target.value });
    },
    [existingMessageIds, setExistingMessageIds]
  );

  if (error) {
    return <>There was an error getting event post settings.</>;
  }

  if (isLoading || posting)
    return (
      <div style={{ height: '300px' }}>
        <LoaderPage />
      </div>
    );
  //
  return (
    <form onSubmit={submitHandler}>
      <div>
        <TextField
          onChange={e => setPostChannel(e.target.value)}
          value={postChannel}
          label="Channel ID to post to"
          size="small"
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
        label="Edit existing messages?"
      />
      {editMessages ? (
        <div style={{ marginTop: '16px' }}>
          {Object.entries(existingMessageIds).map(([day, value]) => (
            <TextField
              fullWidth
              size="small"
              margin="dense"
              key={day}
              variant="outlined"
              placeholder="Enter Message ID"
              label={day}
              InputLabelProps={{ shrink: true }}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, day)}
              disabled={posting}
              required
            />
          ))}
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
