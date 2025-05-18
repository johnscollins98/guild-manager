import { useQuery } from '@tanstack/react-query';
import React, { use } from 'react';
import { type DiscordMemberDTO } from 'server';
import { eventRolesQuery } from '../../lib/apis/auth-api';
import { discordMembersQuery } from '../../lib/apis/discord-api';

export const EventLeadersContext = React.createContext<DiscordMemberDTO[]>([]);

export const useEventLeaders = () => use(EventLeadersContext);

export const EventLeadersProvider = ({ children }: { children: React.ReactNode }) => {
  const eventRoles = useQuery({
    ...eventRolesQuery,
    throwOnError: true
  });

  const discordMembers = useQuery({
    ...discordMembersQuery,
    throwOnError: true
  });

  const leaders =
    discordMembers.data?.filter(m => m.roles.some(r => eventRoles.data?.includes(r.id))) ?? [];

  return <EventLeadersContext.Provider value={leaders}>{children}</EventLeadersContext.Provider>;
};
