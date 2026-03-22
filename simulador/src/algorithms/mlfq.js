
export const mlfqTick = (state, clock, quantums = [5, 10, 20], boostInterval = 50) => {
    const { queues, completed, ioList } = state;

    if (clock > 0 && clock % boostInterval === 0) {
        [...queues[1], ...queues[2]].forEach(p => p.quantumUsed = 0);

        queues[0].push(...queues[1]);
        queues[0].push(...queues[2]);
        queues[1] = [];
        queues[2] = [];

        if (state.running) {
            state.running.queueLevel = 0;
            state.running.quantumUsed = 0;
        }
    }

    for (let i = ioList.length - 1; i >= 0; i--) {
        const process = ioList[i];
        process.ioRemaining--;
        if (process.ioRemaining <= 0) {
            process.state = 'READY';
            process.queueLevel = 0;
            process.quantumUsed = 0;
            queues[0].push(process);
            ioList.splice(i, 1);
        }
    }

    if (state.running) {
        const proc = state.running;
        const executedTime = proc.burstTime - proc.remainingTime;

        const isFinished = proc.remainingTime <= 0;
        const shouldBlock = proc.ioRequestTime !== null && !proc.hasDoneIO && executedTime >= proc.ioRequestTime;

        const qLevel = proc.queueLevel !== undefined ? proc.queueLevel : 0;
        const currentQuantum = quantums[qLevel];
        const isQuantumExpired = proc.quantumUsed >= currentQuantum;

        let isPreempted = false;
        for (let i = 0; i < qLevel; i++) {
            if (queues[i].length > 0) {
                isPreempted = true;
                break;
            }
        }

        if (isFinished) {
            proc.state = 'COMPLETED';
            proc.completionTime = clock;
            completed.push(proc);
            state.running = null;
        } else if (shouldBlock) {
            proc.state = 'WAITING';
            proc.hasDoneIO = true;
            ioList.push(proc);
            state.running = null;
        } else if (isQuantumExpired) {

            proc.state = 'READY';
            proc.quantumUsed = 0;
            proc.queueLevel = Math.min(2, qLevel + 1);
            queues[proc.queueLevel].push(proc);
            state.running = null;
        } else if (isPreempted) {

            proc.state = 'READY';
            queues[qLevel].push(proc);
            state.running = null;
        }
    }

    if (!state.running) {
        for (let i = 0; i < queues.length; i++) {
            if (queues[i].length > 0) {
                const next = queues[i].shift();
                state.running = next;
                next.state = 'RUNNING';
                next.queueLevel = i;
                if (next.startTime === null) next.startTime = clock;
                break;
            }
        }
    }

    if (state.running) {
        const proc = state.running;
        proc.remainingTime--;
        proc.quantumUsed++;
    }

    queues.forEach(queue => {
        queue.forEach(p => p.waitingTime++);
    });

    return state;
};