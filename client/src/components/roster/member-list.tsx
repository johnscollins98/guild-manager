import { type PopoverPosition } from '@mui/material';
import { memo, useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import type { DiscordRole } from 'server';
import type MemberRecord from '../../lib/interfaces/member-record';
import GuildMemberCard from './guild-member-card';
import { RosterMenuDialogs } from './roster-menu-dialogs';

interface Props {
  kickSelection: string[];
  setKickSelection: Dispatch<SetStateAction<string[]>>;
  onKick: (member: MemberRecord) => void;
  kickMode: boolean;
  discordRoles: DiscordRole[];
  rosterForDisplay: MemberRecord[];
  roster: MemberRecord[];
}

const RosterListImpl = ({
  kickSelection,
  setKickSelection,
  onKick,
  kickMode,
  discordRoles,
  rosterForDisplay,
  roster
}: Props) => {
  const [menuAnchor, setMenuAnchor] = useState<PopoverPosition | undefined>(undefined);

  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(undefined);

  const onMenuOpen = useCallback((member: MemberRecord, v: PopoverPosition | undefined) => {
    setSelectedRecordId(member.memberId || member.discordId);
    setMenuAnchor(v);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuAnchor(undefined);
  }, []);

  return (
    <>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            rowCount={rosterForDisplay.length}
            rowHeight={62}
            rowRenderer={({ index, style }) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const member = rosterForDisplay[index]!;
              return (
                <div style={style} key={member.memberId ?? member.discordId}>
                  <GuildMemberCard
                    key={member.memberId ?? member.discordId}
                    member={member}
                    discordRoles={discordRoles}
                    openMenu={v => onMenuOpen(member, v)}
                    selection={kickSelection}
                    setSelection={setKickSelection}
                    kickMode={kickMode}
                  />
                </div>
              );
            }}
          />
        )}
      </AutoSizer>
      <RosterMenuDialogs
        roster={roster}
        menuAnchor={menuAnchor}
        closeMenu={closeMenu}
        onKick={onKick}
        selectedRecordId={selectedRecordId}
        setSelectedRecordId={setSelectedRecordId}
      />
    </>
  );
};

export const RosterList = memo(RosterListImpl);
