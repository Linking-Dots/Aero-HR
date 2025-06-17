import React from 'react';
import { Dots } from 'react-preloaders';

/**
 * Loader Component - Atomic Design: Atom
 * 
 * A simple loading spinner component using react-preloaders.
 * Provides visual feedback during asynchronous operations.
 * 
 * @component
 * @returns {JSX.Element} Rendered Loader component
 * 
 * @example
 * <Loader />
 */
const Loader = () => {
    return (
        <div 
            className="spinner-container"
            role="status"
            aria-label="Loading"
            data-testid="loader"
        >
            <Dots 
                animation="fade" 
                background="rgba(0, 0, 0, 0.5)" 
                color="#3498db" 
                size={60} 
            />
        </div>
    );
};

export default Loader;
