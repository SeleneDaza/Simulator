import React, { useState } from 'react';
import './SimulationView.css';

const formatTimeline = (timelineArray) => {
    const blocks = [];
    let current = null;
    timelineArray.forEach((pid, index) => {
        if (!current || current.pid !== pid) {
            if (current) { current.end = index; blocks.push(current); }
            current = { pid, start: index, end: index + 1 };
        } else { current.end = index + 1; }
    });
    if (current && !blocks.includes(current)) blocks.push(current);
    return blocks;
};

const QueueBadge = ({ pid, processes }) => {
    const processData = processes.find(p => p.id === pid);
    const bgColor = processData ? processData.color : '#555';
    return (
        <span className="queue-badge" style={{backgroundColor: bgColor}}>
            {pid}
        </span>
    );
};

const GanttChart = ({ timeline, processes }) => {
    if (timeline.length === 0) return <div className="waiting-message">Waiting for execution...</div>;
    const totalTime = timeline[timeline.length - 1].end;
    if (totalTime === 0) return <div className="no-data-message">No data found...</div>;

    return (
        <div className="gantt-container">
            <div className="gantt-bar-container">
                {timeline.map((block, i) => {
                    const duration = block.end - block.start;
                    const processData = processes.find(p => p.id === block.pid);
                    const bgColor = processData ? processData.color : 'transparent';
                    const isIdle = block.pid === 'IDLE';

                    return (
                        <div key={i} className={`gantt-bar-item ${isIdle ? 'idle' : 'process'}`} style={{
                            flex: duration,
                            backgroundColor: bgColor,
                            borderLeft: (i > 0 ? '2px solid black' : 'none')
                        }}>
                            {!isIdle && block.pid.toLowerCase()}
                        </div>
                    );
                })}
            </div>

            <div className="gantt-time-labels">
                {timeline.map((block, i) => (
                    <div key={i} className="gantt-time-label" style={{
                        left: `${(block.end / totalTime) * 100}%`
                    }}>
                        {block.end}
                    </div>
                ))}
            </div>
        </div>
    );
};

const HoverInfo = ({ children }) => (
    <div className="hover-info">
        {children}
    </div>
);

const robotImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 160%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 stop-color=%22%233f3fff%22 /%3E%3Cstop offset=%22100%25%22 stop-color=%22%23ff7ce8%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 rx=%2220%22 fill=%22%23fff%22 opacity=%220.05%22 /%3E%3Ccircle cx=%2280%22 cy=%2280%22 r=%2260%22 fill=%22url(%23g)%22 opacity=%220.9%22 /%3E%3Cpath d=%22M56 82c0-14 0-20 12-20h24c12 0 12 6 12 20v18c0 14-6 20-12 20H68c-6 0-12-6-12-20V82z%22 fill=%22%23182a4b%22 /%3E%3Ccircle cx=%2270%22 cy=%2276%22 r=%225%22 fill=%22%23fff%22 /%3E%3Ccircle cx=%2290%22 cy=%2276%22 r=%225%22 fill=%22%23fff%22 /%3E%3Cpath d=%22M72 98h16v6H72z%22 fill=%22%23ffb8d2%22 /%3E%3Cpath d=%22M44 48h70v12h-70z%22 fill=%22%230A1343%22 opacity=%220.18%22 /%3E%3Cpath d=%22M40 52h10v20H40zM110 52h10v20h-10z%22 fill=%22%231e2d52%22 /%3E%3C/svg%3E';

const SimulationView = ({
                            processes,
                            quantum,
                            clock,
                            isPlaying,
                            setIsPlaying,
                            simulationSpeed,
                            setSimulationSpeed,
                            vrrResult,
                            mlfqResult,
                            srtfResult,
                            onFinish
                        }) => {

    const [hovered, setHovered] = useState(null);

    return (
        <div className="simulation-container">
            <div className="simulation-sidebar">
                <div className="simulation-sidebar-scroll">
                    <h2>Simulation</h2>

                    <img
                        src="/Captura_de_pantalla_2026-03-24_215933-removebg-preview.png"
                        alt="robot"
                        className="simulation-robot"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Ctext x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2236%22 fill=%22%23f3f4f6%22%3E🤖%3C/text%3E%3C/svg%3E'; }}
                    />

                    <div className="simulation-controls">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`btn-play-pause ${isPlaying ? 'playing' : 'stopped'}`}
                        >
                            {isPlaying ? "⏸ PAUSE" : "START"}
                        </button>

                        <button
                            onClick={onFinish}
                            className="btn-finish"
                        >
                            FINISH
                        </button>

                        <div className="sidebar-table-container">
                            <h4 className="sidebar-table-title">Input Data</h4>
                            <table className="sidebar-table">
                                <thead>
                                <tr>
                                    <th>PID</th>
                                    <th>Arr</th>
                                    <th>Burst</th>
                                    <th>I/O</th>
                                </tr>
                                </thead>
                                <tbody>
                                {processes.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <span className="pid-badge" style={{
                                                backgroundColor: p.color
                                            }}>
                                                {p.id}
                                            </span>
                                        </td>
                                        <td>{p.arrivalTime ?? p.arrival ?? 0}</td>
                                        <td>{p.burstTime ?? p.burst ?? 0}</td>
                                        <td>{(p.ioRequestTime ?? p.ioRequestTime) > 0 ? (p.ioRequestTime ?? p.ioRequestTime) : '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="simulation-clock">
                    ⏰ {clock}
                </div>

                <div className="simulation-speed-control">
                    <span>Speed:</span>
                    <input
                        type="range"
                        min="0.5"
                        max="4"
                        step="0.5"
                        value={simulationSpeed}
                        onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                        className="speed-slider"
                    />
                    <span>{simulationSpeed.toFixed(2)}x</span>
                </div>
            </div>

            <div className="simulation-content">
                <div
                    onMouseEnter={() => setHovered('vrr')}
                    onMouseLeave={() => setHovered(null)}
                    className="algorithm-section"
                >
                    <h2 className="algorithm-title vrr">
                        Virtual Round Robin
                    </h2>

                    {hovered === 'vrr' && (
                        <HoverInfo>
                            <div><strong>Quantum:</strong> {quantum}</div>
                            <div><strong>CPU:</strong> {vrrResult.running ? <QueueBadge pid={vrrResult.running.pid} processes={processes} /> : "IDLE"}</div>
                            <div><strong>Ready:</strong> {vrrResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                            <div><strong>I/O:</strong> {vrrResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                        </HoverInfo>
                    )}

                    <GanttChart timeline={formatTimeline(vrrResult.timeline)} processes={processes} />
                </div>

                <div
                    onMouseEnter={() => setHovered('mlfq')}
                    onMouseLeave={() => setHovered(null)}
                    className="algorithm-section"
                >
                    <h2 className="algorithm-title mlfq">
                        MLFQ
                    </h2>

                    {hovered === 'mlfq' && (
                        <HoverInfo>
                            <div><strong>CPU:</strong> {mlfqResult.running ? <QueueBadge pid={mlfqResult.running.pid} processes={processes} /> : "IDLE"}</div>
                            {mlfqResult.queues.map((q, i) => (
                                <div key={i}><strong>Queue {i}:</strong> {q.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                            ))}
                        </HoverInfo>
                    )}

                    <GanttChart timeline={formatTimeline(mlfqResult.timeline)} processes={processes} />
                </div>

                <div
                    onMouseEnter={() => setHovered('srtf')}
                    onMouseLeave={() => setHovered(null)}
                    className="algorithm-section"
                >
                    <h2 className="algorithm-title srtf">
                        SRTF
                    </h2>

                    {hovered === 'srtf' && (
                        <HoverInfo>
                            <div><strong>CPU:</strong> {srtfResult.running ? <QueueBadge pid={srtfResult.running.pid} processes={processes} /> : "IDLE"}</div>
                            <div><strong>Ready:</strong> {srtfResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                            <div><strong>I/O:</strong> {srtfResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                        </HoverInfo>
                    )}

                    <GanttChart timeline={formatTimeline(srtfResult.timeline)} processes={processes} />
                </div>
            </div>
        </div>
    );
};

export default SimulationView;