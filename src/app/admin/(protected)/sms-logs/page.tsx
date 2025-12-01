
import { getSmsLogs } from './actions';
import SmsLogList from './_components/sms-log-list';

export default async function SmsLogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

  const { logs, hasMore, total } = await getSmsLogs(page);

  return (
    <SmsLogList
      initialLogs={logs}
      initialHasMore={hasMore}
      totalLogs={total}
    />
  );
}
