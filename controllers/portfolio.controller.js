const { Portfolio, PortfolioProject, User } = require('../models');
const { Op } = require('sequelize');

// --- Portfolio CRUD ---

exports.createPortfolio = async (req, res) => {
    try {
        const { bio, skills, socialLinks, isPublic, slug } = req.body;
        const userId = req.user.id;

        // Check if portfolio already exists for user
        const existingPortfolio = await Portfolio.findOne({ where: { userId } });
        if (existingPortfolio) {
            return res.status(400).json({ message: 'User already has a portfolio' });
        }

        // Check if slug is unique
        const existingSlug = await Portfolio.findOne({ where: { slug } });
        if (existingSlug) {
            return res.status(400).json({ message: 'Slug already taken' });
        }

        const portfolio = await Portfolio.create({
            userId,
            bio,
            skills,
            socialLinks,
            isPublic,
            slug
        });

        res.status(201).json(portfolio);
    } catch (error) {
        console.error('Error creating portfolio:', error);
        res.status(500).json({ message: 'Error creating portfolio' });
    }
};

exports.getPortfolio = async (req, res) => {
    try {
        const userId = req.user.id;
        const portfolio = await Portfolio.findOne({
            where: { userId },
            include: [{ model: PortfolioProject, as: 'projects' }]
        });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Error fetching portfolio' });
    }
};

exports.getPublicPortfolio = async (req, res) => {
    try {
        const { slug } = req.params;
        const portfolio = await Portfolio.findOne({
            where: { slug, isPublic: true },
            include: [
                { model: PortfolioProject, as: 'projects' },
                { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'profilePicture'] }
            ]
        });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.json(portfolio);
    } catch (error) {
        console.error('Error fetching public portfolio:', error);
        res.status(500).json({ message: 'Error fetching public portfolio' });
    }
};

exports.updatePortfolio = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, skills, socialLinks, isPublic, slug } = req.body;

        const portfolio = await Portfolio.findOne({ where: { userId } });
        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        // Check slug uniqueness if changed
        if (slug && slug !== portfolio.slug) {
            const existingSlug = await Portfolio.findOne({ where: { slug } });
            if (existingSlug) {
                return res.status(400).json({ message: 'Slug already taken' });
            }
        }

        await portfolio.update({
            bio,
            skills,
            socialLinks,
            isPublic,
            slug
        });

        res.json(portfolio);
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ message: 'Error updating portfolio' });
    }
};

// --- Project CRUD ---

exports.addProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const portfolio = await Portfolio.findOne({ where: { userId } });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found. Please create one first.' });
        }

        const { title, description, projectUrl, repoUrl, technologies, imageUrl, featured } = req.body;

        const project = await PortfolioProject.create({
            portfolioId: portfolio.id,
            title,
            description,
            projectUrl,
            repoUrl,
            technologies,
            imageUrl,
            featured
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ message: 'Error adding project' });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Ensure project belongs to user's portfolio
        const project = await PortfolioProject.findByPk(id, {
            include: [{ model: Portfolio, as: 'portfolio', where: { userId } }]
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { title, description, projectUrl, repoUrl, technologies, imageUrl, featured } = req.body;

        await project.update({
            title,
            description,
            projectUrl,
            repoUrl,
            technologies,
            imageUrl,
            featured
        });

        res.json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Error updating project' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const project = await PortfolioProject.findByPk(id, {
            include: [{ model: Portfolio, as: 'portfolio', where: { userId } }]
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await project.destroy();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project' });
    }
};
