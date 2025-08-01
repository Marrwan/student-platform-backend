const projectsService = require('../services/projects.service');

class ProjectsController {
  // Get all projects (filtered by user role and unlock status)
  async getAllProjects(req, res) {
    try {
      const projects = await projectsService.getAllProjects(req.user, req.query);
      res.json(projects);
    } catch (error) {
      console.error('Error in getAllProjects controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get single project by ID
  async getProjectById(req, res) {
    try {
      const project = await projectsService.getProjectById(req.params.id, req.user);
      res.json(project);
    } catch (error) {
      console.error('Error in getProjectById controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create new project (admin only)
  async createProject(req, res) {
    try {
      const project = await projectsService.createProject(req.body, req.user.id);
      res.status(201).json(project);
    } catch (error) {
      console.error('Error in createProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update project (admin only)
  async updateProject(req, res) {
    try {
      const project = await projectsService.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      console.error('Error in updateProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Toggle project lock status (admin only)
  async toggleProjectLock(req, res) {
    try {
      const { isUnlocked } = req.body;
      const project = await projectsService.toggleProjectLock(req.params.id, isUnlocked);
      res.json(project);
    } catch (error) {
      console.error('Error in toggleProjectLock controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete project (admin only)
  async deleteProject(req, res) {
    try {
      const result = await projectsService.deleteProject(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get project statistics (admin only)
  async getProjectStats(req, res) {
    try {
      const stats = await projectsService.getProjectStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error('Error in getProjectStats controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProjectsController(); 