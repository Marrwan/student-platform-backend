<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class CourseService
{
    /**
     * List courses with optional status & difficulty filtering.
     */
    public function listCourses(array $filters = [], int $perPage = 50, ?User $user = null): LengthAwarePaginator
    {
        $query = Course::query()->with([
            'creator',
            'modules' => fn ($q) => $q->orderBy('order_index', 'asc'),
            'modules.topics' => fn ($q) => $q->orderBy('order_index', 'asc')->with([
                'assessment.testCases',
                'topicProgress' => function ($tp) use ($user) {
                    if ($user) {
                        $tp->where('user_id', $user->id);
                    }
                },
            ]),
        ]);

        if (isset($filters['is_published'])) {
            $query->where('is_published', filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['difficulty'])) {
            $query->where('difficulty', $filters['difficulty']);
        }

        if (! empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        return $query->withCount('modules')->latest()->paginate($perPage);
    }

    /**
     * Create a new dynamic course.
     */
    public function createCourse(User $user, array $data): Course
    {
        $slug = Str::slug($data['title']);

        // Ensure unique slug
        $originalSlug = $slug;
        $count = 1;
        while (Course::query()->where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return Course::query()->create([
            'title' => $data['title'],
            'slug' => $slug,
            'description' => $data['description'],
            'thumbnail_url' => $data['thumbnail_url'] ?? null,
            'price' => $data['price'] ?? 0.00,
            'difficulty' => $data['difficulty'],
            'is_published' => $data['is_published'] ?? false,
            'prerequisites' => $data['prerequisites'] ?? null,
            'created_by' => $user->id,
        ]);
    }

    /**
     * Get detailed course information with modules, topics, and user progression.
     */
    public function getCourseDetails(string $courseIdOrSlug, ?User $user = null): Course
    {
        return Course::query()
            ->with([
                'creator',
                'modules' => function ($q) {
                    $q->orderBy('order_index', 'asc');
                },
                'modules.topics' => function ($q) use ($user) {
                    $q->orderBy('order_index', 'asc')
                        ->with([
                            'assessment.testCases',
                            'topicProgress' => function ($tp) use ($user) {
                                if ($user) {
                                    $tp->where('user_id', $user->id);
                                }
                            },
                        ]);
                },
            ])
            ->where('id', $courseIdOrSlug)
            ->orWhere('slug', $courseIdOrSlug)
            ->firstOrFail();
    }

    /**
     * Update an existing course.
     */
    public function updateCourse(Course $course, array $data): Course
    {
        if (isset($data['title']) && $data['title'] !== $course->title) {
            $slug = Str::slug($data['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Course::query()->where('slug', $slug)->where('id', '!=', $course->id)->exists()) {
                $slug = "{$originalSlug}-{$count}";
                $count++;
            }
            $data['slug'] = $slug;
        }

        $course->update($data);

        return $course->fresh();
    }

    /**
     * Delete a course and its dependent modules.
     */
    public function deleteCourse(Course $course): bool
    {
        return (bool) $course->delete();
    }
}
