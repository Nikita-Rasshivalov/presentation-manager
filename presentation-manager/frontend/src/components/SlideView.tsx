import React from "react";
import { SlideElement } from "../types/types";

interface SlideViewProps {
  slideElements: SlideElement[];
  role: string;
  onUpdateContent: (id: string, content: string) => void;
  onUpdatePosition?: (id: string, x: number, y: number) => void;
  onAddTextBlock: () => void;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slideElements = [],
  role,
  onUpdateContent,
  onAddTextBlock,
}) => {
  if (slideElements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-gray-500 bg-white rounded-2xl shadow-inner border border-gray-200">
        <p className="mb-4 text-lg select-none">
          No elements on this slide yet.
        </p>
        {role === "CREATOR" && (
          <button
            onClick={onAddTextBlock}
            className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Text Block
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-6 bg-white rounded-2xl shadow-inner border border-gray-200 overflow-hidden">
      {slideElements.map((el) => (
        <div
          key={el.id}
          style={{ position: "absolute", left: el.x, top: el.y, maxWidth: 600 }}
          className="bg-gray-50 rounded-md shadow-sm p-2"
        >
          <textarea
            value={el.content}
            onChange={(e) => onUpdateContent(el.id, e.target.value)}
            className="w-64 resize-none border border-gray-300 rounded-md p-2 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            rows={3}
          />
        </div>
      ))}
    </div>
  );
};
