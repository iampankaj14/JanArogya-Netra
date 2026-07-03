import { useQuery } from '@tanstack/react-query';
import { reportsRepository } from '../services/repositories/reportsRepository';

export function useReports() {
  const { data: reports = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsRepository.getReports(),
  });

  const downloadReportUrl = (id: string) => {
    return `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?reportId=${id}`;
  };

  return {
    reports,
    loading,
    downloadReportUrl,
    refetch,
  };
}
export default useReports;
