import React from 'react';
import StatsCards from './StatsCards';

/**
 * Single StatsCard component - wrapper around StatsCards for backward compatibility
 * @param {Object} props - Single stat object with structure: 
 *   { title, value, icon, color, description, iconBg?, valueColor?, customStyle? }
 */
const StatsCard = (props) => {
    // If props contains a stats array, use it directly
    if (props.stats) {
        return <StatsCards {...props} />;
    }
    
    // Otherwise, wrap the single props into a stats array
    const stats = [props];
    
    return <StatsCards stats={stats} gridCols="grid-cols-1" />;
};

export default StatsCard;
