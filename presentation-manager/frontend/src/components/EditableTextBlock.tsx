import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import ReactMarkdown from "react-markdown";
import { SlideElement } from "../types/types";
import { toast } from "react-toastify";

interface EditableTextBlockProps {
  element: SlideElement;
  isEditable: boolean;
  onUpdateContent: (id: string, content: string) => Promise<void>;
  onUpdatePosition: (id: string, x: number, y: number) => void;
}

export const EditableTextBlock: React.FC<EditableTextBlockProps> = ({
  element,
  isEditable,
  onUpdateContent,
  onUpdatePosition,
}) => {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(element.content);

  useEffect(() => {
    setContent(element.content);
  }, [element.content]);

  const handleBlur = async () => {
    setEditing(false);
    if (content !== element.content) {
      try {
        await onUpdateContent(element.id, content);
        toast.success("Content saved");
      } catch {
        toast.error("Failed to save content");
      }
    }
  };

  return (
    <Draggable
      bounds="parent"
      position={{ x: element.x, y: element.y }}
      onStop={(_, data) => onUpdatePosition(element.id, data.x, data.y)}
      disabled={!isEditable}
    >
      <div
        className={`p-3 rounded-lg shadow-md max-w-xs bg-white border ${
          isEditable
            ? "cursor-move hover:ring-2 hover:ring-indigo-400"
            : "cursor-default"
        } transition focus-within:ring-2 focus-within:ring-indigo-500`}
        onDoubleClick={() => isEditable && setEditing(true)}
        tabIndex={isEditable ? 0 : -1}
        role={isEditable ? "button" : undefined}
        aria-label={isEditable ? "Double click to edit text block" : undefined}
      >
        {editing && isEditable ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            className="w-full h-32 resize-none border border-gray-300 rounded-md p-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        ) : (
          <div className="prose prose-indigo break-words whitespace-pre-wrap select-text pointer-events-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </Draggable>
  );
};
