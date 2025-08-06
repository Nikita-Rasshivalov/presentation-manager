import React, { useState } from "react";
import { usePresentationStore } from "../../store/usePresentationStore";
import { useSlideActions } from "../../hooks/useSlideActions";
import { Slide, UserRole, Presentation } from "../../types/types";
import { addSlide, removeSlide } from "../../api/presentationApi";
import { toast } from "react-toastify";
import { EyeIcon } from "@heroicons/react/24/outline";
import { SlideList } from "../SlideList";
import { SlideView } from "../SlideView";
import { UserList } from "../UserList";
import { PresentationModeView } from "./PresentationModeView";

interface PresentationViewProps {
  presentation: Presentation;
  setPresentation: (presentation: Presentation) => void;
  presentationId: string;
  role: UserRole;
  nickname: string;
  emitPresentationUpdate: (presentation: Presentation) => void;
  emitChangeUserRole: (userId: string, newRole: UserRole) => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  presentation,
  setPresentation,
  role,
  nickname,
  emitPresentationUpdate,
  emitChangeUserRole,
}) => {
  const { currentSlideIndex, setCurrentSlideIndex, updateSlideElements } =
    usePresentationStore();

  const [presentMode, setPresentMode] = useState(false);
  const slide = presentation.slides[currentSlideIndex];

  const { onUpdateContent, onUpdatePosition, addTextBlock } = useSlideActions(
    slide,
    role,
    null,
    updateSlideElements
  );

  const handleAddSlide = async () => {
    if (role !== UserRole.CREATOR) return;
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
    }
  };

  const handleRemoveSlide = async (slideId: string) => {
    if (role !== UserRole.CREATOR) return;
    try {
      await removeSlide(slideId, nickname);
      const newSlides = presentation.slides.filter(
        (s: Slide) => s.id !== slideId
      );
      const updatedPresentation = { ...presentation, slides: newSlides };
      setPresentation(updatedPresentation);
      setCurrentSlideIndex(Math.min(currentSlideIndex, newSlides.length - 1));
      emitPresentationUpdate(updatedPresentation);
    } catch {
      toast.error("Failed to remove slide");
    }
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    if (role !== UserRole.CREATOR) return;

    const updatedUsers = presentation.users.map((user) =>
      user.id === userId ? { ...user, role: newRole } : user
    );

    const updatedPresentation = {
      ...presentation,
      users: updatedUsers,
    };

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
      />
      <main className="flex-1 rounded-lg border border-gray-300 bg-white shadow-inner overflow-auto relative">
        <SlideView
          slideElements={slide.elements}
          role={role}
          onUpdateContent={onUpdateContent}
          onUpdatePosition={onUpdatePosition}
          onAddTextBlock={addTextBlock}
        />

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
