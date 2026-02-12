module.exports = (sequelize, DataTypes) => {
    const Portfolio = sequelize.define('Portfolio', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        skills: {
            type: DataTypes.JSON, // Array of strings: ["React", "Node.js"]
            defaultValue: []
        },
        socialLinks: {
            type: DataTypes.JSON, // Object: { github: "", linkedin: "", twitter: "", personalWebsite: "" }
            defaultValue: {}
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'Portfolios',
        timestamps: true
    });

    Portfolio.associate = (models) => {
        Portfolio.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Portfolio.hasMany(models.PortfolioProject, { foreignKey: 'portfolioId', as: 'projects' });
    };

    return Portfolio;
};
