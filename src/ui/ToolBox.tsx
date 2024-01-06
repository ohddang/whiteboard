const ToolBox = () => {
  return (
    <>
      <div>
        <ul className="fixed top-6 left-48 flex flex-row gap-6 bg-gray-500/25 w-max p-3 [&>li]:bg-sky-500/80 [&>li]:text-white [&>li]:font-bold [&>li]:text-xl [&>li]:rounded-lg [&>li>button]:w-20 [&>li>button]:h-10">
          <li>
            <button>그립</button>
          </li>
          <li>
            <button>마우스</button>
          </li>
          <li>
            <button>붓</button>
          </li>
          <li>
            <button>네모</button>
          </li>
          <li>
            <button>선</button>
          </li>
          <li>
            <button>텍스트</button>
          </li>
          <li>
            <button>7</button>
          </li>
          <li>
            <button>8</button>
          </li>
          <li>
            <button>9</button>
          </li>
          <li>
            <button>10</button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ToolBox;
