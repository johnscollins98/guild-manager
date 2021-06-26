import React, { useCallback, useEffect, useState } from 'react';

import EventRepository from '../utils/EventRepository';
import LoaderPage from './LoaderPage';

import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';

import { useQuery } from 'react-query';

const EventPosterForm = ({ onClose, openToast }) => {
  const [editMessages, setEditMessages] = useState(false);
  const [postChannel, setPostChannel] = useState('');
  const [existingMessageIds, setExistingMessageIds] = useState({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: '',
  });
  const [posting, setPosting] = useState(false);
  const { isLoading, error, data } = useQuery('event-settings', () =>
    EventRepository.getSettings()
  );

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
          Sunday: data.existingMessageIds.Sunday || '',
        });
      }
    }
  }, [data]);

  const submitHandler = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        setPosting(true);
        await EventRepository.postEventsToDiscord({
          channelId: postChannel,
          editMessages,
          existingMessageIds,
        });
        openToast('Posted!', 'success');
        onClose();
      } catch (err) {
        console.error(err);
        openToast('Something went wrong posting to discord', 'error');
      } finally {
        setPosting(false);
      }
    },
    [
      postChannel,
      editMessages,
      existingMessageIds,
      setPosting,
      openToast,
      onClose,
    ]
  );

  const handleChange = useCallback(
    (e, day) => {
      e.preventDefault();
      setExistingMessageIds({ ...existingMessageIds, [day]: e.target.value });
    },
    [existingMessageIds, setExistingMessageIds]
  );

  if (error) {
    openToast('There was an error getting the log', 'error');
    console.error(error);
    return null;
  }
  if (isLoading || posting)
    return (
      <div style={{ height: '300px' }}>
        <LoaderPage />;
      </div>
    );
  //
  return (
    <form onSubmit={submitHandler}>
      <div>
        <TextField
          onChange={(e) => setPostChannel(e.target.value)}
          value={postChannel}
          label="Channel ID to post to"
          disabled={posting}
          required
        />
      </div>
      <FormControlLabel
        control={
          <Switch
            checked={editMessages}
            onChange={(e) => {
              setEditMessages(e.target.checked);
            }}
            disabled={posting}
          />
        }
        label="Edit existing messages?"
      />
      {editMessages ? (
        <div style={{ marginTop: '16px' }}>
          {Object.keys(existingMessageIds).map((day) => (
            <TextField
              fullWidth
              key={day}
              style={{ marginBottom: '8px' }}
              variant="outlined"
              placeholder="Enter Message ID"
              label={day}
              InputLabelProps={{ shrink: true }}
              value={existingMessageIds[day]}
              onChange={(e) => handleChange(e, day)}
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
          marginTop: '16px',
        }}
      >
        <Button
          variant="contained"
          onClick={onClose}
          style={{ marginRight: '8px' }}
          disabled={posting}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={posting}
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default EventPosterForm;
