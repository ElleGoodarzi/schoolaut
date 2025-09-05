'use client'

import { useState, useEffect } from 'react'

export default function SimpleTest() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Starting fetch...')
        const response = await fetch('/api/dashboard/refresh')
        console.log('📡 Response:', response.status, response.ok)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('📊 Result:', result)
        
        setData(result)
      } catch (err) {
        console.error('❌ Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        console.log('✅ Finished')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Simple Test - Loading...</h1>
        <div>Fetching data from API...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Simple Test - Error</h1>
        <div style={{ color: 'red' }}>Error: {error}</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Simple Test - Success!</h1>
      <div>
        <h2>Data received:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
