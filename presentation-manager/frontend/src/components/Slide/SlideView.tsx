import React, { useState, useEffect } from "react";
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
  const [elements, setElements] = useState<SlideElement[]>(slideElements);

  useEffect(() => {
    // Сравниваем массивы по длине и id элементов, чтобы обновлять стейт только если данные реально изменились
    const areArraysEqual =
      elements.length === slideElements.length &&
      elements.every((el, i) => el.id === slideElements[i].id);

    if (!areArraysEqual) {
      setElements(slideElements);
    }
  }, [slideElements, elements]);

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    el: SlideElement
  ) => {
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      onUpdatePosition(el.id, el.x + deltaX, el.y + deltaY);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative flex-1 p-6 bg-white rounded-2xl shadow-inner border border-gray-200 overflow-hidden select-none h-full">
      {elements.map((el) => (
        <SlideElementItem
          key={el.id}
          el={el}
          onUpdateContent={onUpdateContent}
          onDragStart={handleDragStart}
          draggable={role === UserRole.CREATOR || role === UserRole.EDITOR}
          onDelete={onDeleteElement}
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
