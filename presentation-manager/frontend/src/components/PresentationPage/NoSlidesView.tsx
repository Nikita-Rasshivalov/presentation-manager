import { toast } from "react-toastify";
import { addSlide } from "../../api/presentationApi";
import { usePresentationStore } from "../../store/usePresentationStore";
import { UserRole } from "../../types/types";

interface NoSlidesViewProps {
  presentationId: string;
  presentation: any;
  role: UserRole;
  socket: any;
  nickname: string;
}

export const NoSlidesView: React.FC<NoSlidesViewProps> = ({
  presentationId,
  presentation,
  role,
  socket,
  nickname,
}) => {
  const { setPresentation, setCurrentSlideIndex } = usePresentationStore();

  const handleAddFirstSlide = async () => {
    if (role !== UserRole.CREATOR || !presentationId) return;
    try {
      const newSlide = await addSlide(presentationId, "Slide 1", nickname);

      const updatedSlides = [newSlide];
      setPresentation({ ...presentation, slides: updatedSlides });
      setCurrentSlideIndex(0);
      socket?.emitPresentationUpdate({
        ...presentation,
        slides: updatedSlides,
      });
    } catch {
      toast.warn("Failed to add slide");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md mx-auto">
      <p className="mb-6 text-lg font-semibold text-gray-700 text-center">
        No slides yet.
      </p>
      {role === "CREATOR" && (
        <button
          onClick={handleAddFirstSlide}
          className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          aria-label="Add your first slide"
        >
          Add your first slide
        </button>
      )}
    </div>
  );
};
