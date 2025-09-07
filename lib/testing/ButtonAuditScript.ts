// Comprehensive Button Audit Script

interface ButtonAuditResult {
  text: string
  location: string
  hasOnClick: boolean
  hasEventListener: boolean
  status: 'working' | 'broken' | 'no handler' | 'placeholder only'
  element: string
  page: string
}

export class ButtonAuditor {
  private results: ButtonAuditResult[] = []

  auditPageButtons(pageName: string): ButtonAuditResult[] {
    const buttons = document.querySelectorAll('button, [role="button"], .btn')
    const pageResults: ButtonAuditResult[] = []

    buttons.forEach((button, index) => {
      const element = button as HTMLElement
      const text = this.getButtonText(element)
      const location = `${pageName} - Element ${index + 1}`
      
      const hasOnClick = this.hasClickHandler(element)
      const hasEventListener = this.hasEventListener(element)
      const status = this.determineStatus(element, hasOnClick, hasEventListener)

      const result: ButtonAuditResult = {
        text,
        location,
        hasOnClick,
        hasEventListener,
        status,
        element: element.outerHTML.substring(0, 100) + '...',
        page: pageName
      }

      pageResults.push(result)
      this.results.push(result)
    })

    return pageResults
  }

  private getButtonText(element: HTMLElement): string {
    return element.innerText?.trim() || 
           element.textContent?.trim() || 
           element.getAttribute('aria-label') || 
           element.getAttribute('title') || 
           'Unnamed button'
  }

  private hasClickHandler(element: HTMLElement): boolean {
    return element.onclick !== null || 
           element.hasAttribute('onclick') ||
           element.getAttribute('onClick') !== null
  }

  private hasEventListener(element: HTMLElement): boolean {
    // Check for React event handlers or data attributes indicating listeners
    return element.hasAttribute('data-has-listener') ||
           element.className.includes('cursor-pointer') ||
           element.tagName.toLowerCase() === 'a' ||
           element.closest('[data-testid]') !== null
  }

  private determineStatus(element: HTMLElement, hasOnClick: boolean, hasEventListener: boolean): ButtonAuditResult['status'] {
    if (element.hasAttribute('disabled') || element.className.includes('disabled')) {
      return 'placeholder only'
    }
    
    if (hasOnClick || hasEventListener || element.tagName.toLowerCase() === 'a') {
      return 'working'
    }
    
    if (element.className.includes('btn') || element.tagName.toLowerCase() === 'button') {
      return 'no handler'
    }
    
    return 'broken'
  }

  generateReport(): any {
    const summary = {
      totalButtons: this.results.length,
      working: this.results.filter(r => r.status === 'working').length,
      broken: this.results.filter(r => r.status === 'broken').length,
      noHandler: this.results.filter(r => r.status === 'no handler').length,
      placeholderOnly: this.results.filter(r => r.status === 'placeholder only').length
    }

    const byPage = this.groupByPage()

    return {
      summary,
      byPage,
      allButtons: this.results,
      timestamp: new Date().toISOString(),
      recommendations: this.generateRecommendations(summary)
    }
  }

  private groupByPage(): Record<string, ButtonAuditResult[]> {
    const grouped: Record<string, ButtonAuditResult[]> = {}
    
    this.results.forEach(result => {
      if (!grouped[result.page]) {
        grouped[result.page] = []
      }
      grouped[result.page].push(result)
    })

    return grouped
  }

  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = []
    
    if (summary.noHandler > 0) {
      recommendations.push(`Add onClick handlers to ${summary.noHandler} buttons`)
    }
    
    if (summary.broken > 0) {
      recommendations.push(`Fix ${summary.broken} broken buttons`)
    }
    
    if (summary.placeholderOnly > 0) {
      recommendations.push(`Consider removing ${summary.placeholderOnly} placeholder buttons`)
    }
    
    const workingPercentage = Math.round((summary.working / summary.totalButtons) * 100)
    if (workingPercentage < 90) {
      recommendations.push(`Improve button functionality - only ${workingPercentage}% working`)
    } else {
      recommendations.push(`Excellent! ${workingPercentage}% of buttons are functional`)
    }

    return recommendations
  }

  reset(): void {
    this.results = []
  }
}

// Development utility functions
export function auditCurrentPageButtons(): void {
  const auditor = new ButtonAuditor()
  const currentPage = window.location.pathname
  const results = auditor.auditPageButtons(currentPage)
  
  console.log('='.repeat(80))
  console.log(`🔍 BUTTON AUDIT REPORT - PAGE: ${currentPage}`)
  console.log('='.repeat(80))
  
  results.forEach(result => {
    const statusEmoji = result.status === 'working' ? '✅' : 
                       result.status === 'broken' ? '❌' : 
                       result.status === 'no handler' ? '⚠️' : '🔒'
    
    console.log(`${statusEmoji} [${result.text}]: ${result.status}`)
  })
  
  const report = auditor.generateReport()
  console.log('='.repeat(80))
  console.log('📊 SUMMARY:')
  console.log(`Total buttons: ${report.summary.totalButtons}`)
  console.log(`✅ Working: ${report.summary.working}`)
  console.log(`❌ Broken: ${report.summary.broken}`)
  console.log(`⚠️ No handler: ${report.summary.noHandler}`)
  console.log(`🔒 Placeholder: ${report.summary.placeholderOnly}`)
  console.log('='.repeat(80))
}

// Global function for browser console testing
declare global {
  interface Window {
    auditButtons: () => void
  }
}

if (typeof window !== 'undefined') {
  window.auditButtons = auditCurrentPageButtons
}
