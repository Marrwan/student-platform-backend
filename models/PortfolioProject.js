module.exports = (sequelize, DataTypes) => {
    const PortfolioProject = sequelize.define('PortfolioProject', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        portfolioId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Portfolios',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        projectUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        repoUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        technologies: {
            type: DataTypes.JSON, // Array of strings: ["React", "Node.js"]
            defaultValue: []
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'PortfolioProjects',
        timestamps: true
    });

    PortfolioProject.associate = (models) => {
        PortfolioProject.belongsTo(models.Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });
    };

    return PortfolioProject;
};
