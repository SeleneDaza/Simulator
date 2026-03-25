import React, { useState } from 'react';
import './ConfigView.css';

const robotImage = '/Captura_de_pantalla_2026-03-24_215933-removebg-preview.png';

const ConfigView = ({ processes, setProcesses, quantum, setQuantum, onStart }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmData, setConfirmData] = useState({ title: '', message: '', confirmText: 'Aceptar', cancelText: 'Cancelar', onConfirm: null });
    const [infoPage, setInfoPage] = useState(0);
    const [formData, setFormData] = useState({
        id: '',
        arrival: 0,
        burst: 5,
        ioRequestTime: ''
    });

    const openModal = () => {
        setFormData({
            id: `P${processes.length + 1}`,
            arrival: 0,
            burst: 5,
            ioRequestTime: ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const openInfoModal = () => {
        setIsInfoModalOpen(true);
    };

    const closeInfoModal = () => {
        setIsInfoModalOpen(false);
        setInfoPage(0);
    };

    const openConfirmModal = ({ title, message, confirmText = 'Aceptar', cancelText = 'Cancelar', onConfirm }) => {
        setConfirmData({ title, message, confirmText, cancelText, onConfirm });
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setConfirmData({ title: '', message: '', confirmText: 'Aceptar', cancelText: 'Cancelar', onConfirm: null });
    };

    const requestDeleteProcess = (id) => {
        openConfirmModal({
            title: 'Confirmar eliminación',
            message: `¿Estás seguro de eliminar el proceso ${id}?`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                setProcesses((oldProcesses) => oldProcesses.filter(p => p.id !== id));
                closeConfirmModal();
            }
        });
    };

    const handleStart = () => {
        if (processes.length === 0) {
            openConfirmModal({
                title: 'No has agregado procesos',
                message: 'Agrega al menos un proceso antes de iniciar la simulación.',
                confirmText: 'Entendido',
                cancelText: 'Cerrar',
                onConfirm: closeConfirmModal
            });
            return;
        }

        onStart();
    };

    const nextInfoPage = () => {
        setInfoPage(prev => Math.min(prev + 1, 1));
    };

    const prevInfoPage = () => {
        setInfoPage(prev => Math.max(prev - 1, 0));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const name = formData.id.trim();
        const arrival = parseInt(formData.arrival, 10);
        const burst = parseInt(formData.burst, 10);

        if (!name) return alert("El nombre es requerido");
        if (isNaN(arrival) || arrival < 0) return alert("Arrival inválido. Debe ser 0 o mayor.");
        if (isNaN(burst) || burst <= 0) return alert("Burst inválido. Debe ser mayor a 0.");

        let ioRequestTime = null;
        if (formData.ioRequestTime !== "") {
            ioRequestTime = parseInt(formData.ioRequestTime, 10);
            if (isNaN(ioRequestTime) || ioRequestTime <= 0 || ioRequestTime >= burst) {
                return alert(`I/O inválido. Debe ser un número entre 1 y ${burst - 1}`);
            }
        }

        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        setProcesses([...processes, { id: name, arrival, burst, ioRequestTime, color: randomColor }]);
        closeModal();
    };

    const deleteProcess = (id) => {
        setProcesses(processes.filter(p => p.id !== id));
    };

    const addRandomProcess = () => {
        const randomId = `P${processes.length + 1}`;
        const randomArrival = Math.floor(Math.random() * 15);
        const randomBurst = Math.floor(Math.random() * 10) + 2;
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

        let ioRequestTime = null;
        if (Math.random() < 0.3 && randomBurst > 2) {
            ioRequestTime = Math.floor(Math.random() * (randomBurst - 2)) + 1;
        }
        setProcesses([...processes, { id: randomId, arrival: randomArrival, burst: randomBurst, ioRequestTime, color: randomColor }]);
    };

    return (
        <div className="layout-wrapper">
            <aside className="sidebar config-sidebar">
                <div className="robot-container">
                    <div className="robot-placeholder">
                        <img
                          src={robotImage}
                          alt="Robot"
                          className="robot-img"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Ctext x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2236%22 fill=%22%23f3f4f6%22%3E🤖%3C/text%3E%3C/svg%3E'; }}
                        />
                    </div>
                </div>
                <h1 className="title">VRR <span>vs</span> MLFQ <span>vs</span> SRTF</h1>
                <p className="config-subtitle">SIMULATOR</p>
                <button onClick={openInfoModal} className="info-btn" title="Información">!</button>

                <div className="controls">
                    <div className="quantum">
                        <label>QUANTUM</label>
                        <input type="number" value={quantum} onChange={(e) => setQuantum(parseInt(e.target.value) || 1)} className="custom-input" />
                    </div>
                    <div className='btn-group'>
                        <button onClick={addRandomProcess} className="btn-secondary">GENERATE RANDOM</button>
                        <button onClick={handleStart} className="btn-primary">START SIMULATION</button>
                    </div>
                </div>
            </aside>

            <main className="process-panel">
                <h2>Processes</h2>
                <div className="process-grid">
                    {processes.map((p, index) => (
                        <div key={p.id} className="process-card process-item" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="color-box" style={{ backgroundColor: p.color }}></div>
                            <div className="process-info">
                                <strong className="process-name">{p.id}</strong>
                                <span className="process-details">
                                    Arr: {p.arrival}s | Burst: {p.burst}s
                                    {p.ioRequestTime && <><br /><span className="process-details io">⏳ I/O at tick {p.ioRequestTime}</span></>}
                                </span>
                            </div>

                            <button
                                onClick={() => requestDeleteProcess(p.id)}
                                className="delete-process-btn"
                                title="Eliminar proceso"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={openModal} className="add-btn add-process-btn">+ ADD NEW PROCESS</button>
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Create New Process</h3>

                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Process's name:</label>
                                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Arrival:</label>
                                    <input type="number" min="0" value={formData.arrival} onChange={e => setFormData({...formData, arrival: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Burst:</label>
                                    <input type="number" min="1" value={formData.burst} onChange={e => setFormData({...formData, burst: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-group io-input">
                                <label>I/O (Optional):</label>
                                <input type="number" min="1" value={formData.ioRequestTime} onChange={e => setFormData({...formData, ioRequestTime: e.target.value})} placeholder="Ex. 2" />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isInfoModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content info-modal">
                        <h3 className="modal-title">Información del Simulador</h3>
                        <div className="info-content">
                            {infoPage === 0 && (
                                <>
                                    <h4>Página 1: Conceptos Básicos</h4>
                                    <p><strong>Proceso:</strong> Una unidad de trabajo que requiere tiempo de CPU para ejecutarse. Cada proceso tiene un tiempo de llegada, ráfaga y opcionalmente una solicitud de I/O.</p>
                                    <p><strong>Tiempo de Llegada (Arrival Time):</strong> Momento en que el proceso ingresa al sistema y está listo para ejecutarse.</p>
                                    <p><strong>Tiempo de Ráfaga (Burst Time):</strong> Tiempo total de CPU necesario para completar el proceso.</p>
                                    <p><strong>I/O:</strong> Punto en que el proceso se bloquea por entrada/salida.</p>
                                    <p><strong>Quantum:</strong> Límite de tiempo para VRR antes de pasar al siguiente proceso.</p>
                                </>
                            )}
                            {infoPage === 1 && (
                                <>
                                    <h4>Página 2: Algoritmos</h4>
                                    <p><strong>Virtual Round Robin (VRR):</strong> Cada proceso recibe un quantum fijo. Si no termina, vuelve a la cola, permitiendo compartir CPU equitativamente.</p>
                                    <p><strong>Shortest Remaining Time First (SRTF):</strong> Ejecuta siempre el proceso con menor tiempo restante.</p>
                                    <p><strong>Multi-Level Feedback Queue (MLFQ):</strong> Tres colas de prioridad. Un proceso puede bajar de prioridad si consume mucho CPU, y subir si espera demasiado.</p>
                                    <p><strong>Mediciones clave:</strong> tiempo de espera, tiempo de respuesta, tiempo de retorno y utilización.</p>
                                </>
                            )}
                        </div>
                        <div className="modal-buttons">
                            {infoPage > 0 && (
                                <button onClick={prevInfoPage} className="btn-secondary">Anterior</button>
                            )}
                            {infoPage < 1 ? (
                                <button onClick={nextInfoPage} className="btn-primary">Siguiente</button>
                            ) : (
                                <button onClick={closeInfoModal} className="btn-submit">Cerrar</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isConfirmModalOpen && (
                <div className="modal-overlay" onClick={closeConfirmModal}>
                    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">{confirmData.title}</h3>
                        <p className="confirm-message">{confirmData.message}</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={closeConfirmModal}>{confirmData.cancelText}</button>
                            <button className="btn-submit" onClick={() => { confirmData.onConfirm && confirmData.onConfirm(); }}>{confirmData.confirmText}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigView;