module.exports = function (sequelize, DataTypes) {
  var UsersTable = sequelize.define("UsersTable", {
    userName: DataTypes.STRING,
    userEmail: DataTypes.STRING,
    userPic: DataTypes.STRING,
    id: {
      type: DataTypes.CHAR(20),
      allowNull: false,
      primaryKey: true
    }
  });

  UsersTable.associate = function (models) {
    UsersTable.hasMany(models.RecipeTable, {
      onDelete: "cascade",
    });
    UsersTable.hasMany(models.CartTable, {
      onDelete: "cascade",
    });
  };

  return UsersTable;
};