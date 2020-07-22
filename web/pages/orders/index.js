const OrderIndex = ({ orders }) => {
  return (
    <div>
      <h2>My Orders</h2>
      <ul>
        {orders.map((order) => {
          return (
            <li key={order.id}>
              {order.ticket.title} - {order.status}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders')

  return { orders: data }
}

export default OrderIndex
