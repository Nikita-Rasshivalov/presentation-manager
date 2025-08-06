import React from "react";
import ReactMarkdown from "react-markdown";
import { SlideElement, UserRole } from "../../types/types";

interface SlideViewProps {
  slideElements: SlideElement[];
  role: UserRole;
  onUpdateContent: (id: string, content: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onAddTextBlock: () => void;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slideElements,
  role,
  onUpdateContent,
  onUpdatePosition,
  onAddTextBlock,
}) => {
  return (
    <div className="relative w-full h-full bg-gray-50 p-4">
      {slideElements.map((element) => (
        <div
          key={element.id}
          style={{ left: element.x, top: element.y }}
          className="absolute p-2 bg-white rounded shadow-md"
          draggable={role === UserRole.CREATOR || role === UserRole.EDITOR}
          onDragEnd={(e) => {
            if (role === UserRole.CREATOR || role === UserRole.EDITOR) {
              onUpdatePosition(element.id, e.clientX, e.clientY);
            }
          }}
        >
          {role === UserRole.CREATOR || role === UserRole.EDITOR ? (
            <textarea
              value={element.content}
              onChange={(e) => onUpdateContent(element.id, e.target.value)}
              className="w-full h-full resize-none border-none outline-none bg-transparent"
            />
          ) : (
            <ReactMarkdown>{element.content}</ReactMarkdown>
          )}
        </div>
      ))}
      {(role === UserRole.CREATOR || role === UserRole.EDITOR) && (
        <button
          onClick={onAddTextBlock}
          className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          aria-label="Add text block"
        >
          Add text
        </button>
      )}
    </div>
  );
};
