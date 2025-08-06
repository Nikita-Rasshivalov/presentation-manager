import { useEffect, useMemo, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import { Slide, UserRole, SlideElement, Presentation } from "../types/types";
export function useSlideActions(
  slide: Slide | null | undefined,
  role: UserRole | null | undefined,
  socket: Socket | null,
  updateSlideElements: (slideId: string, elements: SlideElement[]) => void,
  emitPresentationUpdate?: (presentation: Presentation) => void,
  presentation?: Presentation
) {
  const elements = useMemo(() => slide?.elements || [], [slide?.elements]);

  const elementsRef = useRef<SlideElement[]>(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const updateElements = useCallback(
    (newElements: SlideElement[]) => {
      if (!slide) return;

      updateSlideElements(slide.id, newElements);

      if (emitPresentationUpdate && presentation) {
        const updatedSlides = presentation.slides.map((s) =>
          s.id === slide.id ? { ...s, elements: newElements } : s
        );
        emitPresentationUpdate({ ...presentation, slides: updatedSlides });
      }
    },
    [slide, updateSlideElements, emitPresentationUpdate, presentation]
  );

  const addElement = useCallback(
    (
      content: string,
      pos: { x: number; y: number },
      size: { width: number; height: number },
      callback?: (response: any) => void
    ) => {
      if (!socket || !slide || !role) return;
      if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

      socket.emit(
        "add_element",
        { slideId: slide.id, content, pos, size },
        (response: any) => {
          if (callback) callback(response);
        }
      );
    },
    [socket, slide, role]
  );

  const editElement = useCallback(
    (elementId: string, content: string, pos: { x: number; y: number }) => {
      if (!socket || !role) return;
      if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

      socket.emit("edit_element", { elementId, content, pos });
    },
    [socket, role]
  );

  const deleteElement = useCallback(
    (elementId: string) => {
      if (!socket || !role) return;
      if (role !== UserRole.CREATOR && role !== UserRole.EDITOR) return;

      socket.emit("delete_element", { elementId });
    },
    [socket, role]
  );

  const onUpdateContent = useCallback(
    (id: string, content: string) => {
      if (
        !slide ||
        !role ||
        (role !== UserRole.CREATOR && role !== UserRole.EDITOR)
      )
        return;

      const element = elementsRef.current.find((el) => el.id === id);
      if (!element) return;

      editElement(id, content, { x: element.x, y: element.y });
    },
    [slide, role, editElement]
  );

  const onUpdatePosition = useCallback(
    (id: string, x: number, y: number) => {
      if (
        !slide ||
        !role ||
        (role !== UserRole.CREATOR && role !== UserRole.EDITOR)
      )
        return;

      const element = elementsRef.current.find((el) => el.id === id);
      if (!element) return;

      editElement(id, element.content, { x, y });
    },
    [slide, role, editElement]
  );

  const addTextBlock = useCallback(() => {
    if (
      !slide ||
      !role ||
      (role !== UserRole.CREATOR && role !== UserRole.EDITOR)
    )
      return;

    addElement("...", { x: 50, y: 50 }, { width: 200, height: 100 });
  }, [slide, role, addElement]);

  const onDeleteElement = useCallback(
    (id: string) => {
      if (
        !slide ||
        !role ||
        (role !== UserRole.CREATOR && role !== UserRole.EDITOR)
      )
        return;

      deleteElement(id);
    },
    [slide, role, deleteElement]
  );

  useEffect(() => {
    if (!socket || !slide) return;

    const handleSlideUpdated = (updatedSlide: Slide) => {
      if (updatedSlide.id === slide.id) {
        updateElements(updatedSlide.elements || []);
      }
    };

    const handleElementAdded = (element: SlideElement) => {
      if (elementsRef.current.find((el) => el.id === element.id)) return;
      updateElements([...elementsRef.current, element]);
    };

    const handleElementUpdated = (element: SlideElement) => {
      const updatedElements = elementsRef.current.map((el) =>
        el.id === element.id ? element : el
      );
      updateElements(updatedElements);
    };

    const handleElementDeleted = ({ elementId }: { elementId: string }) => {
      const updatedElements = elementsRef.current.filter(
        (el) => el.id !== elementId
      );
      updateElements(updatedElements);
    };

    socket.on("slide_updated", handleSlideUpdated);
    socket.on("element_added", handleElementAdded);
    socket.on("element_updated", handleElementUpdated);
    socket.on("element_deleted", handleElementDeleted);

    return () => {
      socket.off("slide_updated", handleSlideUpdated);
      socket.off("element_added", handleElementAdded);
      socket.off("element_updated", handleElementUpdated);
      socket.off("element_deleted", handleElementDeleted);
    };
  }, [socket, slide?.id, updateElements, slide]);

  return {
    onUpdateContent,
    onUpdatePosition,
    addTextBlock,
    onDeleteElement,
  };
}
