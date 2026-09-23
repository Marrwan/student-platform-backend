<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Module\StoreModuleRequest;
use App\Http\Resources\ModuleResource;
use App\Models\Module;
use App\Services\ModuleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ModuleController extends Controller
{
    public function __construct(
        public ModuleService $moduleService
    ) {}

    public function store(StoreModuleRequest $request): JsonResponse
    {
        $module = $this->moduleService->createModule($request->validated());

        return response()->json([
            'message' => 'Module created successfully.',
            'data' => ModuleResource::make($module),
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, string $moduleId): JsonResponse
    {
        $module = Module::query()->findOrFail($moduleId);
        $updated = $this->moduleService->updateModule($module, $request->all());

        return response()->json([
            'message' => 'Module updated successfully.',
            'data' => ModuleResource::make($updated),
        ]);
    }

    public function destroy(string $moduleId): JsonResponse
    {
        $module = Module::query()->findOrFail($moduleId);
        $this->moduleService->deleteModule($module);

        return response()->json([
            'message' => 'Module deleted successfully.',
        ]);
    }
}
