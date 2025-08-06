import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Slide, SlideElement, UserRole } from "../types/types";

export function useSlideActions(
  slide: Slide | null | undefined,
  role: UserRole | null | undefined,
  socket: Socket | null,
  updateSlideElements: (slideId: string, elements: SlideElement[]) => void
) {
  const [elements, setElements] = useState<SlideElement[]>(
    slide?.elements || []
  );

  useEffect(() => {
    setElements(slide?.elements || []);
  }, [slide?.elements]);

  const onUpdateContent = async (
    elementId: string,
    content: string
  ): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    const newElements = elements.map((el) =>
      el.id === elementId ? { ...el, content } : el
    );
    setElements(newElements);
    updateSlideElements(slide.id, newElements);

    const updatedElement = newElements.find((el) => el.id === elementId);
    if (!updatedElement) return;

    socket.emit("edit_element", {
      elementId: updatedElement.id,
      content: updatedElement.content,
      pos: {
        x: (updatedElement.x ?? updatedElement.x) || 0,
        y: (updatedElement.y ?? updatedElement.y) || 0,
      },
    });
  };

  const onUpdatePosition = async (
    elementId: string,
    x: number,
    y: number
  ): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    const newElements = elements.map((el) =>
      el.id === elementId ? { ...el, posX: x, posY: y, x, y } : el
    );
    setElements(newElements);
    updateSlideElements(slide.id, newElements);

    const updatedElement = newElements.find((el) => el.id === elementId);
    if (!updatedElement) return;

    socket.emit("edit_element", {
      elementId: updatedElement.id,
      content: updatedElement.content,
      pos: { x, y },
    });
  };

  const addTextBlock = async (): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    console.log("emit add_element");
    socket.emit("add_element", {
      slideId: slide.id,
      content: "",
      pos: { x: 20, y: 20 },
      size: { width: 200, height: 100 },
    });
  };

  const onDeleteElement = async (elementId: string): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    const newElements = elements.filter((el) => el.id !== elementId);
    setElements(newElements);
    updateSlideElements(slide.id, newElements);

    socket.emit("delete_element", {
      slideId: slide.id,
      elementId,
    });
  };

  useEffect(() => {
    if (!socket || !slide) return;

    const handleElementAdded = (element: SlideElement) => {
      setElements((prev) => {
        if (prev.find((el) => el.id === element.id)) return prev;
        const newElements = [...prev, element];
        updateSlideElements(slide.id, newElements);
        return newElements;
      });
    };

    const handleElementUpdated = (element: SlideElement) => {
      setElements((prev) => {
        const newElements = prev.map((el) =>
          el.id === element.id ? element : el
        );
        updateSlideElements(slide.id, newElements);
        return newElements;
      });
    };

    const handleElementDeleted = ({ elementId }: { elementId: string }) => {
      setElements((prev) => {
        const newElements = prev.filter((el) => el.id !== elementId);
        updateSlideElements(slide.id, newElements);
        return newElements;
      });
    };

    socket.on("element_added", handleElementAdded);
    socket.on("element_updated", handleElementUpdated);
    socket.on("element_deleted", handleElementDeleted);

    return () => {
      socket.off("element_added", handleElementAdded);
      socket.off("element_updated", handleElementUpdated);
      socket.off("element_deleted", handleElementDeleted);
    };
  }, [socket, slide?.id, updateSlideElements, slide]);

  return {
    onUpdateContent,
    onUpdatePosition,
    addTextBlock,
    onDeleteElement,
  };
}
