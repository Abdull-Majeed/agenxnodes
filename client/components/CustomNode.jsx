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

  const statusClass =
    status === 'running'
      ? 'node-running-border'
      : status === 'success'
        ? 'node-success-border'
        : status === 'error'
          ? 'node-error-border'
          : '';

  return (
    <div
      className={`group relative rounded-2xl border border-white/60 bg-white/90 shadow-soft transition ${statusClass} ${selected ? 'ring-2 ring-indigo-500/70' : ''} ${data.type === 'aiAgent' ? 'min-w-[280px]' : 'min-w-[220px]'}`}
      style={{ borderColor: status === 'idle' ? def.color : undefined }}
    >
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
        <div className="mt-1 flex items-center gap-1.5 text-[11px]">
          {status === 'running' && (
            <>
              <div className="h-2 w-2 animate-spin rounded-full border border-orange-400 border-t-orange-600" />
              <span className="font-medium text-orange-600">Running...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500">
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-medium text-green-600">Done</span>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500">
                <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <span className="font-medium text-red-600">Error</span>
            </>
          )}
          {status === 'idle' && (
            <span className="text-slate-400">Idle</span>
          )}
        </div>
      </div>

      {status === 'running' && (
        <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-orange-300 border-t-orange-600" />
      )}
      {status === 'success' && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow-sm">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-sm">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
      )}

      {data.type !== 'webhook' && data.type !== 'manual' && data.type !== 'formTrigger' && data.type !== 'schedule' && data.type !== 'emailTrigger' && data.type !== 'apiPolling' && data.type !== 'chatTrigger' && data.type !== 'databaseTrigger' && (
        <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-2 !border-white !bg-slate-700" />
      )}

      {data.type === 'aiAgent' ? (
        <>
          {/* Main output handle on the right */}
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            className="!h-3 !w-3 !border-2 !border-white !bg-slate-700"
          />
          {/* Three bottom handles: Chat Model, Memory, Tool */}
          <div className="flex items-center justify-around border-t border-slate-100 px-2 pb-1 pt-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-semibold text-purple-600">Chat Model*</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-semibold text-blue-600">Memory</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-semibold text-indigo-600">Tool</span>
            </div>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="chatModel"
            className="!h-3 !w-3 !border-2 !border-white !bg-purple-500"
            style={{ left: '20%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="memory"
            className="!h-3 !w-3 !border-2 !border-white !bg-blue-500"
            style={{ left: '50%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="tool"
            className="!h-3 !w-3 !border-2 !border-white !bg-indigo-500"
            style={{ left: '80%' }}
          />
        </>
      ) : data.type === 'condition' ? (
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
