import React from 'react';
import './ResultsView.css';

const ResultsView = ({ statsVRR, statsMLFQ, statsSRTF }) => {
    const safeStats = (stats) => stats || { cpuUtil: '0.0', throughput: '0.000', avgTurnaround: '0.0', avgWait: '0.0', avgResponse: '0.0', fairness: '0.00' };

    const vrr = { ...safeStats(statsVRR), name: 'VRR', color: '#3b82f6' };
    const mlfq = { ...safeStats(statsMLFQ), name: 'MLFQ', color: '#10b981' };
    const srtf = { ...safeStats(statsSRTF), name: 'SRTF', color: '#ef4444' };

    const algorithms = [vrr, mlfq, srtf];
    const sortedAlgorithms = [...algorithms].sort((a, b) => parseFloat(a.avgWait) - parseFloat(b.avgWait));
    sortedAlgorithms.forEach((alg, index) => { alg.rank = index + 1; });

    const maxWait = Math.max(...algorithms.map(a => parseFloat(a.avgWait))) || 1;
    const maxTurnaround = Math.max(...algorithms.map(a => parseFloat(a.avgTurnaround))) || 1;
    const maxResponse = Math.max(...algorithms.map(a => parseFloat(a.avgResponse))) || 1;
    const maxCPU = Math.max(...algorithms.map(a => parseFloat(a.cpuUtil))) || 1;
    const maxThrough = Math.max(...algorithms.map(a => parseFloat(a.throughput))) || 1;

    const labels = ["Wait", "Resp", "Turn", "CPU", "Thr"];
    const centerX = 100, centerY = 100, radius = 70;
    
    const getPoint = (val, max, i, total) => {
        const factor = (parseFloat(val) / max) * radius;
        const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
        return `${centerX + factor * Math.cos(angle)},${centerY + factor * Math.sin(angle)}`;
    };

    const renderRadar = () => (
        <div className="radar-container">
            <svg width="100%" height="100%" viewBox="0 0 200 200" className="radar-svg">
                {[0.2, 0.4, 0.6, 0.8, 1].map(f => (
                    <polygon key={f} points={labels.map((_, i) => getPoint(f, 1, i, labels.length)).join(' ')} 
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                ))}
                {labels.map((_, i) => (
                    <line key={i} x1={centerX} y1={centerY} x2={getPoint(1, 1, i, labels.length).split(',')[0]} 
                    y2={getPoint(1, 1, i, labels.length).split(',')[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                ))}
                {algorithms.map(alg => {
                    const pts = [
                        getPoint(alg.avgWait, maxWait, 0, 5),
                        getPoint(alg.avgResponse, maxResponse, 1, 5),
                        getPoint(alg.avgTurnaround, maxTurnaround, 2, 5),
                        getPoint(alg.cpuUtil, maxCPU, 3, 5),
                        getPoint(alg.throughput, maxThrough, 4, 5)
                    ].join(' ');
                    return <polygon key={alg.name} points={pts} fill={`${alg.color}33`} stroke={alg.color} strokeWidth="2" />
                })}
            </svg>
            {labels.map((l, i) => {
                const pos = getPoint(1.2, 1, i, labels.length).split(',');
                return <span key={l} className="radar-label" style={{ left: `${pos[0]/2}%`, top: `${pos[1]/2}%` }}>{l}</span>;
            })}
        </div>
    );

    const StatBar = ({ label, value, val, max, color }) => (
        <div className="stat-bar">
            <div className="stat-bar-header">
                <span>{label}</span>
                <strong className="stat-bar-value">{value}</strong>
            </div>
            <div className="stat-bar-container">
                <div className="stat-bar-fill" style={{ width: `${Math.max((parseFloat(val)/max)*100, 2)}%`, backgroundColor: color }} />
            </div>
        </div>
    );

    const renderCard = (alg, mini = false) => {
        const isWinner = alg.rank === 1;
        const baseClass = 'algorithm-card';
        const sizeClass = mini ? 'mini' : '';
        const rankClass = isWinner ? 'winner' : (alg.rank === 2 ? 'second' : 'third');
        
        return (
            <div key={alg.name} className={`${baseClass} ${rankClass} ${sizeClass}`}>
                <div className="card-rank" style={{ color: isWinner ? '#fbbf24' : '#cbd5e1' }}>
                    {alg.rank === 1 ? '🏆 WINNER' : `${alg.rank}º PLACE`}
                </div>
                <h2 className={`card-title ${alg.name.toLowerCase()}`} style={{ color: alg.color }}>{alg.name}</h2>
                <StatBar label="Wait" value={alg.avgWait} val={alg.avgWait} max={maxWait} color={alg.color} />
                <StatBar label="Turn" value={alg.avgTurnaround} val={alg.avgTurnaround} max={maxTurnaround} color={alg.color} />
                <div className="card-stats-grid">
                    <div className="card-stat-item">
                        <div className="card-stat-label">CPU</div>
                        <div className="card-stat-value">{alg.cpuUtil}%</div>
                    </div>
                    <div className="card-stat-item">
                        <div className="card-stat-label">THR</div>
                        <div className="card-stat-value">{alg.throughput}</div>
                    </div>
                </div>
            </div>
        );
    };

return (
    <div className="results-container">
        <header className="results-header">
            <h1 className="results-title">RESULTS</h1>
            <button onClick={() => window.location.reload()} className="btn-new-simulation">NEW SIMULATION</button>
        </header>

        <div className="results-grid">
            
            <div className="results-left">
                {renderCard(sortedAlgorithms[1], true)}
            </div>

            <div className="results-center">
                <div style={{ transform: 'scale(1.2)', margin: '0' }}>
                    {renderRadar()}
                </div>
                <div style={{ transform: 'scale(1.05)', zIndex: 10 }}>
                    {renderCard(sortedAlgorithms[0])}
                </div>
            </div>

            <div className="results-right">
                {renderCard(sortedAlgorithms[2], true)}
            </div>

        </div>
    </div>
);
};

export default ResultsView;