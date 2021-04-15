import React from 'react'
import { createContext, useContext, useState } from 'react'

const PaymentContext = createContext({})

const PaymentProvider = ({ children }) => {
  const [payment, setPayment] = useState({
    beneficiaryLabel: 'PIRES FLORIAN',
    amount: '1',
    label: 'Virement vers Bourso',
    identification: 'FR7640618803070004066945901'
  })
  const [biPayment, setBiPayment] = useState({})

  return (
    <PaymentContext.Provider
      value={{ payment, setPayment, biPayment, setBiPayment }}
    >
      {children}
    </PaymentContext.Provider>
  )
}

export default PaymentProvider

export const usePaymentContext = () => {
  return useContext(PaymentContext)
}
