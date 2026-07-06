import { useEffect, useState } from 'react';
import { phcRepository } from '../services/repositories/phcRepository';
import { useAuth } from '../context/AuthContext';
import { PHC } from '@/shared/types/phc';

export function usePHCs(filterBlock?: string, minScore?: number) {
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = phcRepository.subscribePHCs(filterBlock, (data) => {
      const filtered = minScore !== undefined ? data.filter((p) => p.healthScore >= minScore) : data;
      setPhcs(filtered);
      setLoading(false);
    });
    return unsubscribe;
  }, [filterBlock, minScore]);

  const getPHCDetail = async (id: string) => {
    return phcRepository.getPHC(id);
  };

  return {
    phcs,
    loading,
    refetch: () => {},
    getPHCDetail,
  };
}

// Centralizes role-based PHC scoping: DHO sees all PHCs, BMO sees only PHCs
// in their assigned block (authState.facilityId holds the block name for BMO),
// PHC staff sees only their own facility (authState.facilityId holds the PHC id).
export function useRoleScopedPHCs() {
  const { authState } = useAuth();
  const filterBlock = authState?.role === 'BMO' ? authState.facilityId : undefined;
  const { phcs, loading, refetch } = usePHCs(filterBlock);

  const scopedPHCs = authState?.role === 'PHC'
    ? phcs.filter((p) => p.id === authState.facilityId)
    : phcs;

  return { phcs: scopedPHCs, loading, refetch };
}
