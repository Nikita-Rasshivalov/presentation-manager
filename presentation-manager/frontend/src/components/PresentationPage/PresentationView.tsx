import React, { useState, useEffect } from "react";
import { useSlideActions } from "../../hooks/useSlideActions";
import { UserRole, Presentation } from "../../types/types";
import { addSlide, removeSlide } from "../../api/presentationApi";
import { toast } from "react-toastify";
import { EyeIcon } from "@heroicons/react/24/outline";
import { SlideList } from "../Slide/SlideList";
import { SlideView } from "../Slide/SlideView";
import { UserList } from "../UserList";
import { PresentationModeView } from "./PresentationModeView";
import { Socket } from "socket.io-client";

interface PresentationViewProps {
  presentation: Presentation;
  setPresentation: (presentation: Presentation) => void;
  presentationId: string;
  role: UserRole;
  nickname: string;
  emitPresentationUpdate: (presentation: Presentation) => void;
  emitChangeUserRole: (userId: string, newRole: UserRole) => void;
  socket: Socket | null;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  presentation,
  setPresentation,
  role,
  nickname,
  emitPresentationUpdate,
  emitChangeUserRole,
  socket,
}) => {
  // Локальное состояние текущего слайда (чтобы не менять Zustand внутри рендера другого компонента)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presentMode, setPresentMode] = useState(false);
  const [addingSlide, setAddingSlide] = useState(false);
  const [removingSlide, setRemovingSlide] = useState(false);

  useEffect(() => {
    // Если слайды изменились, гарантируем валидный индекс текущего слайда
    setCurrentSlideIndex((idx) =>
      Math.min(idx, presentation.slides.length - 1)
    );
  }, [presentation.slides.length]);

  const slides = presentation.slides;
  const slide = slides[currentSlideIndex];

  const { onUpdateContent, onUpdatePosition, addTextBlock, onDeleteElement } =
    useSlideActions(slide, role, socket, (slideId, elements) => {
      // Обновляем элементы слайда через setPresentation
      const updatedSlides = presentation.slides.map((s) =>
        s.id === slideId ? { ...s, elements } : s
      );
      const updatedPresentation = { ...presentation, slides: updatedSlides };
      setPresentation(updatedPresentation);
      emitPresentationUpdate(updatedPresentation);
    });

  const handleAddSlide = async () => {
    if (role !== UserRole.CREATOR || addingSlide) return;
    setAddingSlide(true);
    try {
      const newSlide = await addSlide(
        presentation.id,
        `Slide ${presentation.slides.length + 1}`,
        nickname
      );
      const updatedSlides = [...presentation.slides, newSlide];
      const updatedPresentation = { ...presentation, slides: updatedSlides };
      setPresentation(updatedPresentation);
      setCurrentSlideIndex(updatedSlides.length - 1);
      emitPresentationUpdate(updatedPresentation);
    } catch {
      toast.warn("Failed to add slide");
    } finally {
      setAddingSlide(false);
    }
  };

  const handleRemoveSlide = async (slideId: string) => {
    if (role !== UserRole.CREATOR || removingSlide) return;
    setRemovingSlide(true);
    try {
      await removeSlide(slideId, nickname);
      const newSlides = presentation.slides.filter((s) => s.id !== slideId);
      const updatedPresentation = { ...presentation, slides: newSlides };
      setPresentation(updatedPresentation);

      setCurrentSlideIndex((idx) =>
        newSlides.length === 0 ? 0 : Math.min(idx, newSlides.length - 1)
      );

      emitPresentationUpdate(updatedPresentation);
    } catch {
      toast.error("Failed to remove slide");
    } finally {
      setRemovingSlide(false);
    }
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    if (role !== UserRole.CREATOR) return;
    const updatedUsers = presentation.users.map((user) =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    const updatedPresentation = { ...presentation, users: updatedUsers };
    setPresentation(updatedPresentation);
    emitChangeUserRole(userId, newRole);
  };

  const togglePresentMode = () => setPresentMode((prev) => !prev);

  if (presentMode) {
    return <PresentationModeView slide={slide} onExit={togglePresentMode} />;
  }

  return (
    <section className="bg-white shadow-xl rounded-2xl p-6 max-w-7xl mx-auto mt-12 border border-gray-200 flex gap-6 h-[80vh] relative">
      <SlideList
        slides={presentation.slides}
        currentSlideIndex={currentSlideIndex}
        role={role}
        onSelectSlide={setCurrentSlideIndex}
        onAddSlide={handleAddSlide}
        onRemoveSlide={handleRemoveSlide}
        addingSlide={addingSlide}
        removingSlide={removingSlide}
      />
      <main className="flex-1 rounded-lg border border-gray-300 bg-white shadow-inner overflow-auto relative">
        {slide ? (
          <SlideView
            slideElements={slide.elements}
            role={role}
            onUpdateContent={onUpdateContent}
            onUpdatePosition={onUpdatePosition}
            onAddTextBlock={addTextBlock}
            onDeleteElement={onDeleteElement}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            No slide selected
          </div>
        )}
        <button
          onClick={togglePresentMode}
          aria-label="Enter presentation mode"
          className="absolute bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition flex items-center gap-2"
        >
          <EyeIcon className="h-5 w-5" />
          Presentation
        </button>
      </main>
      <aside className="w-1/4 rounded-lg border border-gray-300 bg-white p-4 shadow-md flex flex-col">
        <UserList
          users={presentation.users}
          currentUserRole={role}
          currentUserNickname={nickname}
          onChangeUserRole={changeUserRole}
        />
      </aside>
    </section>
  );
};
