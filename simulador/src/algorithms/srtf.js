export const srtfTick = (state, clock) => {
    const { readyQueue, completed, ioList } = state;

    for (let i = ioList.length - 1; i >= 0; i--) {
        const process = ioList[i];
        process.ioRemaining--;
        if (process.ioRemaining <= 0) {
            process.state = 'READY';
            readyQueue.push(process);
            ioList.splice(i, 1);
        }
    }

    if (state.running) {
        const proc = state.running;
        const executedTime = proc.burstTime - proc.remainingTime;

        const isFinished = proc.remainingTime <= 0;
        const shouldBlock = proc.ioRequestTime !== null && !proc.hasDoneIO && executedTime >= proc.ioRequestTime;

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
        } else {
         if (readyQueue.length > 0) {
                let shortestIndex = 0;
                for (let i = 1; i < readyQueue.length; i++) {
                    if (readyQueue[i].remainingTime < readyQueue[shortestIndex].remainingTime) {
                        shortestIndex = i;
                    }
                }
               if (readyQueue[shortestIndex].remainingTime < proc.remainingTime) {
                    proc.state = 'READY';
                    readyQueue.push(proc);
                    state.running = null;
                }
            }
        }
    }

    if (!state.running && readyQueue.length > 0) {
        let shortestIndex = 0;
        for (let i = 1; i < readyQueue.length; i++) {
            if (readyQueue[i].remainingTime < readyQueue[shortestIndex].remainingTime) {
                shortestIndex = i;
            }
        }

        const next = readyQueue.splice(shortestIndex, 1)[0];
        state.running = next;
        next.state = 'RUNNING';
        if (next.startTime === null) next.startTime = clock;
    }

    if (state.running) {
        state.running.remainingTime--;
    }

    readyQueue.forEach(p => p.waitingTime++);

    return state;
};