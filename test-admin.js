// Script de test pour vérifier l'API admin
const fetch = require('node-fetch')

async function testAdminAPI() {
  try {
    console.log('Testing admin clear cache...')
    
    const response = await fetch('http://localhost:4000/api/admin/clear-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminSecret: 'Pandaman8+' })
    })
    
    const data = await response.json()
    console.log('Clear cache response:', data)
    
    console.log('\nTesting admin auth...')
    
    const authResponse = await fetch('http://localhost:4000/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminSecret: 'Pandaman8+' })
    })
    
    const authData = await authResponse.json()
    console.log('Auth response:', authData)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testAdminAPI()