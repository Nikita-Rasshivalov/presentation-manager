import React from "react";
import ReactMarkdown from "react-markdown";
import { Slide } from "../../types/types";

interface PresentationModeViewProps {
  slide: Slide;
  onExit: () => void;
}

export const PresentationModeView: React.FC<PresentationModeViewProps> = ({
  slide,
  onExit,
}) => {
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center relative font-sans">
      {slide.elements.map((el: any) => (
        <div
          key={el.id}
          style={{ left: el.x, top: el.y, maxWidth: 600 }}
          className="absolute p-1.5 bg-white bg-opacity-10 rounded-lg shadow-lg select-none break-words text-3xl font-light leading-snug"
        >
          <ReactMarkdown>{el.content}</ReactMarkdown>
        </div>
      ))}

      <button
        onClick={onExit}
        aria-label="Exit presentation mode"
        className="absolute top-6 right-6 bg-white text-black px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
      >
        Exit Presentation
      </button>
    </div>
  );
};
