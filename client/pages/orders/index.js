import Link from 'next/link';

const Orderindex = ({ orders }) => {
    const orderList = orders.map((order) => {
        return (
            <tr key={order.id}>
                <td>{order.ticket.title}</td>
                <td>{order.status}</td>
                <td>
                    {order.status === 'created' ? (
                        <Link href="/orders/[orderId]" as={`/orders/${order.id}`}>
                            <a>Pay for order</a>
                        </Link>
                    ) : order.status === 'complete' ? (
                        <b>Completed</b>
                    ) : (
                        <b>-</b>
                    )}
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h1>My Orders</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>{orderList}</tbody>
            </table>
        </div>
    );
};

Orderindex.getInitialProps = async (context, client) => {
    const { data: orders } = await client.get('/api/orders/');

    return { orders };
};

export default Orderindex;
