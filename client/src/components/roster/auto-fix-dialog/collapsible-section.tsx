import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, IconButton, Stack, Typography } from '@mui/material';
import { useState, type KeyboardEvent, type ReactNode } from 'react';

interface Props {
  title: ReactNode;
  label: string;
  actions?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection = ({ title, label, actions, children, defaultExpanded = true }: Props) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const toggle = () => setExpanded(open => !open);
  const handleTitleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            size="small"
            aria-label={`Toggle ${label}`}
            aria-expanded={expanded}
            onClick={toggle}
          >
            <ExpandMore
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 150ms'
              }}
            />
          </IconButton>
          <Typography
            variant="subtitle1"
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            onClick={toggle}
            onKeyDown={handleTitleKeyDown}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          >
            {title}
          </Typography>
        </Stack>
        {actions}
      </Stack>
      <Collapse in={expanded} sx={{ pt: 0.5 }}>
        {children}
      </Collapse>
    </Stack>
  );
};

export default CollapsibleSection;
