import {
    Avatar,
    Typography,
    Link,
    FormControl,
    InputLabel,
    MenuItem,
    IconButton,
    Button, Box, CircularProgress, FormHelperText
} from '@mui/material';

import {useTheme} from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit.js";
import DeleteIcon from "@mui/icons-material/Delete.js";
import React, {useState} from "react";
import {usePage} from "@inertiajs/react";

import {Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
const HolidayTable = ({ holidaysData, handleClickOpen, setCurrentHoliday, openModal, setHolidaysData}) => {
    console.log(holidaysData)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const renderCell = (holiday, columnKey) => {
        const cellValue = holiday[columnKey];

        switch (columnKey) {
            case "title":
                return cellValue;
            case "from_date":
                return new Date(cellValue).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            case "to_date":
                return new Date(cellValue).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit Holiday">
              <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => {
                      setCurrentHoliday(holiday);
                      openModal('edit_holiday');
                  }}
              >
                <EditIcon />
              </span>
                        </Tooltip>
                        <Tooltip content="Delete Holiday" color="danger">
              <span
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  onClick={() => handleClickOpen(holiday.id, 'delete_holiday')}
              >
                <DeleteIcon />
              </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    };

    const columns = [
        { name: "Title", uid: "title" },
        { name: "From Date", uid: "from_date" },
        { name: "To Date", uid: "to_date" },
        { name: "Actions", uid: "actions" }
    ];

    return (
        <div style={{maxHeight: '84vh', overflowY: 'auto'}}>
            {holidaysData.length === 0 ? (
                <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                    No holidays
                </Typography>
            ) : (
                <Table
                    isStriped
                    selectionMode="multiple"
                    selectionBehavior={'toggle'}
                    isHeaderSticky
                    removeWrapper
                    aria-label="Holiday Table"
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={holidaysData}>
                        {(holiday) => (
                            <TableRow key={holiday.id}>
                                {(columnKey) => <TableCell style={{whiteSpace: 'nowrap'}}>{renderCell(holiday, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default HolidayTable;
