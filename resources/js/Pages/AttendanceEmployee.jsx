import React, {useState, useEffect, useCallback} from 'react';
import {Head, usePage} from '@inertiajs/react';
import App from "@/Layouts/App.jsx";
import TimeSheetTable from "@/Tables/TimeSheetTable.jsx";

const AttendanceEmployee = React.memo(({ title  }) => {
    const [selectedDate, setSelectedDate] = useState(new Date()); // State to hold the selected date
    const handleDateChange = (event) => {
        const newDate = event.target.value; // Date from the input field
        setSelectedDate(new Date(newDate)); // Set it as a valid Date object
    };

    return (
        <>
            <Head title={title} />
            <TimeSheetTable selectedDate={selectedDate} handleDateChange={handleDateChange}  key={selectedDate}/>
        </>
    );
});
AttendanceEmployee.layout = (page) => <App>{page}</App>;

export default AttendanceEmployee;
