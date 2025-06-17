/**
 * Letter Link Cell Component
 * 
 * Displays links to letters and handling memos with appropriate icons.
 */

import React from 'react';
import { Link } from '@heroui/react';
import { 
  Mail as MailIcon,
  Link as LinkIcon 
} from '@mui/icons-material';

const LetterLinkCell = ({ 
  href, 
  text, 
  type = 'memo', // 'memo' or 'handling'
  isExternal = true 
}) => {
  const icon = type === 'memo' ? <MailIcon /> : <LinkIcon />;
  const color = type === 'memo' ? 'foreground' : 'primary';

  return (
    <Link
      isExternal={isExternal}
      color={color}
      isBlock
      showAnchorIcon
      href={href || '#'}
      anchorIcon={icon}
    >
      {text || 'N/A'}
    </Link>
  );
};

export default LetterLinkCell;
