'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const badges = [
            {
                id: uuidv4(),
                name: 'Welcome Aboard', // Recognition, Common
                description: 'Joined the platform and set up your profile.',
                icon: '👋',
                category: 'recognition',
                criteria: JSON.stringify({ type: 'registration' }),
                rarity: 'common',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'First Assignment', // Milestone, Common
                description: 'Submitted your first assignment.',
                icon: '📝',
                category: 'milestone',
                criteria: JSON.stringify({ type: 'submission_count', count: 1 }),
                rarity: 'common',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'Streak Master', // Attendance, Rare
                description: 'Maintained a 7-day activity streak.',
                icon: '🔥',
                category: 'attendance',
                criteria: JSON.stringify({ type: 'streak_days', count: 7 }),
                rarity: 'rare',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'Code Warrior', // Skill, Rare
                description: 'Completed 5 coding projects.',
                icon: '💻',
                category: 'skill',
                criteria: JSON.stringify({ type: 'project_count', count: 5 }),
                rarity: 'rare',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'Top Performer', // Skill, Epic
                description: 'Achieved a score of 95% or higher on an assignment.',
                icon: '🌟',
                category: 'skill',
                criteria: JSON.stringify({ type: 'score_threshold', value: 95 }),
                rarity: 'epic',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'Intern of the Month', // Recognition, Legendary
                description: 'Awarded for outstanding performance and contribution.',
                icon: '👑',
                category: 'recognition',
                criteria: JSON.stringify({ type: 'manual_award' }),
                rarity: 'legendary',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Check if badges already exist to avoid duplicates if re-run without down
        const existingBadges = await queryInterface.rawSelect('Badges', {
            where: { name: 'Welcome Aboard' },
        }, ['id']);

        if (!existingBadges) {
            await queryInterface.bulkInsert('Badges', badges, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Badges', null, {});
    }
};
