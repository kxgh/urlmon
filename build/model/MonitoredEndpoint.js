"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("sequelize");

class MonitoredEndpoint extends _sequelize.Model {
  /**
   * @param {object} props
   * @param {number} [props.id]
   * @param {string} [props.name]
   * @param {string} [props.url]
   * @param {Date} [props.createDate]
   * @param {Date} [props.lastCheckDate]
   * @param {number} [props.monitoredInterval]
   * @param {number} [props.userId]
   */
  constructor(props = {}) {
    super(props);
    this.id = props.id;
    this.name = props.name;
    this.url = props.url;
    this.createDate = props.createDate;
    this.lastCheckDate = props.lastCheckDate;
    this.monitoredInterval = props.monitoredInterval;
    this.userId = props.userId;
  }

  static getAttributes() {
    return {
      id: {
        type: _sequelize.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: _sequelize.DataTypes.STRING
      },
      url: {
        type: _sequelize.DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: {
            msg: 'BAD URL'
          }
        }
      },
      createDate: {
        type: _sequelize.DataTypes.DATE,
        defaultValue: _sequelize.DataTypes.NOW
      },
      lastCheckDate: {
        type: _sequelize.DataTypes.DATE,
        allowNull: true
      },
      monitoredInterval: {
        type: _sequelize.DataTypes.INTEGER.UNSIGNED
      }
    };
  }

  static getHooks() {
    return {
      beforeCreate(instance, options) {
        instance.dataValues.id = null;
        instance.dataValues.createDate = new Date();
      }

    };
  }

}

exports.default = MonitoredEndpoint;