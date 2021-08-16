import React from 'react';
import './GuildMemberMenuItem.scss';

import MenuItem from '@material-ui/core/MenuItem';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon';

interface Props {
  action: () => void;
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  label: string;
  disabled: boolean;
  className?: string;
}

const GuildMemberMenuItem = ({ action, Icon, label, disabled, className }: Props) => {
  return (
    <MenuItem disabled={disabled} onClick={action}>
      <span className={`menu-item ${className ? className : ''}`}>
        {<Icon className="icon" />}
        {label}
      </span>
    </MenuItem>
  )
}

export default GuildMemberMenuItem