<?php

namespace App\Services\Leave;

use App\Models\Leave;
use App\Models\LeaveSetting;
use App\Models\User;
use Carbon\Carbon;

class LeaveSummaryService
{
    /**
     * Generate leave summary data for a given year
     */
    public function generateLeaveSummary(int $year): array
    {
        $users = User::all();
        $leaveTypes = LeaveSetting::where('type', '!=', 'Weekend')->get();

        $leaves = Leave::with('leaveSetting')
            ->whereYear('from_date', $year)
            ->whereHas('leaveSetting', fn($q) => $q->where('type', '!=', 'Weekend'))
            ->get();

        $months = [
            1 => 'JAN', 2 => 'FEB', 3 => 'MAR', 4 => 'APR',
            5 => 'MAY', 6 => 'JUN', 7 => 'JULY', 8 => 'AUG',
            9 => 'SEP', 10 => 'OCT', 11 => 'NOV', 12 => 'DEC'
        ];

        $leaveTypeColumns = $leaveTypes->pluck('type')->toArray();
        $result = [];
        $sl_no = 1;

        foreach ($users as $user) {
            $row = ['SL NO' => $sl_no++, 'Name' => $user->name];
            $total = 0;
            $leaveTypeTotals = array_fill_keys($leaveTypeColumns, 0);

            // Calculate monthly leave days
            foreach ($months as $num => $label) {
                $monthLeaves = $leaves->where('user_id', $user->id)->filter(
                    fn($leave) => Carbon::parse($leave->from_date)->month == $num
                );

                $days = $monthLeaves->sum('no_of_days');
                $row[$label] = $days > 0 ? $days : '';
                $total += $days;
            }

            // Calculate leave type totals
            foreach ($leaves->where('user_id', $user->id) as $leave) {
                $type = $leave->leaveSetting->type ?? '';
                if (isset($leaveTypeTotals[$type])) {
                    $leaveTypeTotals[$type] += $leave->no_of_days;
                }
            }

            $row['Total'] = $total;
            foreach ($leaveTypeColumns as $type) {
                $row[$type] = $leaveTypeTotals[$type];
            }
            $row['Remarks'] = '';

            $result[] = $row;
        }

        $columns = array_merge(
            ['SL NO', 'Name'],
            array_values($months),
            ['Total'],
            $leaveTypeColumns,
            ['Remarks']
        );

        return [
            'users' => $users,
            'columns' => $columns,
            'data' => $result,
            'year' => $year,
        ];
    }
}
