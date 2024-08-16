// import React, {useEffect, useRef, useState} from 'react';
// import ReactDOM from 'react-dom';
// import {Select, MenuItem, TextField, Button, InputLabel, FormControl, Avatar, Collapse} from '@mui/material';
// import {usePage} from "@inertiajs/react";
// import {mode} from "@chakra-ui/theme-tools";
// import jszip from 'jszip';
// import pdfmake from 'pdfmake';
// import DataTable from 'datatables.net-dt';
// import 'datatables.net-dt/css/dataTables.dataTables.css';
// import 'datatables.net-buttons-dt';
// import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
// import 'datatables.net-buttons/js/buttons.colVis.mjs';
// import 'datatables.net-buttons/js/buttons.html5.mjs';
// import 'datatables.net-buttons/js/buttons.print.mjs';
// import 'datatables.net-fixedheader-dt';
// import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';
// import 'datatables.net-scroller-dt';
// import 'datatables.net-scroller-dt/css/scroller.dataTables.css';
//
// import {useToast} from "@/Contexts/ToastContext.jsx";
//
//
//
// const TaskTable = ({ tasks, incharges, juniors, reports }) => {
//     const { auth } = usePage().props;
//     const toast = useToast();
//     const tableRef = useRef(null);
//     const [dataTableInstance, setDataTableInstance] = useState(null);
//     const [initComplete, setInitComplete] = useState(null);
//
//     const [tableData, setTableData] = useState(tasks);
//
//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'new':
//                 return 'blue';
//             case 'resubmission':
//                 return 'orange';
//             case 'completed':
//                 return 'green';
//             case 'emergency':
//                 return 'red';
//             default:
//                 return '';
//         }
//     };
//
//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'new':
//                 return 'ri-add-circle-line fs-17 align-middle';
//             case 'resubmission':
//                 return 'ri-timer-2-line fs-17 align-middle';
//             case 'completed':
//                 return 'ri-checkbox-circle-line fs-17 align-middle';
//             case 'emergency':
//                 return 'ri-information-line fs-17 align-middle';
//             default:
//                 return '';
//         }
//     };
//
//
//
//
//     const handleAssignedChange = (taskId, assigned) => {
//         console.log('Assigned changed:', taskId, assigned);
//         // Handle assigned change logic
//     };
//
//     const handleInchargeChange = (taskId, incharge) => {
//         console.log('Incharge changed:', taskId, incharge);
//         // Handle incharge change logic
//     };
//
//     const handleCompletionTimeChange = (taskId, completionTime) => {
//         console.log('Completion time changed:', taskId, completionTime);
//         // Handle completion time change logic
//     };
//
//     const handleRFISubmissionDateChange = (taskId, rfiSubmissionDate) => {
//         console.log('RFI submission date changed:', taskId, rfiSubmissionDate);
//         // Handle RFI submission date change logic
//     };
//
//     const handleEditInspectionDetails = (taskId) => {
//         console.log('Edit inspection details:', taskId);
//         // Handle inspection details edit logic
//     };
//
//     const handleSaveInspectionDetails = (taskId) => {
//         console.log('Save inspection details:', taskId);
//         // Handle inspection details save logic
//     };
//
//     const handleEdit = (taskId) => {
//         console.log('Edit task:', taskId);
//         // Handle edit task logic
//     };
//
//     const handleDelete = (taskId) => {
//         console.log('Delete task:', taskId);
//         // Handle delete task logic
//     };
//
//     useEffect(() => {
//         const handleStatusChange = async (rowId, newStatus) => {
//
//             const updatedData = tableData.map(row =>
//                 row.id === rowId ? { ...row, status: newStatus } : row
//             );
//             setTableData(updatedData);
//             // const selectElement = event.target;
//             // const taskId = selectElement.dataset.taskId;
//             // const newStatus = selectElement.value;
//             console.log('Status changed:', rowId, newStatus);
//             try {
//                 const response = await fetch(route('updateTaskStatus'), {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
//                     },
//                     body: JSON.stringify({id: rowId, status: newStatus}),
//                 });
//
//                 const data = await response.json();
//                 if (response.ok) {
//                     // Update the icon directly using the React state
//                     // This should be automatically handled by React state update
//                     toast.current.show({
//                         severity: 'success',
//                         detail: `${data.message} ${newStatus}`,
//                         life: 2000
//                     });
//
//                     if (newStatus === 'completed') {
//                         document.querySelector('#completionDateTime')?.click();
//                     }
//                 } else {
//                     console.error('Error:', data.message);
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//         };
//         // Initialize DataTable
//         const table = new DataTable(tableRef.current, {
//             initComplete: function (settings, json) {
//                 const interval = setInterval(() => {
//                     setInitComplete(true);
//                 }, 1500);
//                 return () => clearInterval(interval);
//             },
//             layout: {
//                 topStart: {
//                     buttons: ['copy', 'excel', 'pdf', 'print']
//                 }
//             },
//             processing: true,
//             language: {
//                 processing: "<i class='fa fa-refresh fa-spin'></i>",
//                 search: '<span class="mdi mdi-magnify search-widget-icon"></span>',
//             },
//             destroy: true,
//             order: [[0, 'desc']],
//             scroller: true,
//             scrollCollapse: true,
//             scrollY: '50vh',
//             deferRender: true,
//             fixedHeader: {
//                 header: true,
//                 footer: true
//             },
//             data: tasks, // Pass tasks data to DataTable
//             columnDefs: [
//                 {
//                     targets: 1, // Target the date and number columns
//                     render: function (data, type, row, meta) {
//                         if (meta.col === 1) {
//                             let badgeHTML = '';
//                             if (row.reports && row.reports.length > 0) {
//                                 row.reports.forEach(report => {
//                                     badgeHTML += `<div><span class="badge badge-label bg-secondary"><i class="mdi mdi-circle-medium"></i>${report.ref_no}</span></div>`;
//                                 });
//                             }
//                             return data + badgeHTML;
//                         }
//                         return data;
//                     }
//                 },
//                 {
//                     targets: auth.roles.includes('admin') ? -2 : auth.roles.includes('se') ? -1 : -2, // Target the last column
//                     render: function (data, type, row, meta) {
//                         let reportOptions = `<select style="margin-bottom: 0rem !important; border: none; outline: none; background-color: transparent; text-align: center" class="attachReportDropdown" data-task-id="${row.id}">`;
//                         reportOptions += `<option value="none" selected>None</option>`;
//
//                         if (reports.length > 0) {
//                             reportOptions += `<optgroup label="Reports">`;
//                             reports.forEach(report => {
//                                 let selected = row.reports && row.reports.some(rowReport => rowReport.ref_no === report.ref_no) ? 'selected="selected"' : '';
//                                 reportOptions += `<option value="${report.ref_no}" ${selected}>${report.ref_no}</option>`;
//                             });
//                             reportOptions += `</optgroup>`;
//                         }
//
//                         reportOptions += `</select>`;
//                         return reportOptions;
//                     }
//                 },
//                 {
//                     targets: auth.roles.includes('se') ? 5 : 4,
//                     className: 'description-column',
//                     render: function (data, type, row) {
//                         return type === 'display' && data.length > 30
//                             ? auth.roles.includes('se') || auth.roles.includes('qci' || 'aqci')
//                                 ? `<span style="overflow-x: auto; white-space: nowrap; max-width: 30ch; display: inline-block;" title="${data}">${data}</span>`
//                                 : auth.roles.includes('admin')
//                                     ? `<span style="overflow-y: auto; max-height: 30px;" title="${data}">${data.substr(0, 30)}...</span>`
//                                     : ''
//                             : data;
//                     }
//                 }
//             ],
//             columns: [
//                 { data: 'date', title: 'Date', className: 'dataTables-center' },
//                 { data: 'number', title: 'RFI No.', className: 'dataTables-center' },
//                 {
//                     data: 'status',
//                     title: 'Status',
//                     selector: row => row.status,
//                     createdCell: function (td, cellData, rowData, row, col) {
//                         ReactDOM.render(
//                             <>
//                                 <Select
//                                     value={rowData.status}
//                                     onChange={(e) => handleStatusChange(row, e.target.value)}
//                                     style={{
//                                         marginBottom: 0,
//                                         border: 'none',
//                                         outline: 'none',
//                                         backgroundColor: 'transparent',
//                                         textAlign: 'center'
//                                     }}
//                                 >
//                                     <MenuItem value="new">
//                                         <span icon-task-id={rowData.id}>
//                                             <i
//                                                 style={{color: getStatusColor("new")}}
//                                                 className={getStatusIcon("new")}
//                                             ></i>
//                                         </span>
//                                         New
//                                     </MenuItem>
//                                     <MenuItem value="resubmission">
//                                         <span icon-task-id={rowData.id}>
//                                             <i
//                                                 style={{color: getStatusColor("resubmission")}}
//                                                 className={getStatusIcon("resubmission")}
//                                             ></i>
//                                         </span>
//                                         Resubmission
//                                     </MenuItem>
//                                     <MenuItem value="completed">
//                                         <span icon-task-id={rowData.id}>
//                                             <i
//                                                 style={{color: getStatusColor("completed")}}
//                                                 className={getStatusIcon("completed")}
//                                             ></i>
//                                         </span>
//                                         Completed
//                                     </MenuItem>
//                                     <MenuItem value="emergency">
//                                         <span icon-task-id={rowData.id}>
//                                             <i
//                                                 style={{color: getStatusColor("emergency")}}
//                                                 className={getStatusIcon("emergency")}
//                                             ></i>
//                                         </span>
//                                         Emergency
//                                     </MenuItem>
//                                 </Select>
//                             </>, td
//                         );
//                     },
//                     className: 'dataTables-center'
//                 },
//                 auth.roles.includes('se') ? {
//                     data: 'assigned',
//                     title: 'Assigned',
//                     render: function (data, type, row) {
//                         let assignOptions = !data ? '<option value="" selected disabled>Please select</option>' : '';
//                         let avatar = `<img src="{{ asset("assets/images/users/") }}${data ? '/' + data : '/user-dummy-img'}.jpg" alt="${data ? data : 'Not assigned'}" class="avatar rounded-circle avatar-xxs" />`;
//                         juniors.forEach(junior => {
//                             assignOptions += `<option value="${junior.user_name}" ${data === junior.user_name ? 'selected' : ''}>${junior.first_name}</option>`;
//                         });
//                         const assignJunior = `<select id="assign-dropdown" style="margin-bottom: 0rem !important; border: none; outline: none; background-color: transparent; text-align: center" data-task-id="${row.id}">${assignOptions}</select>`;
//                         return `<div class="avatar-container">${avatar}${assignJunior}</div>`;
//                     },
//                     className: 'dataTables-center'
//                 } : '',
//                 { data: 'type', title: 'Type', className: 'dataTables-center' },
//                 { data: 'description',title: 'Description' },
//                 { data: 'location',title: 'Location', className: 'dataTables-center' },
//                 {
//                     data: 'inspection_details',
//                     title: 'Results/Comments',
//                     render: function (data, type, row) {
//                         return `
//                             <div style="cursor: pointer; width: 200px; ${data ? '' : 'text-align: center;'}" class="inspection-details" id="inspectionDetails" ${auth.roles.includes('admin') ? '' : 'onclick="editInspectionDetails(this)"'} data-task-id="${row.id}">
//                                 <span class="inspection-text" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; -webkit-line-clamp: 2; line-clamp: 2;">${data ? data : 'N/A'}</span>
//                                 <textarea class="inspection-input" style="display: none; margin-bottom: 0rem !important; border: none; outline: none; background-color: transparent;"></textarea>
//                                 <button style="display: none;" type="button" class="save-btn btn btn-light btn-sm">Save</button>
//                             </div>`;
//                     }
//                 },
//                 { data: 'side',title: 'Road Type', className: 'dataTables-center' },
//                 { data: 'qty_layer',title: 'Quantity/Layer No.', className: 'dataTables-center' },
//                 { data: 'planned_time',title: 'Planned Time', className: 'dataTables-center' },
//                 auth.roles.includes('admin') ? {
//                     data: 'incharge',
//                     title: 'In-charge',
//                     render: function (data, type, row) {
//                         let inchargeOptions = !data ? '<option value="" selected disabled>Please select</option>' : '';
//
//                         // Constructing the avatar URL
//                         const avatarUrl = row.incharge
//                             ? `assets/images/users/${row.incharge}.jpg`
//                             : `asset('assets/images/users/user-dummy-img.jpg`;
//
//                         // Creating the avatar HTML
//                         let avatar = `<img src="${avatarUrl}" class="avatar rounded-circle avatar-xxs" />`;
//
//                         // Generating the incharge options
//                         incharges.forEach(incharge => {
//                             inchargeOptions += `<option value="${incharge.user_name}" ${data === incharge.user_name ? 'selected' : ''}>${incharge.first_name}</option>`;
//                         });
//
//                         // Creating the select dropdown HTML
//                         const assignIncharge = `<select id="incharge-dropdown" style="margin-bottom: 0rem !important; border: none; outline: none; background-color: transparent; text-align: center" data-task-id="${row.id}">${inchargeOptions}</select>`;
//
//                         // Returning the complete HTML
//                         return `<div class="avatar-container">${avatar}${assignIncharge}</div>`;
//                     },
//                     className: 'dataTables-center'
//                 } : '',
//                 {
//                     data: 'completion_time',
//                     title: 'Completion Date/Time',
//                     render: function (data, type, row) {
//                         return `<input data-task-id="${row.id}" value="${data ? data : ''}" style="border: none; outline: none; background-color: transparent;" type="datetime-local" id="completionDateTime" name="completion_time">`;
//                     },
//                     className: 'dataTables-center'
//                 },
//                 {
//                     data: 'resubmission_count',
//                     title: 'Resubmitted',
//                     render: function (data, type, row) {
//                         return data ? `<td style="text-align: center" class="client_name" title="">
//                             <button type="button" class="btn btn-sm btn-lg" tabindex="0" role="button" data-toggle="popover" data-trigger="focus" data-placement="top" title="Resubmission Dates" data-content="${row.resubmission_date}">${data > 1 ? data + " times" : data + " time"}</button>
//                         </td>` : '';
//                     },
//                     className: 'dataTables-center'
//                 },
//                 auth.roles.includes('admin') ? {
//                     data: 'rfi_submission_date',
//                     title: 'RFI Submission Date',
//                     render: function (data, type, row) {
//                         return `<input ${auth.roles.includes('admin') ? '' : 'disabled'} value="${data ? data : ''}" data-task-id="${row.id}" data-task-status="${row.status}" style="border: none; outline: none; background-color: transparent;" type="date" id="rfiSubmissionDate" name="rfi_submission_date">`;
//                     },
//                     className: 'dataTables-center'
//                 } : '',
//                 auth.roles.includes('admin') || auth.roles.includes('se') ? {
//                     data: null,
//                     title: 'Attach/Detach Report',
//                     className: 'dataTables-center',
//                     defaultContent: ''
//                 } : '',
//                 auth.roles.includes('admin') ? {
//                     data: null,
//                     title: 'Actions',
//                     className: 'dataTables-center',
//                     render: function (data, type, row, meta) {
//                         return `<td class="dataTables-center" style="text-align: center;">
//                             <div class="hstack gap-3 flex-wrap justify-content-center">
//                                 <a style="text-align: center" href="javascript:void(0);" class="link-success fs-15"><i class="ri-edit-2-line"></i></a>
//                                 <a style="text-align: center" href="javascript:void(0);" class="link-danger fs-15"><i class="ri-delete-bin-line"></i></a>
//                             </div>
//                         </td>`;
//                     }
//                 } : '',
//             ].filter(Boolean),
//             createdRow: function (row, data, dataIndex) {
//                 if (data.reports && data.reports.length > 0) {
//                     row.style.color = 'red';
//                 }
//             }
//         });
//
//
//         setDataTableInstance(table);
//
//
//         tableRef.current.addEventListener('change', (event) => {
//             console.log('Adding event listener');
//             if (event.target && event.target.classList.contains('status-dropdown')) {
//                 handleStatusChange(event);
//             }
//         });
//
//         // Cleanup on component unmount
//         return () => {
//             if (dataTableInstance) {
//                 dataTableInstance.destroy();
//             }
//
//
//         };
//     }, [tasks]);
//
//
//     return (
//         <Collapse in={!!initComplete} timeout={3000}>
//             <table ref={tableRef}
//                    id="taskTable"
//                    className="table-bordered column-order table-nowrap display compact align-middle">
//                 <tbody>
//                 </tbody>
//             </table>
//         </Collapse>
//     );
// };
//
// export default TaskTable;


import React from 'react';
import DataTable, { createTheme } from 'react-data-table-component';
import {Select, MenuItem, TextField, Button, InputLabel, FormControl, Avatar, Collapse} from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomDataTable = styled(DataTable)(({ theme }) => ({
    '& .rdt_Table': {
        '& .rdt_TableRow': {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
        },
        backgroundColor: 'transparent',
    },
    '& .rdt_TableHeadRow': {
        backdropFilter: 'blur(30px) saturate(200%)',
        backgroundColor: 'rgba(17, 25, 40, 0.8)',
        color: theme.palette.text.primary,
    },
    '& .rdt_TableCol': {
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& .rdt_TableBody .rdt_TableRow:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '& .rdt_Pagination': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
    },
}));


const TaskTable = ({theme, tasks, userIsAdmin, userIsSe, userIsQciAqci, ncrs, objections, juniors, incharges }) => {

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
                        <div key={reports.ref_no}>
                            <span >
                                <i className="mdi mdi-circle-medium"></i>{report.ref_no}
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
                            style={{ color: getStatusColor(row.status) }}
                            className={getStatusIcon(row.status)}
                        ></i>
                    </span>
                    <Select
                        size="small"
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        style={{ marginBottom: 0, border: 'none', outline: 'none', backgroundColor: 'transparent', textAlign: 'center' }}
                    >
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="resubmission">Resubmission</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                </>
            ),
        },
        ...(userIsSe ? [{
            name: 'Assigned',
            selector: row => row.assigned,
            sortable: true,
            center: true,
            cell: row => (
                <div className="avatar-container">
                    <Avatar src={`/assets/images/users/${row.assigned ? row.assigned : 'user-dummy-img'}.jpg`} alt={row.assigned || 'Not assigned'} className="avatar rounded-circle avatar-xxs" />
                    <Select
                        size="small"
                        value={row.assigned || ''}
                        onChange={(e) => handleAssignedChange(row.id, e.target.value)}
                        style={{ marginBottom: 0, border: 'none', outline: 'none', backgroundColor: 'transparent', textAlign: 'center' }}
                    >
                        <MenuItem value="" disabled>Please select</MenuItem>
                        {juniors.map(junior => (
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
                    style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '30ch', display: 'inline-block' }}
                    title={row.description}
                >
                    {userIsSe || userIsQciAqci ? row.description : row.description.substr(0, 30) + '...'}
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
                    style={{ cursor: 'pointer', width: 200, textAlign: 'center' }}
                    className="inspection-details"
                    onClick={() => handleEditInspectionDetails(row.id)}
                >
                    <span className="inspection-text" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 2, lineClamp: 2 }}>
                        {row.inspection_details || 'N/A'}
                    </span>
                    <TextField
                        className="inspection-input"
                        style={{ display: 'none', marginBottom: 0, border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                        defaultValue={row.inspection_details}
                    />
                    <Button
                        className="save-btn"
                        style={{ display: 'none' }}
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
        ...(userIsAdmin ? [{
            name: 'Incharge',
            selector: row => row.incharge,
            sortable: true,
            center: true,
            cell: row => (
                <div className="avatar-container">
                    <Avatar src={`/assets/images/users/${row.incharge ? row.incharge : 'user-dummy-img'}.jpg`} alt={row.incharge || 'Not assigned'} className="avatar rounded-circle avatar-xxs" />
                    <Select
                        size="small"
                        value={row.incharge || ''}
                        onChange={(e) => handleInchargeChange(row.id, e.target.value)}
                        style={{ marginBottom: 0, border: 'none', outline: 'none', backgroundColor: 'transparent', textAlign: 'center' }}
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
                    size="small"
                    type="datetime-local"
                    defaultValue={row.completion_time}
                    onChange={(e) => handleCompletionTimeChange(row.id, e.target.value)}
                    style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
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
        ...(userIsAdmin ? [{
            name: 'RFI Submission Date',
            selector: row => row.rfi_submission_date,
            sortable: true,
            center: true,
            cell: row => (
                <TextField
                    type="date"
                    defaultValue={row.rfi_submission_date}
                    onChange={(e) => handleRFISubmissionDateChange(row.id, e.target.value)}
                    style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                    disabled={!userIsAdmin}
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'blue';
            case 'resubmission':
                return 'orange';
            case 'completed':
                return 'green';
            case 'emergency':
                return 'red';
            default:
                return '';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new':
                return 'ri-add-circle-line fs-17 align-middle';
            case 'resubmission':
                return 'ri-timer-2-line fs-17 align-middle';
            case 'completed':
                return 'ri-checkbox-circle-line fs-17 align-middle';
            case 'emergency':
                return 'ri-information-line fs-17 align-middle';
            default:
                return '';
        }
    };

    const handleStatusChange = (taskId, status) => {
        console.log('Status changed:', taskId, status);
        // Handle status change logic
    };

    const handleAssignedChange = (taskId, assigned) => {
        console.log('Assigned changed:', taskId, assigned);
        // Handle assigned change logic
    };

    const handleInchargeChange = (taskId, incharge) => {
        console.log('Incharge changed:', taskId, incharge);
        // Handle incharge change logic
    };

    const handleCompletionTimeChange = (taskId, completionTime) => {
        console.log('Completion time changed:', taskId, completionTime);
        // Handle completion time change logic
    };

    const handleRFISubmissionDateChange = (taskId, rfiSubmissionDate) => {
        console.log('RFI submission date changed:', taskId, rfiSubmissionDate);
        // Handle RFI submission date change logic
    };

    const handleEditInspectionDetails = (taskId) => {
        console.log('Edit inspection details:', taskId);
        // Handle inspection details edit logic
    };

    const handleSaveInspectionDetails = (taskId) => {
        console.log('Save inspection details:', taskId);
        // Handle inspection details save logic
    };

    const handleEdit = (taskId) => {
        console.log('Edit task:', taskId);
        // Handle edit task logic
    };

    const handleDelete = (taskId) => {
        console.log('Delete task:', taskId);
        // Handle delete task logic
    };

    return (
        <Collapse in timeout={3000}>
            <CustomDataTable

                columns={columns}
                data={tasks}
                pagination

                fixedHeader
                fixedHeaderScrollHeight="500px"
                highlightOnHover
                pointerOnHover
                responsive
                selectableRows="multiple"
                dense

            />

        </Collapse>

    );
};

export default TaskTable;
