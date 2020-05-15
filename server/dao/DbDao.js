import {isTesting, ERR_NOT_FOUND, ERR_INTERNAL, ERR_UNAUTHD, ERR_UNAUTHD_NOT_FOUND} from "../constants";
import {DB_HOST,DB_PORT,DB_DIALECT,DB_TIMEZONE,DB_DATABASE,DB_PASSWORD,DB_USER} from "../constants";
import Dao from ".";
import User from "../model/User"
import MonitoredEndpoint from "../model/MonitoredEndpoint"
import MonitoringResult from "../model/MonitoringResult"

console.log(`Connecting to ${DB_DATABASE} with ${DB_USER} ${isTesting() ? 'testing.': ''}`);

import {Op, Sequelize} from "sequelize";

const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    timezone: DB_TIMEZONE
});

User.init(User.getAttributes(), {sequelize, timestamps: false, hooks: User.getHooks()});
MonitoredEndpoint.init(MonitoredEndpoint.getAttributes(User), {
    sequelize,
    timestamps: false,
    hooks: MonitoredEndpoint.getHooks()
});
MonitoringResult.init(MonitoringResult.getAttributes(MonitoredEndpoint), {
    sequelize,
    timestamps: false,
    hooks: MonitoringResult.getHooks()
});
User.hasMany(MonitoredEndpoint, {
    foreignKey: 'userId'
});
MonitoredEndpoint.belongsTo(User, {
    foreignKey: 'userId'
});

MonitoredEndpoint.hasMany(MonitoringResult, {
    foreignKey: 'endpointId',
    onDelete: 'CASCADE',
    hooks: true
});
MonitoringResult.belongsTo(MonitoredEndpoint, {
    foreignKey: 'endpointId',
    onDelete: 'CASCADE',
    hooks: true
});


class DbDao extends Dao {
    constructor(props) {
        super(props);
        this._syncd = false;
    }

    async syncAndStart() {
        await sequelize.sync({force: isTesting()});
        return (this._syncd = true)
    }

    async nameTokenAuth(userName, accessToken) {
        const user = await User.findOne({
            where: {
                userName
            }
        });
        if (!user)
            throw new Error(ERR_NOT_FOUND)
        else if (user.accessToken !== accessToken)
            throw new Error(ERR_UNAUTHD);
        user.id = parseInt(user.id);
        return user
    }

    async createEndpoint(userId, endpointProps) {
        endpointProps.userId = userId;
        const newMe = new MonitoredEndpoint(endpointProps);
        return (await MonitoredEndpoint.create(newMe));
    }

    async deleteEndpoint(authdUserId, endpointId) {
        const delMe = await MonitoredEndpoint.destroy({
            where: {
                id: endpointId,
                userId: authdUserId
            }
        });
        if (!delMe)
            throw new Error(ERR_UNAUTHD_NOT_FOUND)
        return endpointId
    }

    async saveMonitoringResult(monitoringResult) {
        return MonitoringResult.create(monitoringResult);
    }

    async listMonitoringResults(authdUserId, endpointId, limit) {
        console.log('listingmonitoring results with limit ', limit)
        const me = await MonitoredEndpoint.findByPk(endpointId);
        if (!me || me.userId != authdUserId)
            throw new Error(ERR_UNAUTHD_NOT_FOUND);
        const mrs = await me.getMonitoringResults({
            order: [['id', 'DESC']],
            limit: limit
        });
        if (!mrs)
            return [];
        return mrs
    }

    async getEndpoint(authdUserId, endpointId) {
        const gotMe = await MonitoredEndpoint.findByPk(endpointId)
        if (!gotMe || gotMe.userId != authdUserId)
            throw new Error(ERR_UNAUTHD_NOT_FOUND)
        return gotMe;
    }

    async updateEndpoint(authdUserId, endpointId, endpointProps) {
        let me = await MonitoredEndpoint.findByPk(endpointId);
        if (me && me.dataValues.userId == authdUserId) {
            me = me.dataValues;
            // avoid sequelize's me.update()
            Object.assign(me, endpointProps, {id: endpointId, userId: authdUserId});
            await MonitoredEndpoint.update(me, {
                where: {
                    id: endpointId
                }
            });
            return new MonitoredEndpoint(me)
        }
        throw new Error(ERR_UNAUTHD_NOT_FOUND);
    }

    async getUserEndpoints(userId) {
        const user = await User.findByPk(userId);
        const eps = await user.getMonitoredEndpoints();
        if (!eps)
            return [];
        return eps
    }

    async updateLastCheck(endpointId) {
        let updated = await MonitoredEndpoint.update({lastCheckDate: new Date()}, {
            where: {
                id: endpointId
            },
            validate: false
        });
        if (Array.isArray(updated))
            updated = updated[0];
        return updated ? endpointId : null
    }

    async addUser(user) {
        if (typeof user.save === 'function') {
            await user.save();
            return user;
        }
        return User.create(new User(user))
    }

    async getAllMonitoredEndpoints(minInterval) {
        const mes = await MonitoredEndpoint.findAll({
            where: {
                monitoredInterval: {
                    [Op.gte]: minInterval
                }
            }
        });
        return mes
    }
}

const dbDao = new DbDao;

export default dbDao;