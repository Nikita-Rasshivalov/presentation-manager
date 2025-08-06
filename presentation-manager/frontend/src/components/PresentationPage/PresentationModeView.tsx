import React from "react";
import { Slide } from "../../types/types";
import ReactMarkdown from "react-markdown";

interface PresentationModeViewProps {
  slides: Slide[];
  onExit: () => void;
}

export const PresentationModeView: React.FC<PresentationModeViewProps> = ({
  slides,
  onExit,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900 text-white overflow-y-auto p-12 space-y-20 font-sans">
      {slides.map((slide, idx) => (
        <section
          key={slide.id}
          className="relative w-full max-w-5xl mx-auto h-[800px] border border-gray-600 rounded-xl bg-gray-800 shadow-lg overflow-hidden"
          aria-label={`Slide ${idx + 1}`}
        >
          {slide.elements.map((el) => (
            <div
              key={el.id}
              style={{
                left: el.posX ?? el.posX ?? 0,
                top: el.posY ?? el.posY ?? 0,
                maxWidth: 600,
              }}
              className="absolute text-black p-3 bg-white bg-opacity-15 rounded-lg shadow-md select-none break-words text-2xl font-light leading-snug backdrop-blur-sm"
            >
              {el.content ? (
                <ReactMarkdown>{el.content}</ReactMarkdown>
              ) : (
                <em className="text-black">No content</em>
              )}
            </div>
          ))}
          <div className="absolute bottom-3 right-3 text-gray-400 text-sm select-none">
            Slide {idx + 1}
          </div>
        </section>
      ))}

      <button
        onClick={onExit}
        aria-label="Exit presentation mode"
        className="fixed top-6 right-6 bg-white text-gray-900 px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
      >
        Exit Presentation
      </button>
    </div>
  );
};
