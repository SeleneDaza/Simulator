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

        this.ioRequestTime = ioRequestTime; 
        this.ioBurst = ioBurst; 
        this.ioRemaining = ioBurst;
        this.hasDoneIO = false; 

        this.state = 'READY'; 
        this.startTime = null;
        this.completionTime = null;
        this.waitingTime = 0;
        this.quantumUsed = 0; 
        this.color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    }
}