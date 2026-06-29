import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phcRepository } from '../services/repositories/phcRepository';
import { UserRole } from '@/constants/roles';

export function useAttendance(facilityId?: string) {
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['attendance', facilityId],
    queryFn: () => (facilityId ? phcRepository.getAttendance(facilityId) : Promise.resolve([])),
    enabled: !!facilityId,
  });

  const attendanceMutation = useMutation({
    mutationFn: ({
      facilityId,
      staffName,
      role,
      present,
      timeIn,
    }: {
      facilityId: string;
      staffName: string;
      role: UserRole;
      present: boolean;
      timeIn?: string;
    }) => phcRepository.updateAttendance(facilityId, staffName, role, present, timeIn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', facilityId] });
      queryClient.invalidateQueries({ queryKey: ['phcs'] });
      refetch();
    },
  });

  const updateAttendance = async (
    facId: string,
    staffName: string,
    role: UserRole,
    present: boolean,
    timeIn?: string
  ) => {
    await attendanceMutation.mutateAsync({ facilityId: facId, staffName, role, present, timeIn });
  };

  return {
    attendance,
    loading: loading || attendanceMutation.isPending,
    updateAttendance,
  };
}
