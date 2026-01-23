import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { NODE_DEFINITIONS } from '../constants/nodes';

const CustomNode = ({ id, data }) => {
    const { setNodes } = useReactFlow();
    // Fallback to manual if type not found
    const def = NODE_DEFINITIONS[data.type] || NODE_DEFINITIONS.manual;

    const deleteNode = (e) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
    };

    return (
        <div className={`custom-node ${data.status || ''}`} style={{ borderColor: data.selected ? '#333' : def.color }}>
            <div className="node-header" style={{ background: def.color }}>
                <div className="node-icon">{def.icon}</div>
                <div className="node-header-text">{def.label}</div>
                <button className="node-delete-btn" onClick={deleteNode} title="Delete Node">🗑️</button>
            </div>

            <div className="node-body">
                <div className="node-label-user">{data.label}</div>
            </div>

            {/* Status Indicators */}
            {data.status === 'running' && <div className="spinner"></div>}
            {data.status === 'success' && <div className="status-dot success">✔</div>}
            {data.status === 'error' && <div className="status-dot error">✖</div>}

            {/* Handles logic: Webhook/Manual have no input handle */}
            {data.type !== 'webhook' && data.type !== 'manual' && data.type !== 'formTrigger' && (
                <Handle type="target" position={Position.Top} className="handle-input" />
            )}

            {/* Conditional Handles vs Standard Handles */}
            {data.type === 'condition' ? (
                <>
                    <div className="label-true">True</div>
                    <Handle type="source" position={Position.Bottom} id="true" className="handle-true" />
                    <div className="label-false">False</div>
                    <Handle type="source" position={Position.Bottom} id="false" className="handle-false" />
                </>
            ) : (
                <Handle type="source" position={Position.Bottom} className="handle-default" />
            )}
        </div>
    );
};

export default CustomNode;