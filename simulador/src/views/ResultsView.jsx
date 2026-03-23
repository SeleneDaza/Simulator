import React from 'react';

const ResultsView = ({ statsVRR, statsMLFQ, statsSRTF }) => {
    // Estilos en línea para mantenerlo simple
    const cardStyle = { backgroundColor: '#131a2d', padding: '20px', borderRadius: '12px', border: '1px solid #444', flex: 1, minWidth: '300px' };
    const statRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' };

    // Helper de seguridad por si el usuario le dio al botón antes de que terminara la ejecución de algún proceso
    const safeStats = (stats) => stats || { cpuUtil: '0.0', throughput: '0.000', avgTurnaround: '0.0', avgWait: '0.0', avgResponse: '0.0', fairness: '0.00' };

    const vrr = safeStats(statsVRR);
    const mlfq = safeStats(statsMLFQ);
    const srtf = safeStats(statsSRTF);

    return (
        <div style={{ padding: '40px', color: 'white', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Resultados de Simulación</h1>
                <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
                    Nueva Simulación
                </button>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Tarjeta VRR */}
                <div style={cardStyle}>
                    <h2 style={{ color: '#007bff', textAlign: 'center', marginTop: 0 }}>Virtual Round Robin</h2>
                    <div style={statRow}><span>CPU Utilización:</span> <strong>{vrr.cpuUtil}%</strong></div>
                    <div style={statRow}><span>Throughput:</span> <strong>{vrr.throughput} p/tick</strong></div>
                    <div style={statRow}><span>T. Terminación Prom:</span> <strong>{vrr.avgTurnaround}s</strong></div>
                    <div style={statRow}><span>Query (Wait) Time Prom:</span> <strong>{vrr.avgWait}s</strong></div>
                    <div style={statRow}><span>Response Time Prom:</span> <strong>{vrr.avgResponse}s</strong></div>
                    <div style={statRow}><span>Fairness (Desviación T. Wait):</span> <strong>{vrr.fairness}</strong></div>
                </div>

                {/* Tarjeta MLFQ */}
                <div style={cardStyle}>
                    <h2 style={{ color: '#28a745', textAlign: 'center', marginTop: 0 }}>MLFQ</h2>
                    <div style={statRow}><span>CPU Utilización:</span> <strong>{mlfq.cpuUtil}%</strong></div>
                    <div style={statRow}><span>Throughput:</span> <strong>{mlfq.throughput} p/tick</strong></div>
                    <div style={statRow}><span>T. Terminación Prom:</span> <strong>{mlfq.avgTurnaround}s</strong></div>
                    <div style={statRow}><span>Query (Wait) Time Prom:</span> <strong>{mlfq.avgWait}s</strong></div>
                    <div style={statRow}><span>Response Time Prom:</span> <strong>{mlfq.avgResponse}s</strong></div>
                    <div style={statRow}><span>Fairness (Desviación T. Wait):</span> <strong>{mlfq.fairness}</strong></div>
                </div>

                {/* Tarjeta SRTF */}
                <div style={cardStyle}>
                    <h2 style={{ color: '#dc3545', textAlign: 'center', marginTop: 0 }}>SRTF</h2>
                    <div style={statRow}><span>CPU Utilización:</span> <strong>{srtf.cpuUtil}%</strong></div>
                    <div style={statRow}><span>Throughput:</span> <strong>{srtf.throughput} p/tick</strong></div>
                    <div style={statRow}><span>T. Terminación Prom:</span> <strong>{srtf.avgTurnaround}s</strong></div>
                    <div style={statRow}><span>Query (Wait) Time Prom:</span> <strong>{srtf.avgWait}s</strong></div>
                    <div style={statRow}><span>Response Time Prom:</span> <strong>{srtf.avgResponse}s</strong></div>
                    <div style={statRow}><span>Fairness (Desviación T. Wait):</span> <strong>{srtf.fairness}</strong></div>
                </div>
            </div>

        </div>
    );
};

export default ResultsView;