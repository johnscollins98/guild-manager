import React from 'react';
import { type DiscordMemberDTO } from 'server';

export const EventLeadersContext = React.createContext<DiscordMemberDTO[]>([]);
