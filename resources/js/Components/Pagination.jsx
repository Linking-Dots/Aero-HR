import React from 'react';
import { Box, Pagination as MuiPagination } from '@mui/material';

const Pagination = ({ 
    currentPage = 1, 
    totalPages = 1, 
    onPageChange, 
    ...props 
}) => {
    const handleChange = (event, value) => {
        if (onPageChange) {
            onPageChange(value);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <MuiPagination 
                count={totalPages}
                page={currentPage}
                onChange={handleChange}
                color="primary"
                variant="outlined"
                shape="rounded"
                {...props}
            />
        </Box>
    );
};

export default Pagination;
