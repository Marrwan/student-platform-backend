<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Project\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    public function __construct(
        public ProjectService $projectService
    ) {}

    public function index(): JsonResponse
    {
        $projects = Project::query()->with(['course'])->latest()->get();

        return response()->json([
            'data' => ProjectResource::collection($projects),
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject($request->validated());

        return response()->json([
            'message' => 'Capstone project created successfully.',
            'data' => ProjectResource::make($project),
        ], Response::HTTP_CREATED);
    }

    public function show(string $id): ProjectResource
    {
        $project = Project::query()->findOrFail($id);

        return ProjectResource::make($project);
    }
}
