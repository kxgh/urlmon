import {DataTypes, Model} from "sequelize";

export default class MonitoringResult extends Model {
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
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            checkDate: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            statusCode: {
                type: DataTypes.SMALLINT.UNSIGNED,
                allowNull: false
            },
            payload: {
                type: DataTypes.TEXT({length: "long"})
            }
        }
    }

    static getHooks() {
        return {}
    }
}