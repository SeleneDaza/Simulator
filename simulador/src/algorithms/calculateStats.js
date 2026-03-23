// src/algorithms/calculateStats.js

export const calculateStats = (timelineArray, processes) => {
    if (timelineArray.length === 0) return null;

    const totalTime = timelineArray.length;
    let idleTime = 0;
    const pStats = {};

    processes.forEach(p => { pStats[p.id] = { start: -1, end: -1, cpuTime: 0, arrival: p.arrival }; });

    timelineArray.forEach((pid, t) => {
        if (pid === 'IDLE') {
            idleTime++;
        } else if (pStats[pid]) {
            if (pStats[pid].start === -1) pStats[pid].start = t;
            pStats[pid].end = t + 1;
            pStats[pid].cpuTime++;
        }
    });

    let sumWait = 0, sumTurnaround = 0, sumResponse = 0;
    let completedCount = 0;

    Object.values(pStats).forEach(s => {
        if (s.cpuTime > 0) {
            completedCount++;
            const turnaround = s.end - s.arrival;
            const response = s.start - s.arrival;
            const wait = turnaround - s.cpuTime;
            sumTurnaround += turnaround;
            sumResponse += response;
            sumWait += wait;
        }
    });

    const avgTurnaround = sumTurnaround / completedCount || 0;
    const avgWait = sumWait / completedCount || 0;
    const avgResponse = sumResponse / completedCount || 0;

    let sumSqDiff = 0;
    Object.values(pStats).forEach(s => {
        if (s.cpuTime > 0) {
            const wait = (s.end - s.arrival) - s.cpuTime;
            sumSqDiff += Math.pow(wait - avgWait, 2);
        }
    });
    const fairness = Math.sqrt(sumSqDiff / completedCount || 0).toFixed(2);

    return {
        cpuUtil: (((totalTime - idleTime) / totalTime) * 100).toFixed(1),
        throughput: (completedCount / totalTime).toFixed(3),
        avgTurnaround: avgTurnaround.toFixed(1),
        avgWait: avgWait.toFixed(1),
        avgResponse: avgResponse.toFixed(1),
        fairness: fairness
    };
};