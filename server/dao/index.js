import User from "../model/User";
import MonitoredEndpoint from "../model/MonitoredEndpoint";
import MonitoringResult from "../model/MonitoringResult";

export default class Dao {
    constructor() {
    }

    /**
     * Adds user to db.
     * @param {User} user target user
     * @return {Promise<User>} added user
     */
    async addUser(user){}

    /**
     * Lists all user endpoints.
     * @param {number} userId owner user's id
     * @return {Promise<array<MonitoredEndpoint>>} list of monitored endpoints' target values
     */
    async getUserEndpoints(userId) {
    }

    /**
     * Creates endpoint for user.
     * @param {id} userId user owner id
     * @param {object} endpointProps endpoint properties
     * @return {Promise<MonitoredEndpoint>} created endpoint
     */
    async createEndpoint(userId, endpointProps) {
    }

    /**
     * Updates endpoint.
     * @param {number} authdUserId authorized user's id
     * @param {number} endpointId target endpoint's id
     * @param {object} endpointProps new values
     * @return {Promise<MonitoredEndpoint>} updated endpoint
     * @throws {Error} if unauthorized
     */
    async updateEndpoint(authdUserId, endpointId, endpointProps) {
    }

    /**
     * Deletes endpoint and stops monitoring.
     * @param {number} authdUserId
     * @param {number} endpointId
     * @return {Promise<number>} deleted endpoint's id
     * @throws {Error} if unauthorized
     */
    async deleteEndpoint(authdUserId, endpointId) {
    }

    /**
     * User auth based on name & access token and returns user's id.
     * @param {string} userName
     * @param {string} accessToken
     * @return {Promise<User>} auth'd user
     * @throws {Error} if unauthorized
     */
    async nameTokenAuth(userName, accessToken) {
    }

    /**
     * Gets endpoint details.
     * @param {number} authdUserId authorized user id
     * @param {number} endpointId endpoint id
     * @return {Promise<MonitoredEndpoint>} resulted MonitoredEndpoint
     * @throws {Error} if unauthorized
     */
    async getEndpoint(authdUserId, endpointId) {
    }

    /**
     * Saves monitoring result
     * @param {MonitoringResult} monitoringResult data values of monitoring result
     * @return {Promise<MonitoringResult>} saved result
     */
    async saveMonitoringResult(monitoringResult) {
    }

    /**
     * Gets monitoring results for endpoint.
     * @param {number} authdUserId authorized user id
     * @param {number} endpointId target endpoint
     * @param {number} limit maximum shown results
     * @return {Promise<array<MonitoringResult>>} list of MonitoringResults'
     * @throws {Error} if unauthorized
     * */
    async listMonitoringResults(authdUserId, endpointId,limit) {
    }

    /**
     * Sets endpoint's last check date to current date time.
     * @param {number} endpointId target endpoint
     * @return {Promise<number>} number of endpoints updated (0 or 1)
     */
    async updateLastCheck(endpointId) {
    }

    /**
     * Returns all monitored endpoints with interval at least the interval specified.
     * @param {number} minInterval
     * @return {Promise<array<MonitoredEndpoint>>} array of monitored endpoints
     */
    async getAllMonitoredEndpoints(minInterval){
    }
}
