export const vrrTick = (state, clock, quantum) => {

    const { readyQueue, auxQueue, completed, ioList } = state;

    // 1. Handle I/O Processes (Independent of CPU)

    for (let i = ioList.length - 1; i >= 0; i--) {

        const process = ioList[i];

        process.ioRemaining--;

        if (process.ioRemaining <= 0) {

            process.state = 'READY';

            auxQueue.push(process); // VRR Priority

            ioList.splice(i, 1);

        }

    }

    // 2. Scheduler Assessment (Check previous tick's results)

    if (state.running) {

        const proc = state.running;

        const executedTime = proc.burstTime - proc.remainingTime;

        // Critical: Check conditions based on CURRENT state (before execution)

        // But wait... if we check before execution, we are checking the state resulted from PREVIOUS tick.

        const isFinished = proc.remainingTime <= 0;

        const isQuantumExpired = proc.quantumUsed >= quantum;

        const shouldBlock =

            proc.ioRequestTime !== null &&

            !proc.hasDoneIO &&

            executedTime >= proc.ioRequestTime;

        if (isFinished) {

            proc.state = 'COMPLETED';

            proc.completionTime = clock; // Finished exactly at 'clock' start (conceptually end of prev tick)

            completed.push(proc);

            state.running = null;

        } else if (shouldBlock) {

            proc.state = 'WAITING';

            proc.hasDoneIO = true;

            ioList.push(proc);

            state.running = null;

        } else if (isQuantumExpired) {

            proc.state = 'READY';

            proc.quantumUsed = 0; // Reset quantum

            readyQueue.push(proc);

            state.running = null;

        }

    }

    // 3. Dispatcher (If CPU is clear, pick next)

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

    // 4. Execution (Run 1 unit of time)

    if (state.running) {

        const proc = state.running;

        proc.remainingTime--;

        proc.quantumUsed++;

        // We DO NOT check for exit/preemption here.

        // We let the state persist until the start of the NEXT tick.

        // This ensures visual consistency: "Tick 3: P1 runs" -> Output shows P1.

    }

    // 5. Update Waiting Times

    readyQueue.forEach(p => p.waitingTime++);

    auxQueue.forEach(p => p.waitingTime++);

    return state;

};