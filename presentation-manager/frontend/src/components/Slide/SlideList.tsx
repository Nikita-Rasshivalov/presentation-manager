import React from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { UserRole } from "../../types/types";

interface SlideListProps {
  slides: any[];
  currentSlideIndex: number;
  role: string;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onRemoveSlide: (slideId: string) => void;
  addingSlide?: boolean;
  removingSlide?: boolean;
}

export const SlideList: React.FC<SlideListProps> = ({
  slides,
  currentSlideIndex,
  role,
  onSelectSlide,
  onAddSlide,
  onRemoveSlide,
  addingSlide = false,
  removingSlide = false,
}) => {
  return (
    <aside className="w-1/4 rounded-lg border border-gray-300 bg-gray-50 flex flex-col">
      <div className="p-4 font-semibold border-b flex justify-between items-center bg-gray-50">
        <span className="text-gray-700 tracking-wide">Slides</span>
        {role === UserRole.CREATOR && (
          <button
            onClick={onAddSlide}
            title="Add slide"
            disabled={addingSlide || removingSlide}
            className={`p-1 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 ${
              addingSlide || removingSlide
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <PlusIcon className="h-6 w-6 text-green-600" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto bg-white max-h-[calc(100vh-100px)]">
        {slides.length === 0 && (
          <div className="p-4 text-center text-gray-400">
            No slides available
          </div>
        )}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            onClick={() => onSelectSlide(idx)}
            className={`p-3 flex justify-between items-center cursor-pointer border-b border-gray-100 transition-colors duration-150 ${
              idx === currentSlideIndex
                ? "bg-blue-100 font-semibold text-blue-800"
                : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <span className="truncate">Slide {idx + 1}</span>
            {role === UserRole.CREATOR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!removingSlide && !addingSlide) {
                    onRemoveSlide(slide.id);
                  }
                }}
                title="Remove slide"
                disabled={removingSlide || addingSlide}
                className={`p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 ${
                  removingSlide || addingSlide
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <TrashIcon className="h-5 w-5 text-red-600" />
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};
