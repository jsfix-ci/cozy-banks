import React, { useEffect, useState } from 'react'
import {
  Step,
  StepButton,
  StepLabel,
  Stepper
} from 'cozy-ui/transpiled/react/Stepper'
import Button from 'cozy-ui/transpiled/react/Button'
import PaymentDefinition from './PaymentDefinition'
import AccessToken from './AccessToken'
import PaymentCreation from './PaymentCreation'
import PaymentValidation from './PaymentValidation'
import PaymentProvider from './PaymentContext'
import { clearBiPayment } from './storage'

const steps = [
  {
    label: 'Payment definition',
    // eslint-disable-next-line react/display-name
    content: () => <PaymentDefinition />
  },
  {
    label: 'Access token',
    // eslint-disable-next-line react/display-name
    content: () => <AccessToken />
  },
  {
    label: 'Payment creation',
    // eslint-disable-next-line react/display-name
    content: () => <PaymentCreation />
  },
  {
    label: 'Payment validation',
    // eslint-disable-next-line react/display-name
    content: () => <PaymentValidation />
  }
]
const Payments = () => {
  const [activeStep, setActiveStep] = useState(0)

  const nextStep = () => {
    setActiveStep(activeStep + 1)
  }

  useEffect(() => {
    clearBiPayment()
  }, [])

  const { content: Content } = steps[activeStep]

  const displayNextButton = activeStep !== steps.length - 1

  return (
    <PaymentProvider>
      <div className="u-mr-2">
        <Stepper alternativeLabel nonLinear activeStep={activeStep}>
          {steps.map((step, index) => {
            const stepProps = {
              onClick: () => {
                setActiveStep(index)
              }
            }
            const labelProps = {
              error: null
            }

            return (
              <Step key={step.label} {...stepProps}>
                <StepButton>
                  <StepLabel {...labelProps}>{step.label}</StepLabel>
                </StepButton>
              </Step>
            )
          })}
        </Stepper>
        <div className="u-ml-3">
          <Content />
        </div>

        {displayNextButton && (
          <Button
            className="u-db u-mt-1 u-ml-3"
            label="Next"
            onClick={nextStep}
          />
        )}
      </div>
    </PaymentProvider>
  )
}

export const styles = {
  pre: { whiteSpace: 'pre-wrap', wordWrap: 'break-word' }
}

export default Payments
