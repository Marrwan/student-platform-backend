<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Course\StoreCourseRequest;
use App\Http\Requests\Api\V1\Course\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\CourseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CourseController extends Controller
{
    public function __construct(
        public CourseService $courseService
    ) {}

    /**
     * List all courses.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user('sanctum') ?? $request->user();
        $filters = $request->only(['is_published', 'difficulty', 'search']);
        $courses = $this->courseService->listCourses($filters, (int) $request->get('per_page', 50), $user);

        return CourseResource::collection($courses);
    }

    /**
     * Create a new dynamic course.
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $course = $this->courseService->createCourse($request->user(), $validated);

        return response()->json([
            'message' => 'Course created successfully.',
            'data' => CourseResource::make($course),
        ], Response::HTTP_CREATED);
    }

    /**
     * Show detailed course structure (modules & topics).
     */
    public function show(Request $request, string $courseId): CourseResource
    {
        $user = $request->user('sanctum') ?? $request->user();
        $course = $this->courseService->getCourseDetails($courseId, $user);

        return CourseResource::make($course);
    }

    /**
     * Update course details.
     */
    public function update(UpdateCourseRequest $request, string $courseId): JsonResponse
    {
        $course = Course::query()->findOrFail($courseId);
        $updated = $this->courseService->updateCourse($course, $request->validated());

        return response()->json([
            'message' => 'Course updated successfully.',
            'data' => CourseResource::make($updated),
        ]);
    }

    /**
     * Delete a course.
     */
    public function destroy(string $courseId): JsonResponse
    {
        $course = Course::query()->findOrFail($courseId);
        $this->courseService->deleteCourse($course);

        return response()->json([
            'message' => 'Course deleted successfully.',
        ]);
    }
}
