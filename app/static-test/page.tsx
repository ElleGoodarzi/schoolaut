export default function StaticTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Static Test - No JavaScript</h1>
      <p>This is a completely static page with no client-side JavaScript.</p>
      <p>If you can see this, the server is working fine.</p>
      <div>
        <h2>API Test (Server Side)</h2>
        <p>The API should be accessible at: <a href="/api/dashboard/refresh">/api/dashboard/refresh</a></p>
      </div>
    </div>
  )
}
