// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/electron-vite.animate.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://electron-vite.github.io" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App



import { useState } from "react";

export default function App() {
  const [status, setStatus] = useState<string>("Idle");
  const [title, setTitle] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");

  async function testExtract() {
    setStatus("Extracting...");
    try {
      // Minimal HTML test (you can paste real HTML later)
      const html = `
        <html><head><title>Test</title></head>
        <body>
          <h1>Hello Reader</h1>
          <p>This is a simple test page for Acuity Reader extraction.</p>
        </body></html>
      `;

      const article = await window.acuity.reader.extractFromHtml(html);
      setTitle(article.title);
      setExcerpt(article.excerpt ?? "");
      setStatus("OK");
    } catch (e: any) {
      setStatus(`ERROR: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h2>Acuity Reader — IPC Test</h2>
      <button onClick={testExtract}>Run extraction</button>
      <p><b>Status:</b> {status}</p>
      {title && <p><b>Title:</b> {title}</p>}
      {excerpt && <p><b>Excerpt:</b> {excerpt}</p>}
    </div>
  );
}

