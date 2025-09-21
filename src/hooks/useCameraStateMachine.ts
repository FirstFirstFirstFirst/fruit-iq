import { useMemo } from 'react'
import { CameraStep } from '../components/camera/constants'

interface CameraStepConfig {
  canGoBack: boolean
  previousStep?: CameraStep
  nextStep?: CameraStep
  allowedTransitions: CameraStep[]
}

const STEP_CONFIG: Record<CameraStep, CameraStepConfig> = {
  scan: {
    canGoBack: false,
    nextStep: 'camera',
    allowedTransitions: ['camera', 'add-fruit'],
  },
  camera: {
    canGoBack: true,
    previousStep: 'scan',
    nextStep: 'confirm-photo',
    allowedTransitions: ['scan', 'confirm-photo'],
  },
  'confirm-photo': {
    canGoBack: true,
    previousStep: 'camera',
    nextStep: 'select',
    allowedTransitions: ['camera', 'select', 'weight'],
  },
  select: {
    canGoBack: true,
    previousStep: 'scan',
    nextStep: 'weight',
    allowedTransitions: ['scan', 'weight', 'add-fruit'],
  },
  weight: {
    canGoBack: true,
    previousStep: 'select',
    nextStep: 'confirm',
    allowedTransitions: ['select', 'confirm'],
  },
  confirm: {
    canGoBack: true,
    previousStep: 'weight',
    nextStep: 'qr-payment',
    allowedTransitions: ['weight', 'qr-payment'],
  },
  'qr-payment': {
    canGoBack: true,
    previousStep: 'confirm',
    nextStep: 'success',
    allowedTransitions: ['success', 'scan'],
  },
  success: {
    canGoBack: false,
    allowedTransitions: ['scan'],
  },
  'add-fruit': {
    canGoBack: true,
    previousStep: 'select',
    allowedTransitions: ['select', 'weight'],
  },
}

export function useCameraStateMachine(currentStep: CameraStep) {
  const currentConfig = useMemo(() => STEP_CONFIG[currentStep], [currentStep])

  const canGoBack = useMemo(() => currentConfig.canGoBack, [currentConfig])

  const getPreviousStep = useMemo(() => currentConfig.previousStep, [currentConfig])

  const getNextStep = useMemo(() => currentConfig.nextStep, [currentConfig])

  const canTransitionTo = (targetStep: CameraStep): boolean => {
    return currentConfig.allowedTransitions.includes(targetStep)
  }

  const getValidTransitions = (): CameraStep[] => {
    return currentConfig.allowedTransitions
  }

  const isValidTransition = (from: CameraStep, to: CameraStep): boolean => {
    return STEP_CONFIG[from].allowedTransitions.includes(to)
  }

  const getStepProgress = (): number => {
    const stepOrder: CameraStep[] = [
      'scan',
      'camera',
      'confirm-photo',
      'select',
      'weight',
      'confirm',
      'qr-payment',
      'success'
    ]

    const currentIndex = stepOrder.indexOf(currentStep)
    return currentIndex >= 0 ? (currentIndex / (stepOrder.length - 1)) * 100 : 0
  }

  const isMainFlowStep = (): boolean => {
    return !['add-fruit'].includes(currentStep)
  }

  return {
    canGoBack,
    getPreviousStep,
    getNextStep,
    canTransitionTo,
    getValidTransitions,
    isValidTransition,
    getStepProgress,
    isMainFlowStep,
    currentConfig,
  }
}