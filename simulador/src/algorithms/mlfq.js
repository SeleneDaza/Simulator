const quantums = [5, 10, 20];

export default function mlfq(processes) {

    let time = 0;

    let queues = [[], [], []];

    let timeline = [];

    let procs = [...processes].sort(
        (a, b) => a.arrivalTime - b.arrivalTime
    );

    let index = 0;

    while (
        index < procs.length ||
        queues.some(q => q.length > 0)
    ) {

        // agregar procesos que llegaron
        while (
            index < procs.length &&
            procs[index].arrivalTime <= time
        ) {
            queues[0].push(procs[index]);
            index++;
        }

        let qIndex = queues.findIndex(
            q => q.length > 0
        );

        if (qIndex === -1) {
            time++;
            continue;
        }

        let p = queues[qIndex].shift();

        let quantum = quantums[qIndex];

        let used = 0;

        if (p.startTime === null) {
            p.startTime = time;
        }

        p.state = "RUNNING";

        let startTime = time;

        // permitir preempción
        while (
            used < quantum &&
            p.remainingTime > 0
        ) {

            time++;
            used++;
            p.remainingTime--;
            p.quantumUsed++;

            // agregar nuevos procesos
            while (
                index < procs.length &&
                procs[index].arrivalTime <= time
            ) {
                queues[0].push(procs[index]);
                index++;
            }

            //PREEMPCIÓN
            let higher = queues.findIndex(
                (q, i) =>
                    i < qIndex && q.length > 0
            );

            if (higher !== -1) {
                break;
            }
        }

        timeline.push({
            pid: p.pid,
            start: startTime,
            end: time,
            queue: qIndex,
            color: p.color
        });

        if (p.remainingTime > 0) {

            p.state = "READY";

            // baja prioridad si termino quantum
            if (used >= quantum) {

                if (qIndex < 2) {
                    queues[qIndex + 1].push(p);
                } else {
                    queues[2].push(p);
                }

            } else {
                // preempción → misma cola
                queues[qIndex].push(p);
            }

        } else {

            p.state = "COMPLETED";
            p.completionTime = time;

        }
    }

    // ---------- stats ----------

    let totalBurst = processes.reduce(
        (a, p) => a + p.burstTime,
        0
    );

    let cpuUtilization = totalBurst / time;

    let throughput =
        processes.length / time;

    let avgResponse =
        processes.reduce(
            (a, p) =>
                a +
                (p.startTime -
                    p.arrivalTime),
            0
        ) / processes.length;

    let avgTurnaround =
        processes.reduce(
            (a, p) =>
                a +
                (p.completionTime -
                    p.arrivalTime),
            0
        ) / processes.length;

    let avgWaiting =
        processes.reduce(
            (a, p) =>
                a +
                (p.completionTime -
                    p.arrivalTime -
                    p.burstTime),
            0
        ) / processes.length;

    let fairness =
        processes.map(
            p => p.quantumUsed / time
        );

    return {
        timeline,
        queues,
        totalTime: time,
        stats: {
            cpuUtilization,
            throughput,
            avgResponse,
            avgTurnaround,
            avgWaiting,
            fairness
        }
    };
}