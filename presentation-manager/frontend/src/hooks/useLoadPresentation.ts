import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { usePresentationStore } from "../store/usePresentationStore";
import { Presentation, RoleResponse, User } from "../types/types";
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

        const sessions = (presRes.data as any).sessions || [];
        const users: User[] = sessions.map((s: any) => ({
          id: s.id,
          nickname: s.nickname,
          role: s.role,
        }));

        const presentationWithUsers = {
          ...presRes.data,
          users,
        };

        setPresentation(presentationWithUsers);
        setRole(roleRes.data.role);
        updateUsers(users);
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
