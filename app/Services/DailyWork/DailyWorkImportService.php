<?php

namespace App\Services\DailyWork;

use App\Imports\DailyWorkImport;
use App\Models\DailyWork;
use App\Models\DailySummary;
use App\Models\Jurisdiction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class DailyWorkImportService
{
    private DailyWorkValidationService $validationService;

    public function __construct(DailyWorkValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    /**
     * Process Excel/CSV import
     */
    public function processImport(Request $request): array
    {
        $this->validationService->validateImportFile($request);

        $path = $request->file('file')->store('temp');
        $importedSheets = Excel::toArray(new DailyWorkImport, $path);

        // First pass: Validate all sheets
        foreach ($importedSheets as $sheetIndex => $importedDailyWorks) {
            if (empty($importedDailyWorks)) {
                continue;
            }

            $this->validationService->validateImportedData($importedDailyWorks, $sheetIndex);
        }

        // Second pass: Process the data
        $results = [];
        foreach ($importedSheets as $sheetIndex => $importedDailyWorks) {
            if (empty($importedDailyWorks)) {
                continue;
            }

            $result = $this->processSheet($importedDailyWorks, $sheetIndex);
            $results[] = $result;
        }

        return $results;
    }

    /**
     * Process a single sheet of daily works
     */
    private function processSheet(array $importedDailyWorks, int $sheetIndex): array
    {
        $date = $importedDailyWorks[0][0];
        $inChargeSummary = [];

        foreach ($importedDailyWorks as $importedDailyWork) {
            $result = $this->processDailyWorkRow($importedDailyWork, $date, $inChargeSummary);
            
            if ($result['processed']) {
                $inChargeSummary = $result['summary'];
            }
        }

        // Create or update daily summaries
        $this->createDailySummaries($inChargeSummary, $date);

        return [
            'sheet' => $sheetIndex + 1,
            'date' => $date,
            'summaries' => $inChargeSummary,
            'processed_count' => count($importedDailyWorks)
        ];
    }

    /**
     * Process a single daily work row
     */
    private function processDailyWorkRow(array $importedDailyWork, string $date, array &$inChargeSummary): array
    {
        // Extract chainages and find jurisdiction
        $jurisdiction = $this->findJurisdictionForLocation($importedDailyWork[4]);
        
        if (!$jurisdiction) {
            Log::warning('No jurisdiction found for location: ' . $importedDailyWork[4]);
            return ['processed' => false, 'summary' => $inChargeSummary];
        }

        $inCharge = $jurisdiction->incharge;
        $inChargeName = User::find($inCharge)->user_name;

        // Initialize incharge summary if not exists
        if (!isset($inChargeSummary[$inChargeName])) {
            $inChargeSummary[$inChargeName] = [
                'totalDailyWorks' => 0,
                'resubmissions' => 0,
                'embankment' => 0,
                'structure' => 0,
                'pavement' => 0,
            ];
        }

        // Update summary counters
        $inChargeSummary[$inChargeName]['totalDailyWorks']++;
        $this->updateTypeCounter($inChargeSummary[$inChargeName], $importedDailyWork[2]);

        // Handle existing or new daily work
        $existingDailyWork = DailyWork::where('number', $importedDailyWork[1])->first();
        
        if ($existingDailyWork) {
            $this->handleResubmission($existingDailyWork, $importedDailyWork, $inChargeSummary[$inChargeName], $inChargeName);
        } else {
            $this->createNewDailyWork($importedDailyWork, $inChargeName);
        }

        return ['processed' => true, 'summary' => $inChargeSummary];
    }

    /**
     * Find jurisdiction for a given location
     */
    private function findJurisdictionForLocation(string $location): ?Jurisdiction
    {
        // Regex for extracting start and end chainages
        $chainageRegex = '/(.*K[0-9]+(?:\+[0-9]+(?:\.[0-9]+)?)?)-(.*K[0-9]+(?:\+[0-9]+(?:\.[0-9]+)?)?)|(.*K[0-9]+)(.*)/';

        if (preg_match($chainageRegex, $location, $matches)) {
            $startChainage = $matches[1] === "" ? $matches[0] : $matches[1];
            $endChainage = $matches[2] === "" ? null : $matches[2];

            $startChainageFormatted = $this->formatChainage($startChainage);
            $endChainageFormatted = $endChainage ? $this->formatChainage($endChainage) : null;

            $jurisdictions = Jurisdiction::all();

            foreach ($jurisdictions as $jurisdiction) {
                $formattedStartJurisdiction = $this->formatChainage($jurisdiction->start_chainage);
                $formattedEndJurisdiction = $this->formatChainage($jurisdiction->end_chainage);

                // Check if the start chainage is within the jurisdiction's range
                if ($startChainageFormatted >= $formattedStartJurisdiction && 
                    $startChainageFormatted <= $formattedEndJurisdiction) {
                    Log::info('Jurisdiction Match Found: ' . $formattedStartJurisdiction . "-" . $formattedEndJurisdiction);
                    return $jurisdiction;
                }

                // If an end chainage exists, check if it's within the jurisdiction's range
                if ($endChainageFormatted &&
                    $endChainageFormatted >= $formattedStartJurisdiction &&
                    $endChainageFormatted <= $formattedEndJurisdiction) {
                    Log::info('Jurisdiction Match Found for End Chainage: ' . $formattedStartJurisdiction . "-" . $formattedEndJurisdiction);
                    return $jurisdiction;
                }
            }
        }

        return null;
    }

    /**
     * Format chainage for comparison
     */
    private function formatChainage(string $chainage): string
    {
        // Remove spaces and convert to uppercase
        $chainage = strtoupper(trim($chainage));
        
        // Extract K number and additional values
        if (preg_match('/K(\d+)(?:\+(\d+(?:\.\d+)?))?/', $chainage, $matches)) {
            $kNumber = (int)$matches[1];
            $additional = isset($matches[2]) ? (float)$matches[2] : 0;
            
            // Convert to a comparable format (e.g., K05+900 becomes 5.900)
            return sprintf('%d.%03d', $kNumber, $additional);
        }
        
        return $chainage;
    }

    /**
     * Update type counter in summary
     */
    private function updateTypeCounter(array &$summary, string $type): void
    {
        switch ($type) {
            case 'Embankment':
                $summary['embankment']++;
                break;
            case 'Structure':
                $summary['structure']++;
                break;
            case 'Pavement':
                $summary['pavement']++;
                break;
        }
    }

    /**
     * Handle resubmission of existing daily work
     */
    private function handleResubmission(DailyWork $existingDailyWork, array $importedDailyWork, array &$summary, string $inChargeName): void
    {
        $summary['resubmissions']++;
        $resubmissionCount = $existingDailyWork->resubmission_count ?? 0;
        $resubmissionCount++;
        $resubmissionDate = $this->getResubmissionDate($existingDailyWork, $resubmissionCount);

        DailyWork::create([
            'date' => ($existingDailyWork->status === 'completed' ? $existingDailyWork->date : $importedDailyWork[0]),
            'number' => $importedDailyWork[1],
            'status' => ($existingDailyWork->status === 'completed' ? 'completed' : 'resubmission'),
            'type' => $importedDailyWork[2],
            'description' => $importedDailyWork[3],
            'location' => $importedDailyWork[4],
            'incharge' => $inChargeName,
            'resubmission_count' => $resubmissionCount,
            'resubmission_date' => $resubmissionDate,
        ]);
    }

    /**
     * Create new daily work
     */
    private function createNewDailyWork(array $importedDailyWork, string $inChargeName): void
    {
        DailyWork::create([
            'date' => $importedDailyWork[0],
            'number' => $importedDailyWork[1],
            'status' => 'pending',
            'type' => $importedDailyWork[2],
            'description' => $importedDailyWork[3],
            'location' => $importedDailyWork[4],
            'incharge' => $inChargeName,
        ]);
    }

    /**
     * Get resubmission date
     */
    private function getResubmissionDate(DailyWork $existingDailyWork, int $resubmissionCount): string
    {
        if ($resubmissionCount === 1) {
            return $existingDailyWork->resubmission_date ?? $this->getOrdinalNumber($resubmissionCount) . " Resubmission on " . Carbon::now()->format('jS F Y');
        }
        return $this->getOrdinalNumber($resubmissionCount) . " Resubmission on " . Carbon::now()->format('jS F Y');
    }

    /**
     * Get ordinal number (1st, 2nd, 3rd, etc.)
     */
    private function getOrdinalNumber(int $number): string
    {
        if (!in_array(($number % 100), [11, 12, 13])) {
            switch ($number % 10) {
                case 1: return $number . 'st';
                case 2: return $number . 'nd';
                case 3: return $number . 'rd';
            }
        }
        return $number . 'th';
    }

    /**
     * Create or update daily summaries
     */
    private function createDailySummaries(array $inChargeSummary, string $date): void
    {
        foreach ($inChargeSummary as $inChargeName => $summary) {
            DailySummary::updateOrCreate(
                ['date' => $date, 'incharge' => $inChargeName],
                [
                    'total_daily_works' => $summary['totalDailyWorks'],
                    'resubmissions' => $summary['resubmissions'],
                    'embankment' => $summary['embankment'],
                    'structure' => $summary['structure'],
                    'pavement' => $summary['pavement'],
                ]
            );
        }
    }
}
