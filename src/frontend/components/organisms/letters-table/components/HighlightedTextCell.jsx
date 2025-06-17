/**
 * Highlighted Text Cell Component
 * 
 * Displays text with search term highlighting and tooltip support.
 */

import React from 'react';
import { Box } from '@mui/material';
import { Tooltip } from '@heroui/react';
import { LETTERS_CONFIG } from '../config';

const HighlightedTextCell = ({ 
  text, 
  searchTerm, 
  showTooltip = false,
  maxLines = 2 
}) => {
  const highlightText = (content) => {
    if (!searchTerm) return content;

    const searchTerms = searchTerm.split(' ').filter(Boolean);
    const regex = new RegExp(`(${searchTerms.join('|')})`, 'gi');
    const parts = content.split(regex);

    return parts.map((part, index) =>
      searchTerms.some(term => part.toLowerCase() === term.toLowerCase()) ? (
        <span 
          key={index} 
          style={{ 
            backgroundColor: LETTERS_CONFIG.searchHighlight.backgroundColor,
            color: LETTERS_CONFIG.searchHighlight.color,
            fontWeight: LETTERS_CONFIG.searchHighlight.fontWeight
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const textBox = (
    <Box sx={{
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      display: '-webkit-box',
      WebkitLineClamp: maxLines,
      WebkitBoxOrient: 'vertical',
    }}>
      {highlightText(text)}
    </Box>
  );

  if (showTooltip && text && text.length > 50) {
    return (
      <Tooltip
        content={text}
        placement={LETTERS_CONFIG.tooltip.placement}
        showArrow={LETTERS_CONFIG.tooltip.showArrow}
        radius={LETTERS_CONFIG.tooltip.radius}
        size={LETTERS_CONFIG.tooltip.size}
        classNames={{
          content: [
            'bg-transparent backdrop-blur-lg border border-gray-200',
            `max-w-[${LETTERS_CONFIG.tooltip.maxWidth}] text-sm`,
          ]
        }}
      >
        {textBox}
      </Tooltip>
    );
  }

  return textBox;
};

export default HighlightedTextCell;
