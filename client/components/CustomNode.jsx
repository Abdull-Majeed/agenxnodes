import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { NODE_DEFINITIONS } from '../constants/nodes';
import NodeIcon from './NodeIcon';

const CustomNode = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const def = NODE_DEFINITIONS[data.type] || NODE_DEFINITIONS.manual;
  const status = data.status || 'idle';

  const deleteNode = (e) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  const statusRing =
    status === 'running'
      ? 'ring-2 ring-indigo-400/60'
      : status === 'success'
        ? 'ring-2 ring-emerald-400/60'
        : status === 'error'
          ? 'ring-2 ring-rose-400/60'
          : 'ring-1 ring-slate-200/70';

  return (
    <div
      className={`group relative min-w-[220px] rounded-2xl border border-white/60 bg-white/90 shadow-soft transition ${statusRing} ${selected ? 'ring-indigo-500/70' : ''}`}
      style={{ borderColor: def.color }}
    >
      {status === 'running' && (
        <div className="pointer-events-none absolute -inset-1 rounded-2xl border border-indigo-400/40 animate-pulse" />
      )}

      <div className="flex items-center gap-2 rounded-t-2xl px-3 py-2 text-white" style={{ background: def.color }}>
        <NodeIcon name={def.icon} className="h-4 w-4 text-white" />
        <div className="flex-1 text-xs font-semibold uppercase tracking-wide opacity-90">{def.label}</div>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-[10px] font-bold text-white opacity-0 transition hover:bg-white/30 group-hover:opacity-100"
          onClick={deleteNode}
          title="Delete Node"
        >
          X
        </button>
      </div>

      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-slate-900">{data.label}</div>
        <div className="mt-1 text-[11px] text-slate-500">Status: {status}</div>
      </div>

      {status === 'running' && (
        <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {status === 'success' && (
        <div className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
          +
        </div>
      )}
      {status === 'error' && (
        <div className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
          !
        </div>
      )}

      {data.type !== 'webhook' && data.type !== 'manual' && data.type !== 'formTrigger' && (
        <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-2 !border-white !bg-slate-700" />
      )}

      {data.type === 'condition' ? (
        <>
          <div className="absolute -bottom-5 left-[22%] text-[10px] font-semibold text-emerald-600">True</div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!h-3 !w-3 !border-2 !border-white !bg-emerald-500"
            style={{ left: '30%' }}
          />
          <div className="absolute -bottom-5 left-[63%] text-[10px] font-semibold text-rose-600">False</div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!h-3 !w-3 !border-2 !border-white !bg-rose-500"
            style={{ left: '70%' }}
          />
        </>
      ) : (
        <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border-2 !border-white !bg-slate-700" />
      )}
    </div>
  );
};

export default CustomNode;
