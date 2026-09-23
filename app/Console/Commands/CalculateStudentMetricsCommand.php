<?php

namespace App\Console\Commands;

use App\Services\StudentRecognitionService;
use Illuminate\Console\Command;

class CalculateStudentMetricsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'metrics:calculate-rankings {--period=weekly : Period type: weekly or monthly}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate Student of the Week / Month rankings based on accuracy, punctuality, streak, community, and projects.';

    /**
     * Execute the console command.
     */
    public function handle(StudentRecognitionService $service): int
    {
        $period = $this->option('period') ?: 'weekly';
        $this->info("Calculating {$period} student recognition metrics...");

        $service->calculateMetrics($period);

        $this->info("Student rankings updated successfully!");

        return Command::SUCCESS;
    }
}
