import React from "react";

import ToolBox from "./ui/ToolBox";
import ToolBoxDetail from "./ui/ToolBoxDetail";
import Board from "./components/Board";

function App() {
  return (
    <>
      <div className="fixed top-24">
        <p className="text-4xl text-blue-600/100">The quick brown fox...</p>
        <p className="text-3xl text-blue-600/75">The quick brown fox...</p>
        <p className="text-2xl text-blue-600/50">The quick brown fox...</p>
        <p className="text-2xl text-blue-600/25">The quick brown fox...</p>
        <p className="text-xl text-blue-600/10">The quick brown fox...</p>
      </div>
      <ToolBox />
      <ToolBoxDetail />
      <Board />
    </>
  );
}

export default App;
