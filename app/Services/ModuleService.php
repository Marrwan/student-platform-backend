<?php

namespace App\Services;

use App\Models\Module;

class ModuleService
{
    /**
     * Create a new module within a course.
     */
    public function createModule(array $data): Module
    {
        if (empty($data['order_index'])) {
            $maxOrder = Module::query()->where('course_id', $data['course_id'])->max('order_index') ?? 0;
            $data['order_index'] = $maxOrder + 1;
        }

        return Module::query()->create([
            'course_id' => $data['course_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'order_index' => $data['order_index'],
            'pass_score_percentage' => $data['pass_score_percentage'] ?? 70,
            'deadline_days' => $data['deadline_days'] ?? null,
        ]);
    }

    /**
     * Update an existing module.
     */
    public function updateModule(Module $module, array $data): Module
    {
        $module->update($data);

        return $module->fresh();
    }

    /**
     * Delete a module.
     */
    public function deleteModule(Module $module): bool
    {
        return (bool) $module->delete();
    }
}
