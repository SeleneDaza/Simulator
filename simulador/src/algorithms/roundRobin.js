export const vrrTick = (state, clock, quantum) => {

    const { readyQueue, auxQueue, completed, ioList } = state;

    for (let i = ioList.length - 1; i >= 0; i--) {

        const process = ioList[i];

        process.ioRemaining--;

        if (process.ioRemaining <= 0) {

            process.state = 'READY';

            auxQueue.push(process); 

            ioList.splice(i, 1);

        }

    }

    if (state.running) {

        const proc = state.running;

        const executedTime = proc.burstTime - proc.remainingTime;

        const isFinished = proc.remainingTime <= 0;

        const isQuantumExpired = proc.quantumUsed >= quantum;

        const shouldBlock =

            proc.ioRequestTime !== null &&

            !proc.hasDoneIO &&

            executedTime >= proc.ioRequestTime;

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

            readyQueue.push(proc);

            state.running = null;

        }

    }


    if (!state.running) {

        if (auxQueue.length > 0) {

            const next = auxQueue.shift();

            state.running = next;

            next.state = 'RUNNING';

            if (next.startTime === null) next.startTime = clock;

        } else if (readyQueue.length > 0) {

            const next = readyQueue.shift();

            state.running = next;

            next.state = 'RUNNING';

            next.quantumUsed = 0;

            if (next.startTime === null) next.startTime = clock;

        }

    }


    if (state.running) {

        const proc = state.running;

        proc.remainingTime--;

        proc.quantumUsed++;

    }

    readyQueue.forEach(p => p.waitingTime++);

    auxQueue.forEach(p => p.waitingTime++);

    return state;

};