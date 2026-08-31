"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import { useDocumentStore } from "@/store/useDocumentStore";
import "@xyflow/react/dist/style.css";

// 1. Move nodeTypes definition outside the component to completely fix the performance warnings and rendering lag.
const nodeTypes = {
  custom: ({ id, data, heading }) => {
    // We pass custom handlers down or look them up in global state if necessary,
    // but we can look up hover state locally via standard React pointer/touch interactions.
    const [isLocalHovered, setIsLocalHovered] = useState(false);
    const isRoot = id.startsWith("root-");

    return (
      <div
        onMouseEnter={() => setIsLocalHovered(true)}
        onMouseLeave={() => setIsLocalHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsLocalHovered((prev) => !prev);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setIsLocalHovered((prev) => !prev);
        }}
        className="select-none text-left flex flex-col justify-center font-sans relative transition-all duration-300 ease-out"
        style={{
          width: isLocalHovered && data.description ? 260 : 180,
          minHeight: isLocalHovered && data.description ? 110 : 46,
          borderRadius: "20px",
          padding: isLocalHovered && data.description ? "14px" : "12px",
          transform: isLocalHovered
            ? "scale(1.06) translateY(-4px)"
            : "scale(1)",
          background: isRoot ? "#0f172a" : "#ffffff",
          border: "2px solid transparent",
          borderImage: isLocalHovered
            ? "linear-gradient(to right, #e11d48, #f97316) 1"
            : "linear-gradient(to right, #cbd5e1, #e2e8f0) 1",
          boxShadow: isLocalHovered
            ? "0 25px 35px -10px rgba(225, 29, 72, 0.25), 0 12px 20px -5px rgba(249, 115, 22, 0.15)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
          zIndex: isLocalHovered ? 99999 : 10,
          willChange: "transform, width, min-height",
          cursor: "grab",
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ opacity: 0, pointerEvents: "none" }}
        />

        <div
          className={`font-black tracking-tight leading-snug transition-colors duration-300 ${isRoot ? "text-xs uppercase text-rose-400" : "text-[11px] text-slate-800"}`}
        >
          {data.label}
        </div>

        {isLocalHovered && data.description && (
          <div
            className={`text-[10px] leading-relaxed font-medium mt-2 pt-2 border-t overflow-hidden ${
              isRoot
                ? "text-slate-300 border-white/10"
                : "text-slate-500 border-slate-100"
            }`}
            style={{
              animation:
                "fadeInExpand 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {data.description}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0, pointerEvents: "none" }}
        />
      </div>
    );
  },
};

export default function KnowledgeTreeModal() {
  const { activeTreeData, isTreeModalOpen, closeTreeModal } = useDocumentStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const initialDataMap = useMemo(() => {
    if (!activeTreeData) return { nodes: [], edges: [], parentToChildren: {} };

    const nodesList = [];
    const edgesList = [];
    const parentToChildren = {};

    const startX = 600;
    const startY = 60;
    const levelHeight = 180;
    const nodeWidthGap = 260;

    const rootId = `root-${activeTreeData.name.replace(/\s+/g, "-")}`;
    const childrenList = activeTreeData.children || [];

    let totalSubNodesCount = 0;
    childrenList.forEach((child) => {
      totalSubNodesCount +=
        child.children && child.children.length > 0 ? child.children.length : 1;
    });

    const treeTotalWidth =
      Math.max(childrenList.length, totalSubNodesCount) * nodeWidthGap;
    let leftmostX = startX - treeTotalWidth / 2;

    parentToChildren[rootId] = [];

    nodesList.push({
      id: rootId,
      data: {
        label: activeTreeData.name,
        description: activeTreeData.description || "Central Hub",
      },
      position: { x: startX - 90, y: startY },
      type: "custom",
    });

    let currentChildGroupX = leftmostX;

    childrenList.forEach((child, index) => {
      const childId = `child-${index}-${child.name.replace(/\s+/g, "-")}`;
      const subChildren = child.children || [];

      const childGroupWidth = Math.max(1, subChildren.length) * nodeWidthGap;
      const childX =
        childGroupWidth === nodeWidthGap
          ? currentChildGroupX + nodeWidthGap / 2 - 90
          : currentChildGroupX + childGroupWidth / 2 - 90;
      const childY = startY + levelHeight;

      parentToChildren[rootId].push(childId);
      parentToChildren[childId] = [];

      nodesList.push({
        id: childId,
        data: {
          label: child.name,
          description: child.description,
        },
        position: { x: childX, y: childY },
        type: "custom",
      });

      // 2. Updated edge connection types from 'smoothstep' to horizontal flowing Bezier curves ('default')
      edgesList.push({
        id: `edge-${rootId}-${childId}`,
        source: rootId,
        target: childId,
        type: "default",
        animated: true,
        style: {
          stroke: "url(#edge-gradient)",
          strokeWidth: 3,
          filter: "drop-shadow(0px 2px 6px rgba(225, 29, 72, 0.3))",
        },
      });

      subChildren.forEach((sub, subIdx) => {
        const subId = `sub-${index}-${subIdx}-${sub.name.replace(/\s+/g, "-")}`;
        const subX =
          currentChildGroupX + subIdx * nodeWidthGap + nodeWidthGap / 2 - 90;
        const subY = childY + levelHeight;

        parentToChildren[rootId].push(subId);
        parentToChildren[childId].push(subId);

        nodesList.push({
          id: subId,
          data: {
            label: sub.name,
            description: sub.description,
          },
          position: { x: subX, y: subY },
          type: "custom",
        });

        // 3. Updated sub-nested edge line connections from 'smoothstep' to flowing Bezier curves ('default')
        edgesList.push({
          id: `edge-${childId}-${subId}`,
          source: childId,
          target: subId,
          type: "default",
          style: {
            stroke: "url(#edge-gradient-sub)",
            strokeWidth: 2,
            filter: "drop-shadow(0px 1px 4px rgba(249, 115, 22, 0.15))",
          },
        });
      });

      currentChildGroupX += childGroupWidth;
    });

    return { nodes: nodesList, edges: edgesList, parentToChildren };
  }, [activeTreeData]);

  useEffect(() => {
    if (isTreeModalOpen && activeTreeData) {
      setNodes(initialDataMap.nodes);
      setEdges(initialDataMap.edges);
    }
  }, [initialDataMap, isTreeModalOpen, activeTreeData, setNodes, setEdges]);

  const onNodeDrag = (event, node, draggedNodes) => {
    const descendants = initialDataMap.parentToChildren[node.id];
    if (!descendants || descendants.length === 0) return;

    const targetNode = draggedNodes.find((n) => n.id === node.id);
    if (!targetNode) return;

    const deltaX = targetNode.position.x - node.position.x;
    const deltaY = targetNode.position.y - node.position.y;

    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (descendants.includes(n.id)) {
          return {
            ...n,
            position: {
              x: n.position.x + deltaX,
              y: n.position.y + deltaY,
            },
          };
        }
        return n;
      }),
    );
  };

  if (!isTreeModalOpen || !activeTreeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white border border-slate-200 w-[94vw] h-[90vh] max-w-7xl rounded-3xl p-4 lg:p-6 relative flex flex-col shadow-2xl">
        <button
          onClick={closeTreeModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-50 rounded-xl transition-all z-50 cursor-pointer border border-transparent hover:border-slate-100"
        >
          <X size={18} />
        </button>

        <div className="mb-4 shrink-0 pr-10">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Sparkles size={16} className="text-rose-500" />
            Knowledge Map
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {activeTreeData.name || "Overview"}
          </p>
        </div>

        <div className="flex-1 w-full h-full bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200/60 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDrag={onNodeDrag}
            nodesConnectable={false}
            nodesDraggable={true}
            elementsSelectable={true}
            zoomOnDoubleClick={false}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
          >
            <Background
              color="#cbd5e1"
              gap={30}
              size={1}
              variant="lines"
              className="opacity-35"
            />
            <Controls className="bg-white border border-slate-200 shadow-xl text-slate-600 rounded-xl overflow-hidden [&_button]:border-b [&_button]:border-slate-100 last:[&_button]:border-0" />

            <svg className="absolute w-0 h-0">
              <defs>
                <linearGradient
                  id="edge-gradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient
                  id="edge-gradient-sub"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fba8a8" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
          </ReactFlow>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInExpand {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .react-flow__node {
          cursor: grab;
        }
        .react-flow__node:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}
