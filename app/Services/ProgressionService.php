<?php

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Enums\TopicProgressStatus;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use App\Models\Topic;
use App\Models\TopicProgress;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProgressionService
{
    /**
     * Enroll a student in a course and unlock the first topic.
     */
    public function enrollUserInCourse(User $user, Course $course): Enrollment
    {
        return DB::transaction(function () use ($user, $course) {
            $existing = Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($existing) {
                return $existing;
            }

            // Find first module and first topic
            $firstModule = Module::query()
                ->where('course_id', $course->id)
                ->orderBy('order_index', 'asc')
                ->first();

            $firstTopic = $firstModule ? Topic::query()
                ->where('module_id', $firstModule->id)
                ->orderBy('order_index', 'asc')
                ->first() : null;

            $enrollment = Enrollment::query()->create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => EnrollmentStatus::ACTIVE->value,
                'enrolled_at' => now(),
                'current_module_id' => $firstModule?->id,
                'current_topic_id' => $firstTopic?->id,
            ]);

            // Automatically unlock the first topic for the student
            if ($firstTopic) {
                TopicProgress::query()->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'topic_id' => $firstTopic->id,
                    ],
                    [
                        'status' => TopicProgressStatus::UNLOCKED->value,
                    ]
                );
            }

            return $enrollment;
        });
    }

    /**
     * Complete current topic and unlock the next topic sequentially.
     */
    public function completeTopicAndUnlockNext(User $user, Topic $topic): TopicProgress
    {
        return DB::transaction(function () use ($user, $topic) {
            $progress = TopicProgress::query()->firstOrCreate(
                [
                    'user_id' => $user->id,
                    'topic_id' => $topic->id,
                ],
                [
                    'status' => TopicProgressStatus::UNLOCKED->value,
                ]
            );

            $progress->update([
                'status' => TopicProgressStatus::COMPLETED->value,
                'completed_at' => now(),
            ]);

            // Find next topic in the current module
            $nextTopic = Topic::query()
                ->where('module_id', $topic->module_id)
                ->where('order_index', '>', $topic->order_index)
                ->orderBy('order_index', 'asc')
                ->first();

            // If no more topics in current module, find next module's first topic
            if (! $nextTopic) {
                $currentModule = $topic->module;
                $nextModule = Module::query()
                    ->where('course_id', $currentModule->course_id)
                    ->where('order_index', '>', $currentModule->order_index)
                    ->orderBy('order_index', 'asc')
                    ->first();

                if ($nextModule) {
                    $nextTopic = Topic::query()
                        ->where('module_id', $nextModule->id)
                        ->orderBy('order_index', 'asc')
                        ->first();
                }
            }

            // If a next topic exists, unlock it for the student!
            if ($nextTopic) {
                TopicProgress::query()->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'topic_id' => $nextTopic->id,
                    ],
                    [
                        'status' => TopicProgressStatus::UNLOCKED->value,
                    ]
                );
            } else {
                // Course completed! Update enrollment status and issue certificate
                $course = $topic->module->course;
                Enrollment::query()
                    ->where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->update([
                        'status' => EnrollmentStatus::COMPLETED->value,
                        'completed_at' => now(),
                    ]);

                app(CertificateService::class)->issueCertificateIfEligible($user, $course);
                app(WebhookNotificationService::class)->notifyCourseCompleted($user, $course);
            }

            return $progress;
        });
    }

    /**
     * Verify if a user is allowed to access/view a topic.
     */
    public function canUserAccessTopic(User $user, Topic $topic): bool
    {
        // Admins, Super Admins, and Instructors can access all topics
        if ($user->hasRole('Super Admin') || $user->hasRole('Admin') || $user->hasRole('Instructor')) {
            return true;
        }

        // Also check permissions
        if ($user->can('course.edit:all') || $user->can('course.view:all') || $user->can('lms.manage')) {
            return true;
        }

        $module = $topic->module ?? Module::find($topic->module_id);
        if (! $module) {
            return true;
        }

        // Check if user has an active enrollment
        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $module->course_id)
            ->where('status', EnrollmentStatus::ACTIVE->value)
            ->first();

        if (! $enrollment) {
            return false;
        }

        $progress = TopicProgress::query()
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        if (! $progress) {
            // Find first module and first topic
            $firstModule = Module::query()
                ->where('course_id', $module->course_id)
                ->orderBy('order_index', 'asc')
                ->first();

            $firstTopic = $firstModule ? Topic::query()
                ->where('module_id', $firstModule->id)
                ->orderBy('order_index', 'asc')
                ->first() : null;

            if ($firstTopic && $firstTopic->id === $topic->id) {
                TopicProgress::query()->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'topic_id' => $topic->id,
                    ],
                    [
                        'status' => TopicProgressStatus::UNLOCKED->value,
                    ]
                );

                return true;
            }

            return false;
        }

        return in_array($progress->status, [
            TopicProgressStatus::UNLOCKED->value,
            TopicProgressStatus::IN_PROGRESS->value,
            TopicProgressStatus::COMPLETED->value,
        ]);
    }
}

