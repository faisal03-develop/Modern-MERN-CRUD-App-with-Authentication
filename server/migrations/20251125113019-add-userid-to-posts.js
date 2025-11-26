'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true, // We allow null for now so existing posts don't break
      references: {
        model: 'Users', // This links it to the Users table
        key: 'id',      // This links it to the id column
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // If a User is deleted, delete their posts too
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'userId');
  }
};