import { useEffect, useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

import StripeCheckout from 'react-stripe-checkout'

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft / 1000))
    }

    findTimeLeft()
    const timeId = setInterval(findTimeLeft, 1000)

    return () => {
      clearInterval(timeId)
    }
  }, [])

  const ticketTitle = <h2>{order.ticket.title}</h2>

  if (timeLeft < 0) {
    return (
      <div>
        {ticketTitle} <span>Order Expired</span>
      </div>
    )
  }

  return (
    <div>
      {ticketTitle} <span>Time left to pay: {timeLeft} seconds</span>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={
          'pk_test_51H7OS2KuY6GjxtniPbqvNRE4XmU9qKZ30HraJotfIQ3Ank0ocrJW1I5ktswDQsfuEhJ9ahbbC6FUbk3k0zgNLHsU00mwbIsozy'
        }
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query

  const { data } = await client.get(`/api/orders/${orderId}`)

  return { order: data }
}

export default OrderShow
