import { Button, FormControlLabel, Switch, TextField } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import EventRepository from '../utils/EventRepository';

const EventPosterForm = ({ onClose, openToast }) => {
  const [loadingSettings, setLoadingSettings] = useState(true);
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

  useEffect(() => {
    const setupSettings = async () => {
      try {
        const settings = await EventRepository.getSettings();
        if (settings) {
          setPostChannel(settings.channelId || '');
          setEditMessages(settings.editMessages || false);

          if (settings.existingMessageIds) {
            setExistingMessageIds({
              Monday: settings.existingMessageIds.Monday || '',
              Tuesday: settings.existingMessageIds.Tuesday || '',
              Wednesday: settings.existingMessageIds.Wednesday || '',
              Thursday: settings.existingMessageIds.Thursday || '',
              Friday: settings.existingMessageIds.Friday || '',
              Saturday: settings.existingMessageIds.Saturday || '',
              Sunday: settings.existingMessageIds.Sunday || '',
            });
          }
        }
      } catch (err) {
        console.error(err);
        openToast('Error getting event settings', 'error');
      } finally {
        setLoadingSettings(false);
      }
    };
    setupSettings();
  }, [openToast]);

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

  return (
    <form onSubmit={submitHandler}>
      <div>
        <TextField
          onChange={(e) => setPostChannel(e.target.value)}
          value={postChannel}
          label="Channel ID to post to"
          disabled={posting || loadingSettings}
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
            disabled={posting || loadingSettings}
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
              disabled={posting || loadingSettings}
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
          disabled={posting || loadingSettings}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={posting || loadingSettings}
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default EventPosterForm;
