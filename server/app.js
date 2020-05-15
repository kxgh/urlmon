import Server from "./Server";
import RestMiddleware from "./RestMiddleware";

import Monitor from "./Monitor"

import dbDao from "./dao/DbDao";

let begun = false;
let monitor;

const begin = async () => {
    if (!begun) {
        begun = true;
        await dbDao.syncAndStart();
        const restMiddleware = new RestMiddleware(dbDao);
        new Server(restMiddleware).startServer();
        monitor = new Monitor(restMiddleware);
        monitor.startMonitor();
    }
    return {dao: dbDao, monitor}
};

export default {
    begin
}