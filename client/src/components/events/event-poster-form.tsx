import { Autocomplete, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useQuery, useSuspenseQueries } from '@tanstack/react-query';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  discordBotQuery,
  discordChannelsQuery,
  discordMessagesQuery,
  usePostEvents
} from '../../lib/apis/discord-api';
import { eventSettingsQuery } from '../../lib/apis/event-api';
import LoaderPage from '../common/loader-page';

interface Props {
  onClose: () => void;
}

const EventPosterForm = ({ onClose }: Props) => {
  const [editMessages, setEditMessages] = useState(false);
  const [postChannel, setPostChannel] = useState('');
  const [messageId, setMessageId] = useState('');
  const [posting, setPosting] = useState(false);

  const [eventSettings, channels, bot] = useSuspenseQueries({
    queries: [eventSettingsQuery, discordChannelsQuery, discordBotQuery]
  });

  const messages = useQuery({ ...discordMessagesQuery(postChannel), enabled: postChannel !== '' });

  const messageOptions = useMemo(() => {
    return Object.fromEntries(
      messages.data
        ?.filter(m => m.author.id === bot.data.id)
        .map(m => [
          m.id,
          `${m.author.username} on ${new Date(m.timestamp).toLocaleString(undefined)}`
        ]) ?? []
    );
  }, [messages.data, bot.data]);

  const postEventsMutation = usePostEvents();

  const availableChannels = useMemo(() => {
    return Object.fromEntries(channels.data.filter(c => c.type === 0).map(c => [c.id, c]));
  }, [channels]);

  const channelIds = useMemo(
    () =>
      Object.values(availableChannels)
        .sort((a, b) => a.position - b.position)
        .map(c => c.id),
    [availableChannels]
  );

  console.log(channelIds);

  useEffect(() => {
    if (eventSettings.data) {
      setPostChannel(eventSettings.data.channelId ?? '');
      setEditMessages(eventSettings.data.editMessages);
      setMessageId(eventSettings.data.messageId ?? '');
    }
  }, [eventSettings.data]);

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
        <Autocomplete
          onChange={(_e, v) => {
            setPostChannel(v ?? '');
            setMessageId('');
          }}
          getOptionKey={o => o}
          options={channelIds}
          getOptionLabel={c => availableChannels[c]?.name ?? ''}
          value={postChannel}
          renderInput={r => (
            <TextField
              {...r}
              label="Channel ID to post to"
              size="small"
              variant="standard"
              margin="dense"
              required
            />
          )}
          filterOptions={(options, v) =>
            options.filter(
              o =>
                o.includes(v.inputValue) ||
                availableChannels[o]?.name?.toLowerCase().includes(v.inputValue.toLowerCase())
            )
          }
          fullWidth
          disabled={posting}
        ></Autocomplete>
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
          <Autocomplete
            fullWidth
            renderInput={r => (
              <TextField {...r} margin="dense" variant="standard" label="Message ID" required />
            )}
            size="small"
            value={messageId}
            options={Object.keys(messageOptions)}
            getOptionLabel={id => messageOptions[id] ?? ''}
            filterOptions={(options, v) =>
              options.filter(
                o =>
                  o.includes(v.inputValue) ||
                  messageOptions[o]?.toLowerCase().includes(v.inputValue.toLowerCase())
              )
            }
            onChange={(_e, v) => setMessageId(v ?? '')}
            disabled={posting || messages.isPending || messages.isError}
          ></Autocomplete>
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
