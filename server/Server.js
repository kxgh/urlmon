import * as restify from "restify";
import RestMiddleware from "./RestMiddleware";
import {HOST,PORT} from "./constants";


class Server {

    /**
     * @param {RestMiddleware} middleware
     */
    constructor(middleware) {
        this.server =  restify.createServer();
        this.server.use(restify.plugins.jsonBodyParser({}));
        this.server.use(restify.plugins.queryParser());
        this.middleware = middleware;
    }

    /***
     * @param {Object} opts
     * @param {number} [opts.port] server port to be used
     * @param {string} [opts.host] server url
     */
    startServer({port = PORT, host = HOST} = {}) {
        const mid = this.middleware;

        this.server.get('/:userName/endpoints', mid.auth, mid.getUserEndpoints);
        this.server.get('/:userName', mid.auth, mid.getUserEndpoints);
        this.server.get('/:userName/endpoints/:endpointId', mid.auth, mid.getEndpoint);
        this.server.get('/:userName/endpoints/:endpointId/results', mid.auth, mid.listMonitoringResults);
        this.server.post('/:userName/endpoints', mid.auth, mid.createEndpoint);
        this.server.put('/:userName/endpoints/:endpointId', mid.auth, mid.updateEndpoint);
        this.server.patch('/:userName/endpoints/:endpointId', mid.auth, mid.updateEndpoint);
        this.server.del('/:userName/endpoints/:endpointId', mid.auth, mid.deleteEndpoint);

        this.server.listen(port, host, () => {
            console.log('%s listening at %s', this.server.name, this.server.url);
        });
    }
}

export default Server