import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { usePresentationStore } from "../store/usePresentationStore";
import { Presentation, RoleResponse } from "../types/types";
import { toast } from "react-toastify";

export function useLoadPresentation(presentationId: string, nickname: string) {
  const navigate = useNavigate();
  const { setPresentation, setRole, updateUsers } = usePresentationStore();

  useEffect(() => {
    if (!presentationId || !nickname) {
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        const [presRes, roleRes] = await Promise.all([
          axios.get<Presentation>(`/api/presentations/${presentationId}`),
          axios.get<RoleResponse>(`/api/presentations/role`, {
            params: { presentationId, nickname },
          }),
        ]);

        setPresentation(presRes.data);
        setRole(roleRes.data.role);

        if (presRes.data.users) {
          updateUsers(presRes.data.users);
        }
      } catch {
        toast.error("Failed to fetch presentations");
        navigate("/");
      }
    };

    load();
  }, [
    presentationId,
    nickname,
    navigate,
    setPresentation,
    setRole,
    updateUsers,
  ]);
}
