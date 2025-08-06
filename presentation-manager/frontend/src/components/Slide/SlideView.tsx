import React from "react";
import { SlideElementItem } from "./SlideElementItem";
import { SlideElement, UserRole } from "../../types/types";

interface SlideViewProps {
  slideElements: SlideElement[];
  role: UserRole | null | undefined;
  onUpdateContent: (id: string, content: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onAddTextBlock: () => void;
  onDeleteElement: (id: string) => void;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slideElements = [],
  role,
  onUpdateContent,
  onUpdatePosition,
  onAddTextBlock,
  onDeleteElement,
}) => {
  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    el: SlideElement
  ) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = el.posX ?? 0;
    const initialY = el.posY ?? 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newX = initialX + deltaX;
      const newY = initialY + deltaY;

      onUpdatePosition(el.id, newX, newY);
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative flex-1 p-6 bg-white rounded-2xl shadow-inner border border-gray-200 overflow-hidden h-full">
      {slideElements.map((el) => (
        <SlideElementItem
          key={el.id}
          el={el}
          onUpdateContent={onUpdateContent}
          onDragStart={handleDragStart}
          draggable={role === UserRole.CREATOR || role === UserRole.EDITOR}
          onDelete={onDeleteElement}
          isViewer={role === UserRole.VIEWER}
        />
      ))}

      {role !== UserRole.VIEWER && (
        <button
          onClick={onAddTextBlock}
          className="absolute bottom-4 left-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
        >
          Add Text Block
        </button>
      )}
    </div>
  );
};
