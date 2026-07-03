import { useQuery } from '@tanstack/react-query';
import { phcRepository } from '../services/repositories/phcRepository';

export function usePHCs(filterBlock?: string, minScore?: number) {
  const { data: phcs = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['phcs', filterBlock, minScore],
    queryFn: () => phcRepository.getPHCs(filterBlock, minScore),
  });

  const getPHCDetail = async (id: string) => {
    return phcRepository.getPHC(id);
  };

  return {
    phcs,
    loading,
    refetch,
    getPHCDetail,
  };
}
