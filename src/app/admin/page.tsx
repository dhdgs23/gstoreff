import { getOrders, OrderList } from './_components/order-list';

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'asc';
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';

  const { orders, hasMore } = await getOrders({
    page,
    sort,
    search,
    status: ['Pending UTR', 'Processing'],
  });

  return (
    <OrderList
      initialOrders={orders}
      initialHasMore={hasMore}
      initialSort={sort}
      title="Pending Orders"
      status={['Pending UTR', 'Processing']}
      showActions={true}
    />
  );
}
