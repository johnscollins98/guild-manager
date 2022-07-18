import MenuItem from '@mui/material/MenuItem';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import './GuildMemberMenuItem.scss';

interface Props {
  action: () => void;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
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