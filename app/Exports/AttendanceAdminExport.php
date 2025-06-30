<?php

namespace App\Exports;

use App\Models\User;
use App\Models\LeaveSetting;
use App\Models\Holiday;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;


class AttendanceAdminExport
{
    public function export($month)
    {
        $from = Carbon::parse($month . '-01');
        $to = $from->copy()->endOfMonth();
        $monthName = $from->format('F Y');

        $users = User::with(['attendances', 'leaves'])
            ->role('Employee')
            ->where('active', 1)
            ->get();

        $leaveTypes = LeaveSetting::all();
        $holidays = Holiday::all();

        $symbolToTypeMap = $leaveTypes->pluck('type', 'symbol')->toArray();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->getDefaultRowDimension()->setRowHeight(25);

        $headerTitle = 'Dhaka Bypass Expressway Development Company Ltd. Attendance Record-DBEDC Site Office Employee';
        $sheet->mergeCells("A1:AK1");
        $sheet->setCellValue('A1', $headerTitle);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells("A3:AK3");
        $sheet->setCellValue('A3', $monthName);
        $sheet->getStyle('A3')->getFont()->setBold(true);
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A5', 'SL');
        $sheet->mergeCells("A5:A6");
        $sheet->getStyle('A5')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        $sheet->setCellValue('B5', 'Name');
        $sheet->mergeCells("B5:B6");
        $sheet->getStyle('B5')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        $col = 'C';
        $dateMap = [];
        for ($date = $from->copy(); $date->lte($to); $date->addDay()) {
            $label = $date->format('d') . ' - ' . $date->format('D');
            $sheet->setCellValue("{$col}5", $label);
            $sheet->mergeCells("{$col}5:{$col}6");
            $sheet->getStyle("{$col}5")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
            $dateMap[$col] = $date->toDateString();
            $col++;
        }

        foreach ($leaveTypes as $leaveType) {
            $sheet->setCellValue("{$col}5", $leaveType->type);
            $sheet->setCellValue("{$col}6", '');
            $col++;
        }

        $sheet->setCellValue("{$col}5", 'Remark');
        $sheet->setCellValue("{$col}6", '');

        $row = 7;
        foreach ($users as $index => $user) {
            $attendanceRecord = app('App\\Http\\Controllers\\AttendanceController')->getUserAttendanceData($user, $from->year, $from->month, $holidays, collect($leaveTypes));

            $sheet->setCellValue("A{$row}", $index + 1);
            $sheet->setCellValue("B{$row}", $user->name);

            $colCursor = 'C';
            $leaveCounts = array_fill_keys($leaveTypes->pluck('type')->toArray(), 0);

            foreach ($dateMap as $colKey => $dateString) {
                $dayStatus = $attendanceRecord[$dateString]['status'] ?? '#';
                $remarks = $attendanceRecord[$dateString]['remarks'] ?? '';

                $sheet->setCellValue("{$colKey}{$row}", $dayStatus);

                if ($remarks === 'On Leave' && isset($symbolToTypeMap[$dayStatus])) {
                    $leaveType = $symbolToTypeMap[$dayStatus];
                    $leaveCounts[$leaveType]++;
                }

                $colCursor++;
            }

            foreach ($leaveTypes as $leaveType) {
                $count = $leaveCounts[$leaveType->type] ?? 0;
                $sheet->setCellValue("{$colCursor}{$row}", $count > 0 ? $count : '-');
                $colCursor++;
            }

            $sheet->setCellValue("{$colCursor}{$row}", '');
            $row++;
        }

        $lastCol = $sheet->getHighestColumn();
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle("A5:{$lastCol}{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle("A5:{$lastCol}6")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE0E0E0');
        $sheet->getStyle("A5:{$lastCol}6")->getFont()->setBold(true);

        foreach (range('A', $sheet->getHighestColumn()) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = "DBEDC_Attendance_{$monthName}.xlsx";
        $writer = new Xlsx($spreadsheet);
        $tempFile = tempnam(sys_get_temp_dir(), 'attendance');
        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }
}
