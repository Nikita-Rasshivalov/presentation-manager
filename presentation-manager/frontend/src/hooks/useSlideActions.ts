import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { Slide, SlideElement, UserRole } from "../types/types";

export function useSlideActions(
  slide: Slide | null | undefined,
  role: UserRole | null | undefined,
  socket: Socket | null,
  updateSlideElements: (slideId: string, elements: SlideElement[]) => void
) {
  const onUpdateContent = async (
    elementId: string,
    content: string
  ): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    const newElements = slide.elements.map((el) =>
      el.id === elementId ? { ...el, content } : el
    );
    updateSlideElements(slide.id, newElements);

    const updatedElement = newElements.find((el) => el.id === elementId);
    if (!updatedElement) return;

    socket.emit("edit_element", {
      elementId: updatedElement.id,
      content: updatedElement.content,
      pos: { x: updatedElement.x, y: updatedElement.y },
    });
  };

  const onUpdatePosition = async (
    elementId: string,
    x: number,
    y: number
  ): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    const newElements = slide.elements.map((el) =>
      el.id === elementId ? { ...el, x, y } : el
    );
    updateSlideElements(slide.id, newElements);

    const updatedElement = newElements.find((el) => el.id === elementId);
    if (!updatedElement) return;

    socket.emit("edit_element", {
      elementId: updatedElement.id,
      content: updatedElement.content,
      pos: { x: updatedElement.x, y: updatedElement.y },
    });
  };

  const addTextBlock = async (): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    const newElement: SlideElement = {
      id: `el_${Date.now()}`,
      type: "text",
      x: 20,
      y: 20,
      content: "",
    };

    const newElements = [...(slide.elements || []), newElement];
    updateSlideElements(slide.id, newElements);

    socket.emit("add_element", {
      slideId: slide.id,
      content: newElement.content,
      pos: { x: newElement.x, y: newElement.y },
      size: { width: 200, height: 100 },
    });
  };

  const onDeleteElement = async (elementId: string): Promise<void> => {
    if (!slide || !role || !socket) return;
    if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

    const newElements = slide.elements.filter((el) => el.id !== elementId);
    updateSlideElements(slide.id, newElements);

    socket.emit("delete_element", {
      slideId: slide.id,
      elementId,
    });
  };

  useEffect(() => {
    if (!socket || !slide) return;

    const handleElementAdded = (element: SlideElement) => {
      if (slide.elements.find((el) => el.id === element.id)) return;
      const newElements = [...slide.elements, element];
      updateSlideElements(slide.id, newElements);
    };

    const handleElementUpdated = (element: SlideElement) => {
      const newElements = slide.elements.map((el) =>
        el.id === element.id ? element : el
      );
      updateSlideElements(slide.id, newElements);
    };

    const handleElementDeleted = ({ elementId }: { elementId: string }) => {
      const newElements = slide.elements.filter((el) => el.id !== elementId);
      updateSlideElements(slide.id, newElements);
    };

    socket.on("element_added", handleElementAdded);
    socket.on("element_updated", handleElementUpdated);
    socket.on("element_deleted", handleElementDeleted);

    return () => {
      socket.off("element_added", handleElementAdded);
      socket.off("element_updated", handleElementUpdated);
      socket.off("element_deleted", handleElementDeleted);
    };
  }, [socket, slide, updateSlideElements]);

  return {
    onUpdateContent,
    onUpdatePosition,
    addTextBlock,
    onDeleteElement,
  };
}
