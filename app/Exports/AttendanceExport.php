
<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Border;

class AttendanceExport implements FromCollection, WithHeadings, ShouldAutoSize, WithEvents
{

    protected $date;

    public function __construct(string $date)
    {
        $this->date = $date;
    }

    public function collection()
    {
        // Fetch all users
        $users = User::with(['designation'])->get();
        $rows = collect();

        foreach ($users as $idx => $user) {
            $attendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $this->date)
                ->first();

            $leave = Leave::where('user_id', $user->id)
                ->whereDate('from_date', '<=', $this->date)
                ->whereDate('to_date', '>=', $this->date)
                ->first();

            // Determine status and fields
            if ($attendance) {
                $in = $attendance->punchin_time ?
                    $attendance->punchin_time->format('h:i A') : 'Not clocked in';
                $out = $attendance->punchout_time ?
                    $attendance->punchout_time->format('h:i A') : ($attendance->punchin_time ? 'Still working' : 'Not punched out');
                $minutes = $attendance->total_work_minutes;
                $hours = floor($minutes / 60);
                $mins  = $minutes % 60;
                $workTime = $minutes > 0 ? "{$hours}h {$mins}m" : ($attendance->has_incomplete_punch ? 'In Progress' : 'No work time');
                $status = ($attendance->complete_punches === $attendance->punch_count && $attendance->punch_count > 0)
                    ? 'Complete' : ($attendance->has_incomplete_punch ? 'In Progress' : 'Incomplete');
                $remarks = $status === 'Complete'
                    ? 'Present - All punches complete'
                    : ($status === 'In Progress'
                        ? 'Present - Currently working'
                        : 'Present - Incomplete punches');
            } elseif ($leave) {
                $in = $out = 'On Leave';
                $workTime = '0h 0m';
                $status = 'On Leave';
                $duration = $leave->from_date->eq($leave->to_date)
                    ? $this->date
                    : $leave->from_date->format('Y-m-d') . ' to ' . $leave->to_date->format('Y-m-d');
                $remarks = "On {$leave->leave_type} Leave ({$duration}) - Status: {$leave->status}";
            } else {
                $in = $out = 'Absent';
                $workTime = '0h 0m';
                $status = 'Absent';
                $remarks = 'Absent without leave';
            }

            $rows->push([
                'No.'              => $idx + 1,
                'Date'             => date('M d, Y', strtotime($this->date)),
                'Employee Name'    => $user->name,
                'Employee ID'      => $user->employee_id,
                'Designation'      => $user->designation->name ?? 'N/A',
                'Phone'            => $user->phone,
                'Clock In'         => $in,
                'Clock Out'        => $out,
                'Work Hours'       => $workTime,
                'Total Punches'    => $attendance->punch_count ?? 0,
                'Complete Punches' => $attendance->complete_punches ?? 0,
                'Status'           => $status,
                'Remarks'          => $remarks,
            ]);
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'No.',
            'Date',
            'Employee Name',
            'Employee ID',
            'Designation',
            'Phone',
            'Clock In',
            'Clock Out',
            'Work Hours',
            'Total Punches',
            'Complete Punches',
            'Status',
            'Remarks',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Title row
                $title = "Daily Timesheet - " . date('F d, Y', strtotime($this->date));
                $sheet->mergeCells('A1:M1');
                $sheet->setCellValue('A1', $title);
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                $sheet->getStyle('A1')->getAlignment()->setHorizontal('center');

                // Generated date
                $sheet->mergeCells('A2:M2');
                $sheet->setCellValue('A2', 'Generated on: ' . now()->format('F d, Y h:i A'));
                $sheet->getStyle('A2')->getAlignment()->setHorizontal('center');

                // Summary row
                $total = $sheet->getHighestDataRow() - 3;
                $present = collect($sheet->toArray(null, true, false, true))
                    ->slice(4, $total)
                    ->where(12, '!=', 'Absent')->count();
                $absent = $total - $present;
                $sheet->mergeCells('A3:M3');
                $sheet->setCellValue(
                    'A3',
                    "Total Employees: {$total} (Present: {$present}, Absent: {$absent})"
                );
                $sheet->getStyle('A3')->getAlignment()->setHorizontal('center');

                // Header styling
                $sheet->getStyle('A5:M5')->getFont()->setBold(true);
                $sheet->getStyle('A5:M5')->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('E3F2FD');
                $sheet->freezePane('A6');

                // Borders
                $highestRow = $sheet->getHighestRow();
                $highestCol = $sheet->getHighestColumn();
                $sheet->getStyle("A1:{$highestCol}{$highestRow}")
                    ->getBorders()->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN);
            },
        ];
    }
}
