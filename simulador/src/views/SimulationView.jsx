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

const SimulationView = ({
                            processes,
                            quantum,
                            clock,
                            isPlaying,
                            setIsPlaying,
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
                        src="/robot.png"
                        alt="robot"
                        className="simulation-robot"
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