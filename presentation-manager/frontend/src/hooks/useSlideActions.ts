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
    if (!slide || !role) return;
    if (role !== "CREATOR" && role !== "EDITOR") return;

    const newElements = slide.elements.map((el) =>
      el.id === elementId ? { ...el, content } : el
    );
    updateSlideElements(slide.id, newElements);
    socket?.emit("updateSlideElements", {
      slideId: slide.id,
      elements: newElements,
    });
  };

  const onUpdatePosition = async (
    elementId: string,
    x: number,
    y: number
  ): Promise<void> => {
    if (!slide || !role) return;
    if (role !== "CREATOR" && role !== "EDITOR") return;

    const newElements = slide.elements.map((el) =>
      el.id === elementId ? { ...el, x, y } : el
    );
    updateSlideElements(slide.id, newElements);
    socket?.emit("updateSlideElements", {
      slideId: slide.id,
      elements: newElements,
    });
  };

  const addTextBlock = async (): Promise<void> => {
    if (!slide || !role) return;
    if (role !== "CREATOR" && role !== "EDITOR") return;

    const newElement: SlideElement = {
      id: `el_${Date.now()}`,
      type: "text",
      x: 20,
      y: 20,
      content: "New text...",
    };
    const newElements = [...slide.elements, newElement];
    updateSlideElements(slide.id, newElements);
    socket?.emit("updateSlideElements", {
      slideId: slide.id,
      elements: newElements,
    });
  };

  return { onUpdateContent, onUpdatePosition, addTextBlock };
}
