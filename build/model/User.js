"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("sequelize");

class User extends _sequelize.Model {
  /**
   * @param {object} props
   * @param {number} [props.id]
   * @param {string} [props.userName]
   * @param {string} [props.email]
   * @param {string} [props.accessToken]
   */
  constructor(props = {}) {
    super(props);
    this.id = props.id;
    this.userName = props.userName;
    this.email = props.email;
    this.accessToken = props.accessToken;
  }

  static getAttributes() {
    return {
      id: {
        type: _sequelize.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      userName: {
        type: _sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: _sequelize.DataTypes.STRING,
        allowNull: false
      },
      accessToken: {
        type: _sequelize.DataTypes.STRING
      }
    };
  }

  static getHooks() {
    return {
      beforeCreate(instance) {
        instance.dataValues.id = null;
      }

    };
  }

}

exports.default = User;