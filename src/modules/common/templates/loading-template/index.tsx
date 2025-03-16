"use client"

import React from 'react'
import LoadingSpinner from '../../components/loading-spinner'

type LoadingTemplateProps = {
  isLoading?: boolean
}

export default function LoadingTemplate({ isLoading = true }: LoadingTemplateProps) {
  if (!isLoading) return null
  
  return <LoadingSpinner />
} 