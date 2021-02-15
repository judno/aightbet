"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sharedUserValues = {
      points: 1000,
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert("users", [
      {
        ...sharedUserValues,
        name: "Joe Dirt",
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", null, {});
  },
};
