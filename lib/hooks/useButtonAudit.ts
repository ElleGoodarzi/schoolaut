'use client'

import { useEffect } from 'react'

interface ButtonAuditResult {
  element: HTMLButtonElement
  text: string
  hasOnClick: boolean
  hasEventListener: boolean
  location: string
  isDisabled: boolean
}

export function useButtonAudit(pageName?: string) {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return

    const auditButtons = () => {
      const buttons = document.querySelectorAll('button')
      const results: ButtonAuditResult[] = []
      
      buttons.forEach((button, index) => {
        const text = button.innerText?.trim() || button.textContent?.trim() || 'Unnamed button'
        const hasOnClick = button.onclick !== null || button.hasAttribute('onclick')
        const hasEventListener = button.getAttribute('data-has-listener') === 'true'
        const isDisabled = button.disabled || button.hasAttribute('disabled')
        
        results.push({
          element: button,
          text,
          hasOnClick,
          hasEventListener,
          location: `${pageName || 'Unknown page'} - Button ${index + 1}`,
          isDisabled
        })
      })
      
      // Log results
      const nonWorkingButtons = results.filter(r => !r.hasOnClick && !r.isDisabled && r.text !== '')
      
      if (nonWorkingButtons.length > 0) {
        console.log('='.repeat(80))
        console.log(`🔍 RUNTIME BUTTON AUDIT - PAGE: ${pageName || 'Current Page'}`)
        console.log('='.repeat(80))
        
        nonWorkingButtons.forEach(button => {
          console.warn(`🔍 Button with text "${button.text}" has no onClick handler.`)
          console.log(`   Location: ${button.location}`)
          console.log(`   Disabled: ${button.isDisabled}`)
          console.log(`   Element:`, button.element)
          console.log('')
        })
        
        console.log(`📊 Summary: Found ${nonWorkingButtons.length} non-working buttons out of ${results.length} total buttons`)
        console.log('='.repeat(80))
      } else {
        console.log(`✅ All buttons on ${pageName || 'current page'} have proper onClick handlers or are disabled`)
      }
    }

    // Run audit after DOM is ready
    const timer = setTimeout(auditButtons, 1000)
    
    return () => clearTimeout(timer)
  }, [pageName])
}

// Hook for specific page audits
export function usePageButtonAudit(pageName: string) {
  useButtonAudit(pageName)
  
  useEffect(() => {
    // Page-specific audit logging
    console.log(`🔍 Starting button audit for page: ${pageName}`)
  }, [pageName])
}

// Utility function to mark buttons as having listeners (for React event handlers)
export function markButtonAsHandled(buttonElement: HTMLButtonElement) {
  buttonElement.setAttribute('data-has-listener', 'true')
}
