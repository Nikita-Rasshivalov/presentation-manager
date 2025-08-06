import React, { useState, useRef, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { SlideElement } from "../../types/types";

interface SlideElementItemProps {
  el: SlideElement;
  onUpdateContent: (id: string, content: string) => void;
  onDragStart: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    el: SlideElement
  ) => void;
  draggable: boolean;
  onDelete: (id: string) => void;
}

export const SlideElementItem: React.FC<SlideElementItemProps> = ({
  el,
  onUpdateContent,
  onDragStart,
  draggable,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!draggable) return;

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;

    onDragStart(e, el);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!dragStartPos.current) return;

    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);

    if (dx > 5 || dy > 5) {
      dragged.current = true;
    }
  };

  const handleMouseUp = () => {
    dragStartPos.current = null;
    dragged.current = false;
  };

  const handleDoubleClick = () => {
    if (!dragged.current) {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        isEditing &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isEditing]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: el.x,
        top: el.y,
        maxWidth: 600,
        cursor: draggable ? "grab" : "default",
        backgroundColor: "#f9fafb",
        borderRadius: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)",
        padding: 8,
        zIndex: 10,
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      data-color-mode="light"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(el.id);
        }}
        title="Delete element"
        style={{
          position: "absolute",
          top: -4,
          right: 2,
          background: "transparent",
          border: "none",
          color: "#6b7280",
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer",
          padding: "0 6px",
          lineHeight: 1,
          userSelect: "none",
          borderRadius: 4,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        ×
      </button>

      {isEditing ? (
        <>
          <MDEditor
            value={el.content}
            onChange={(val = "") => onUpdateContent(el.id, val)}
            height={200}
            visiableDragbar={false}
            preview="edit"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
            className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Switch to View Mode
          </button>
        </>
      ) : (
        <div style={{ cursor: "pointer" }}>
          <MDEditor.Markdown source={el.content} />
          <small className="text-gray-500">Double-click to edit</small>
        </div>
      )}
    </div>
  );
};
