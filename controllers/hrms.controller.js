const db = require('../models');
const User = db.User;
const Department = db.Department;
const Op = db.Sequelize.Op;

// Create and Save a new Department
exports.createDepartment = async (req, res) => {
    try {
        const { name, description, headOfDepartmentId, location } = req.body;

        if (!name) {
            return res.status(400).send({ message: "Department name is required!" });
        }

        const department = await Department.create({
            name,
            description,
            headOfDepartmentId,
            location
        });

        res.status(201).send(department);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Department."
        });
    }
};

// Retrieve all Departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            include: [
                { model: User, as: 'headOfDepartment', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
                { model: User, as: 'employees', attributes: ['id'] } // Just count or basic info
            ]
        });

        // Add employee count manually if needed or just send the array
        const result = departments.map(dept => {
            const data = dept.toJSON();
            data.employeeCount = data.employees.length;
            delete data.employees;
            return data;
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving departments."
        });
    }
};

// Update a Department
exports.updateDepartment = async (req, res) => {
    const id = req.params.id;

    try {
        const [num] = await Department.update(req.body, {
            where: { id: id }
        });

        if (num == 1) {
            res.send({ message: "Department was updated successfully." });
        } else {
            res.send({ message: `Cannot update Department with id=${id}. Maybe Department was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Department with id=" + id
        });
    }
};

// Delete a Department
exports.deleteDepartment = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await Department.destroy({
            where: { id: id }
        });

        if (num == 1) {
            res.send({ message: "Department was deleted successfully!" });
        } else {
            res.send({ message: `Cannot delete Department with id=${id}. Maybe Department was not found!` });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Department with id=" + id
        });
    }
};

// Promote a User to Staff
exports.promoteToStaff = async (req, res) => {
    const id = req.params.id;
    const { departmentId, staffRole, jobTitle, managerId, location, joinedAt } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Default to 'partial_admin' or 'admin' if not specified, but conceptually they are staff
        // The PRD says "Admin can modify a students role to a staff"
        // We should probably set role to 'partial_admin' or keep 'student' but with staffRole? 
        // The prompt says "admin can modify a students role to a staff... from intern to Manager"
        // Let's assume 'partial_admin' is the base role for staff who aren't super admins

        const updateData = {
            role: 'partial_admin', // Default staff role
            staffRole, // "Intern", "Analyst 1", etc.
            jobTitle,
            departmentId,
            managerId,
            location,
            joinedAt: joinedAt || new Date(),
            permissions: {
                // Default permissions for staff - can be customized later
                canViewHRMS: true,
                canCreateClasses: false
            }
        };

        if (staffRole === 'Manager') {
            updateData.permissions.canManageStudents = true;
            updateData.permissions.canReviewSubmissions = true;
        }

        await user.update(updateData);

        res.send({ message: "User promoted to staff successfully!", user: { id, ...updateData } });
    } catch (err) {
        res.status(500).send({
            message: "Error promoting user to staff: " + err.message
        });
    }
};

// Get all Staff
exports.getAllStaff = async (req, res) => {
    try {
        const staff = await User.findAll({
            where: {
                [Op.or]: [
                    { role: 'admin' },
                    { role: 'partial_admin' },
                    { staffRole: { [Op.ne]: null } }
                ]
            },
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName'] }
            ],
            attributes: { exclude: ['password'] }
        });
        res.send(staff);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving staff."
        });
    }
};

// Get Staff Profile (Detailed)
exports.getStaffProfile = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findByPk(id, {
            include: [
                { model: Department, as: 'department' },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
                { model: User, as: 'directReports', attributes: ['id', 'firstName', 'lastName', 'avatar', 'jobTitle'] }
            ],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).send({ message: "Staff not found." });
        }

        res.send(user);
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving staff profile with id=" + id
        });
    }
};
