"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("sequelize");

class MonitoringResult extends _sequelize.Model {
  /**
   * @param {object} props
   * @param {number} [props.id]
   * @param {Date} [props.checkDate]
   * @param {number} [props.statusCode]
   * @param {string} [props.payload]
   * @param {number} [props.endpointId]
   */
  constructor(props = {}) {
    super(props);
    this.id = props.id;
    this.checkDate = props.checkDate;
    this.statusCode = props.statusCode;
    this.payload = props.payload;
    this.endpointId = props.endpointId;
  }

  static getAttributes() {
    return {
      id: {
        type: _sequelize.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      checkDate: {
        type: _sequelize.DataTypes.DATE,
        defaultValue: _sequelize.DataTypes.NOW
      },
      statusCode: {
        type: _sequelize.DataTypes.SMALLINT.UNSIGNED,
        allowNull: false
      },
      payload: {
        type: _sequelize.DataTypes.TEXT({
          length: "long"
        })
      }
    };
  }

  static getHooks() {
    return {};
  }

}

exports.default = MonitoringResult;