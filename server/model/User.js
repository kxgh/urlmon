import {DataTypes, Model} from "sequelize";

export default class User extends Model {
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
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            userName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            accessToken: {
                type: DataTypes.STRING,
            }
        }
    }

    static getHooks() {
        return {
            beforeCreate(instance) {
                instance.dataValues.id = null;
            }
        }
    }
}