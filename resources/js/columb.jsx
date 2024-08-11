import {Avatar, Button, MenuItem, Select, TextField} from "@mui/material";
import React from "react";

const columns = [
    {
        name: 'Date',
        selector: row => row.date,
        sortable: true,
        center: true,
    },
    {
        name: 'RFI NO',
        selector: row => row.number,
        sortable: true,
        center: true,
        cell: row => (
            <>
                {row.number}
                {row.reports && row.reports.map(report => (
                    <div key={report.ref_no}>
                            <span className="badge badge-label bg-secondary">
                                <i className="mdi mdi-circle-medium"></i> NCR {report.ref_no}
                            </span>
                    </div>
                ))}
            </>
        ),
    },
    {
        name: 'Status',
        selector: row => row.status,
        sortable: true,
        center: true,
        cell: row => (
            <>
                    <span icon-task-id={row.id}>
                        <i
                            style={{color: getStatusColor(row.status)}}
                            className={getStatusIcon(row.status)}
                        ></i>
                    </span>
                <Select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row.id, e.target.value)}
                    style={{
                        marginBottom: 0,
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'center'
                    }}
                >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="resubmission">Resubmission</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
            </>
        ),
    },
    ...(auth.roles.includes('se') ? [{
        name: 'Assigned',
        selector: row => row.assigned,
        sortable: true,
        center: true,
        cell: row => (
            <div className="avatar-container">
                <Avatar src={`/assets/images/users/${row.assigned ? row.assigned : 'user-dummy-img'}.jpg`}
                        alt={row.assigned || 'Not assigned'} className="avatar rounded-circle avatar-xxs"/>
                <Select
                    value={row.assigned || ''}
                    onChange={(e) => handleAssignedChange(row.id, e.target.value)}
                    style={{
                        marginBottom: 0,
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'center'
                    }}
                >
                    <MenuItem value="" disabled>Please select</MenuItem>
                    {tasks.juniors.map(junior => (
                        <MenuItem key={junior.user_name} value={junior.user_name}>{junior.first_name}</MenuItem>
                    ))}
                </Select>
            </div>
        ),
    }] : []),
    {
        name: 'Type',
        selector: row => row.type,
        sortable: true,
        center: true,
    },
    {
        name: 'Description',
        selector: row => row.description,
        sortable: true,
        cell: row => (
            <span
                style={{overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '30ch', display: 'inline-block'}}
                title={row.description}
            >
                    {auth.roles.includes('se') || auth.roles.includes('qci' || 'aqci') ? row.description : row.description.substr(0, 30) + '...'}
                </span>
        ),
    },
    {
        name: 'Location',
        selector: row => row.location,
        sortable: true,
        center: true,
    },
    {
        name: 'Comments',
        selector: row => row.inspection_details,
        sortable: true,
        cell: row => (
            <div
                style={{cursor: 'pointer', width: 200, textAlign: 'center'}}
                className="inspection-details"
                onClick={() => handleEditInspectionDetails(row.id)}
            >
                    <span className="inspection-text" style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        WebkitLineClamp: 2,
                        lineClamp: 2
                    }}>
                        {row.inspection_details || 'N/A'}
                    </span>
                <TextField
                    className="inspection-input"
                    style={{
                        display: 'none',
                        marginBottom: 0,
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent'
                    }}
                    defaultValue={row.inspection_details}
                />
                <Button
                    className="save-btn"
                    style={{display: 'none'}}
                    variant="contained"
                    size="small"
                    onClick={() => handleSaveInspectionDetails(row.id)}
                >
                    Save
                </Button>
            </div>
        ),
    },
    {
        name: 'Road Type',
        selector: row => row.side,
        sortable: true,
        center: true,
    },
    {
        name: 'Quantity/Layer No.',
        selector: row => row.qty_layer,
        sortable: true,
        center: true,
    },
    ...(auth.roles.includes('admin') ? [{
        name: 'Incharge',
        selector: row => row.incharge,
        sortable: true,
        center: true,
        cell: row => (
            <div className="avatar-container">
                <Avatar src={`/assets/images/users/${row.incharge ? row.incharge : 'user-dummy-img'}.jpg`}
                        alt={row.incharge || 'Not assigned'} className="avatar rounded-circle avatar-xxs"/>
                <Select
                    value={row.incharge || ''}
                    onChange={(e) => handleInchargeChange(row.id, e.target.value)}
                    style={{
                        marginBottom: 0,
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'center'
                    }}
                >
                    <MenuItem value="" disabled>Please select</MenuItem>
                    {incharges.map(incharge => (
                        <MenuItem key={incharge.user_name} value={incharge.user_name}>{incharge.first_name}</MenuItem>
                    ))}
                </Select>
            </div>
        ),
    }] : []),
    {
        name: 'Completion Time',
        selector: row => row.completion_time,
        sortable: true,
        center: true,
        cell: row => (
            <TextField
                type="datetime-local"
                defaultValue={row.completion_time}
                onChange={(e) => handleCompletionTimeChange(row.id, e.target.value)}
                style={{border: 'none', outline: 'none', backgroundColor: 'transparent'}}
            />
        ),
    },
    {
        name: 'Resubmission Count',
        selector: row => row.resubmission_count,
        sortable: true,
        center: true,
        cell: row => (
            row.resubmission_count ? (
                <Button
                    variant="outlined"
                    size="small"
                    title="Resubmission Dates"
                    data-content={row.resubmission_date}
                >
                    {row.resubmission_count} {row.resubmission_count > 1 ? 'times' : 'time'}
                </Button>
            ) : ''
        ),
    },
    ...(auth.roles.includes('admin') ? [{
        name: 'RFI Submission Date',
        selector: row => row.rfi_submission_date,
        sortable: true,
        center: true,
        cell: row => (
            <TextField
                type="date"
                defaultValue={row.rfi_submission_date}
                onChange={(e) => handleRFISubmissionDateChange(row.id, e.target.value)}
                style={{border: 'none', outline: 'none', backgroundColor: 'transparent'}}
                disabled={!auth.roles.includes('admin')}
            />
        ),
    }] : []),
    {
        name: 'Actions',
        center: true,
        cell: row => (
            <div className="hstack gap-3 flex-wrap justify-content-center">
                <Button variant="contained" color="success" size="small" onClick={() => handleEdit(row.id)}>
                    <i className="ri-edit-2-line"></i>
                </Button>
                <Button variant="contained" color="error" size="small" onClick={() => handleDelete(row.id)}>
                    <i className="ri-delete-bin-line"></i>
                </Button>
            </div>
        ),
    },
];

<th className="dataTables-center">Date</th>
<th className="dataTables-center">RFI NO</th>
<th className="dataTables-center">Status</th>
${userIsSe ? `
<th class="dataTables-center">Assign</th>
` : ''}
<th className="dataTables-center">Type</th>
<th className="dataTables-center"></th>
<th className="dataTables-center"></th>
<th className="dataTables-center">Comments</th>
<th className="dataTables-center"></th>
<th className="dataTables-center"></th>
<th className="dataTables-center"></th>
${userIsAdmin ? `
<th class="dataTables-center"></th>
` : ''}
<th className="dataTables-center"></th>
<th className="dataTables-center"></th>
${userIsAdmin ? `
<th class="dataTables-center"></th>` : ''}
${userIsAdmin || userIsSe ? `
<th class="dataTables-center"></th>
` : ''}
$
{
    userIsAdmin ? `
        <th class="dataTables-center"></th>
