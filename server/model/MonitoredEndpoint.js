import {DataTypes, Model} from "sequelize";

export default class MonitoredEndpoint extends Model {
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
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
            },
            url: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUrl: {msg: 'BAD URL'}
                }
            },
            createDate: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            lastCheckDate: {
                type: DataTypes.DATE,
                allowNull: true
            },
            monitoredInterval: {
                type: DataTypes.INTEGER.UNSIGNED
            }
        }
    }

    static getHooks() {
        return {
            beforeCreate(instance, options) {
                instance.dataValues.id = null;
                instance.dataValues.createDate = new Date();
            }
        }
    }
}