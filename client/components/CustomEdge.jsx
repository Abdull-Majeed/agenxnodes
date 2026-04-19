import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from 'reactflow';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  const onEdgeClick = (evt) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          className="pointer-events-auto"
        >
          <button
            type="button"
            onClick={onEdgeClick}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-slate-900 text-xs font-semibold text-white shadow-soft transition hover:scale-105"
            aria-label="Delete edge"
          >
            X
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
