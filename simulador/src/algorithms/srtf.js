/**
 * Ejecuta un "Tick" del algoritmo Shortest Remaining Time First (SRTF).
 * Siempre elige el proceso con el menor tiempo restante. Incluye preempción.
 */
export const srtfTick = (state, clock) => {
    const { readyQueue, completed, ioList } = state;

    // 1. MANEJO DE I/O (Desbloquear procesos)
    for (let i = ioList.length - 1; i >= 0; i--) {
        const process = ioList[i];
        process.ioRemaining--;
        if (process.ioRemaining <= 0) {
            process.state = 'READY';
            readyQueue.push(process);
            ioList.splice(i, 1);
        }
    }

    // 2. EVALUAR PROCESO EN EJECUCIÓN (CPU)
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
            // PREEMPCIÓN SRTF: ¿Hay alguien en la cola al que le falte MENOS tiempo?
            if (readyQueue.length > 0) {
                let shortestIndex = 0;
                for (let i = 1; i < readyQueue.length; i++) {
                    if (readyQueue[i].remainingTime < readyQueue[shortestIndex].remainingTime) {
                        shortestIndex = i;
                    }
                }

                // Si el más corto de la cola tiene menos tiempo restante que el actual en CPU
                if (readyQueue[shortestIndex].remainingTime < proc.remainingTime) {
                    proc.state = 'READY';
                    readyQueue.push(proc);
                    state.running = null;
                }
            }
        }
    }

    // 3. SELECCIONAR NUEVO PROCESO
    if (!state.running && readyQueue.length > 0) {
        // Buscar el proceso con el menor tiempo restante
        let shortestIndex = 0;
        for (let i = 1; i < readyQueue.length; i++) {
            // En caso de empate, gana el que ya estaba primero en la cola (FCFS)
            if (readyQueue[i].remainingTime < readyQueue[shortestIndex].remainingTime) {
                shortestIndex = i;
            }
        }

        // Lo sacamos de la cola y lo metemos a la CPU
        const next = readyQueue.splice(shortestIndex, 1)[0];
        state.running = next;
        next.state = 'RUNNING';
        if (next.startTime === null) next.startTime = clock;
    }

    // 4. ACTUALIZAR TIEMPOS (Tick)
    if (state.running) {
        state.running.remainingTime--;
    }

    readyQueue.forEach(p => p.waitingTime++);

    return state;
};