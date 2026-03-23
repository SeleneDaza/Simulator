import React from 'react';

const ConfigView = ({ processes, setProcesses, quantum, setQuantum, onStart }) => {

    const addProcess = () => {
        const name = prompt("Nombre del proceso (ej: P1):");
        if (!name) return;
        const arrival = parseInt(prompt("Tiempo de llegada (arrival):"), 10);
        if (isNaN(arrival)) return alert("Arrival inválido");
        const burst = parseInt(prompt("Tiempo de ejecución (burst):"), 10);
        if (isNaN(burst) || burst <= 0) return alert("Burst inválido");

        const ioInput = prompt(`¿En qué momento de su ejecución solicita I/O? (Opcional.\nDebe ser menor a ${burst}. Deja vacío si no tiene):`);
        let ioRequestTime = null;
        if (ioInput !== null && ioInput.trim() !== "") {
            ioRequestTime = parseInt(ioInput, 10);
            if (isNaN(ioRequestTime) || ioRequestTime <= 0 || ioRequestTime >= burst) {
                return alert(`I/O inválido. Debe ser un número entre 1 y ${burst - 1}`);
            }
        }
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        setProcesses([...processes, { id: name, arrival, burst, ioRequestTime, color: randomColor }]);
    };

    const deleteProcess = (id) => {
        if (window.confirm(`¿Eliminar ${id}?`)) {
            setProcesses(processes.filter(p => p.id !== id));
        }
    };

    const addRandomProcess = () => {
        const randomId = `P${processes.length + 1}`;
        const randomArrival = Math.floor(Math.random() * 15);
        const randomBurst = Math.floor(Math.random() * 10) + 2;
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;

        let ioRequestTime = null;
        if (Math.random() < 0.3 && randomBurst > 2) {
            ioRequestTime = Math.floor(Math.random() * (randomBurst - 2)) + 1;
        }
        setProcesses([...processes, { id: randomId, arrival: randomArrival, burst: randomBurst, ioRequestTime, color: randomColor }]);
    };

    return (
        <div className="layout-wrapper">
            <aside className="sidebar">
                <div className="robot-container">
                    <div className="robot-placeholder robot-img" style={{height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>🤖</div>
                </div>
                <h1 className="title" style={{fontSize: '2.5rem', fontWeight: '800'}}>RR <span style={{color: 'var(--air-blue)'}}>vs</span> MLQ <span style={{color: 'var(--air-blue)'}}>vs</span> SRTF</h1>
                <p style={{color: 'var(--pink-lavender)', letterSpacing: '4px'}}>SIMULATOR</p>

                <div className="controls">
                    <div className="quantum" style={{textAlign: 'left'}}>
                        <label style={{fontSize: '1rem', color: ' #B8C7E0', margin: 2, marginTop: 4}}>QUANTUM (Para RR)</label>
                        <input type="number" value={quantum} onChange={(e) => setQuantum(parseInt(e.target.value) || 1)} className="custom-input" />
                    </div>
                    <div className='buttonsDiv'>
                        <button onClick={addRandomProcess} className="btn-secondary" style={{border: '2px solid var(--pink-lavender)', background: 'none', color: 'var(--pink-lavender)', padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold'}}>GENERATE RANDOM</button>
                        <button onClick={onStart} className="btn-primary">START SIMULATION</button>
                    </div>
                </div>
            </aside>

            <main className="process-panel">
                <h2 style={{ fontSize: '3rem', opacity: 0.9, color: '#EAF2FF'}}>Processes</h2>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                    {processes.map((p, index) => (
                        <div key={p.id} className="process-card" style={{animationDelay: `${index * 0.1}s`}}>
                            <div className="color-box" style={{ backgroundColor: p.color, width: '50px', height: '50px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}></div>
                            <div>
                                <strong style={{fontSize: '1.4rem', display: 'block'}}>{p.id}</strong>
                                <span style={{color: 'var(--air-blue)', fontSize: '0.9rem'}}>Arr: {p.arrival}s | Burst: {p.burst}s {p.ioRequestTime && <><br /><span style={{color: '#ff85c0'}}>⏳ I/O al tick {p.ioRequestTime}</span></>}</span>
                            </div>
                            <button className="delete-btn" onClick={() => deleteProcess(p.id)}>X</button>
                        </div>
                    ))}
                </div>
                <button onClick={addProcess} className="add-btn">+ ADD NEW PROCESS</button>
            </main>
        </div>
    );
};

export default ConfigView;