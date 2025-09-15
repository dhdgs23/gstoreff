import { getDisabledRedeemUsers } from '@/app/actions';
import DisabledUserList from './_components/disabled-user-list';

export default async function DisabledRedeemUsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const { users, hasMore } = await getDisabledRedeemUsers(search, page);

  return <DisabledUserList initialUsers={users} initialHasMore={hasMore} />;
}
