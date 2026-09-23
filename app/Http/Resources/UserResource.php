<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'github_username' => $this->github_username,
            'linkedin_url' => $this->linkedin_url,
            'total_score' => $this->total_score,
            'streak_count' => $this->streak_count,
            'last_active_at' => $this->last_active_at,
            'email_verified_at' => $this->email_verified_at,
            'role' => strtolower($this->roles?->first()?->name ?? 'student'),
            'roles' => $this->relationLoaded('roles')
                ? $this->roles->pluck('name')->map(fn ($r) => strtolower($r))->values()->all()
                : [strtolower($this->roles?->first()?->name ?? 'student')],
            'permissions' => $this->whenLoaded('permissions', fn () => $this->getAllPermissions()->pluck('name')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
