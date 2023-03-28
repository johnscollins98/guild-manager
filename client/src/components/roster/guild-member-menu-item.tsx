import MenuItem from '@mui/material/MenuItem';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import './guild-member-menu-item.scss';

interface Props {
  action: () => void;
  Icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>;
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
  );
};

export default GuildMemberMenuItem;
