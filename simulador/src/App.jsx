import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import mlfq from "./algorithms/mlfq";
import { Process } from "./models/Process";

function App() {

  const [result, setResult] = useState(null);

  const runMLFQ = () => {

    const processes = [

      new Process({
        pid: "P1",
        arrivalTime: 0,
        burstTime: 30
      }),

      new Process({
        pid: "P2",
        arrivalTime: 1,
        burstTime: 4
      }),

      new Process({
        pid: "P3",
        arrivalTime: 3,
        burstTime: 8
      }),

      new Process({
        pid: "P4",
        arrivalTime: 15,
        burstTime: 6
      }),

      new Process({
        pid: "P5",
        arrivalTime: 18,
        burstTime: 3
      })

    ];

    const res = mlfq(processes);

    setResult(res);
  };

  return (
      <>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" />
          </a>

          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" />
          </a>
        </div>

        <h1>MLFQ Simulator</h1>

        <div className="card">

          <button onClick={runMLFQ}>
            Ejecutar MLFQ
          </button>

        </div>

        {result && (

            <div>

              <h2>Timeline</h2>

              {result.timeline.map((t, i) => (

                  <div key={i}>

                    {t.pid} | {t.start} - {t.end} | Q{t.queue}

                  </div>

              ))}

              <h2>Stats</h2>

              <div>CPU: {result.stats.cpuUtilization}</div>
              <div>Throughput: {result.stats.throughput}</div>
              <div>Response: {result.stats.avgResponse}</div>
              <div>Turnaround: {result.stats.avgTurnaround}</div>
              <div>Waiting: {result.stats.avgWaiting}</div>

            </div>

        )}

      </>
  );
}

export default App;