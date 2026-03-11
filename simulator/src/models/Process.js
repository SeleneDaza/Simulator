export class Process {
    constructor({
        pid,
        arrivalTime,
        burstTime,
        ioRequestTime = null,
        ioBurst = 0
    }) {
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.remainingTime = burstTime;

        // I/O configs
        this.ioRequestTime = ioRequestTime; // Relative time (e.g. after 2ms of CPU)
        this.ioBurst = ioBurst; // How long I/O takes
        this.ioRemaining = ioBurst;
        this.hasDoneIO = false; // Flag to ensure I/O happens only once per process (simple model)

        // State & Stats
        this.state = 'READY'; // READY, RUNNING, WAITING, COMPLETED
        this.startTime = null;
        this.completionTime = null;
        this.waitingTime = 0;
        this.quantumUsed = 0; // Tracks quantum usage for RR
        this.color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    }
}

