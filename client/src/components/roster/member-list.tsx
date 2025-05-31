import { memo, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AutoSizer, List } from 'react-virtualized';
import { useAuth } from '../../lib/apis/auth-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { useFilterString } from '../../lib/utils/use-filter-string';
import GuildMemberCard from './guild-member-card';
import { useRoster } from './use-roster';

interface Props {
  selection: string[];
  setSelection: Dispatch<SetStateAction<string[]>>;
  onKick: (member: MemberRecord) => void;
  onEdit: (member: MemberRecord) => void;
  kickMode: boolean;
}

const RosterListImpl = ({ selection, setSelection, onKick, onEdit, kickMode }: Props) => {
  const filterString = useFilterString();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') ?? '';
  const filterBy = searchParams.get('filterBy') ?? '';
  const ascending = searchParams.get('sortOrder') === 'ASC';
  const { discordRoles, rosterForDisplay, botRoles } = useRoster(
    sortBy,
    ascending,
    filterString,
    filterBy
  );

  const { data: authInfo } = useAuth();

  return (
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
                  botRoles={botRoles}
                  onKick={onKick}
                  onEdit={onEdit}
                  authInfo={authInfo}
                  selection={selection}
                  setSelection={setSelection}
                  kickMode={kickMode}
                />
              </div>
            );
          }}
        />
      )}
    </AutoSizer>
  );
};

export const RosterList = memo(RosterListImpl);
