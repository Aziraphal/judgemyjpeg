/**
 * Script de scan sécurité automatique pour JudgeMyJPEG
 * Tests de sécurité baseline sans pentest intrusif
 */

const https = require('https')
const http = require('http')
const dns = require('dns').promises
const crypto = require('crypto')

const TARGET_URL = 'https://www.judgemyjpeg.fr'
const TARGET_DOMAIN = 'www.judgemyjpeg.fr'

class SecurityScanner {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            target: TARGET_URL,
            tests: {},
            score: 0,
            recommendations: []
        }
    }

    async runAllTests() {
        console.log('🔍 Démarrage du scan sécurité automatique...')
        console.log('🎯 Target:', TARGET_URL)
        console.log('⏰ Timestamp:', this.results.timestamp)
        console.log('')

        const tests = [
            { name: 'SSL/TLS Configuration', method: this.testSSL },
            { name: 'Security Headers', method: this.testSecurityHeaders },
            { name: 'DNS Security', method: this.testDNSSecurity },
            { name: 'Cookie Security', method: this.testCookieSecurity },
            { name: 'Content Security Policy', method: this.testCSP },
            { name: 'HTTP Methods', method: this.testHTTPMethods },
            { name: 'Information Disclosure', method: this.testInformationDisclosure },
            { name: 'HTTPS Redirect', method: this.testHTTPSRedirect }
        ]

        for (const test of tests) {
            try {
                console.log(`⚡ Running: ${test.name}...`)
                await test.method.call(this)
                console.log(`✅ ${test.name}: Completed`)
            } catch (error) {
                console.log(`❌ ${test.name}: Error - ${error.message}`)
                this.results.tests[test.name] = {
                    status: 'error',
                    error: error.message
                }
            }
            console.log('')
        }

        this.calculateScore()
        this.generateRecommendations()
        return this.results
    }

    async testSSL() {
        return new Promise((resolve, reject) => {
            const req = https.request(TARGET_URL, { 
                method: 'HEAD',
                timeout: 10000
            }, (res) => {
                const cert = res.socket.getPeerCertificate()
                const protocol = res.socket.getProtocol()
                const cipher = res.socket.getCipher()

                this.results.tests['SSL/TLS Configuration'] = {
                    status: 'pass',
                    details: {
                        protocol: protocol,
                        cipher: cipher?.name || 'unknown',
                        validFrom: cert.valid_from,
                        validTo: cert.valid_to,
                        issuer: cert.issuer?.O || 'unknown',
                        subject: cert.subject?.CN || 'unknown'
                    }
                }

                // Check certificate expiry
                const expiryDate = new Date(cert.valid_to)
                const now = new Date()
                const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24))

                if (daysUntilExpiry < 30) {
                    this.results.tests['SSL/TLS Configuration'].warnings = [`Certificate expires in ${daysUntilExpiry} days`]
                }

                resolve()
            })

            req.on('error', reject)
            req.on('timeout', () => reject(new Error('SSL test timeout')))
            req.end()
        })
    }

    async testSecurityHeaders() {
        return new Promise((resolve, reject) => {
            const req = https.request(TARGET_URL, { 
                method: 'HEAD',
                timeout: 10000
            }, (res) => {
                const headers = res.headers
                const securityHeaders = {
                    'strict-transport-security': headers['strict-transport-security'],
                    'content-security-policy': headers['content-security-policy'],
                    'x-frame-options': headers['x-frame-options'],
                    'x-content-type-options': headers['x-content-type-options'],
                    'referrer-policy': headers['referrer-policy'],
                    'x-xss-protection': headers['x-xss-protection'],
                    'permissions-policy': headers['permissions-policy']
                }

                const missing = []
                const present = []

                Object.entries(securityHeaders).forEach(([header, value]) => {
                    if (value) {
                        present.push(header)
                    } else {
                        missing.push(header)
                    }
                })

                this.results.tests['Security Headers'] = {
                    status: missing.length === 0 ? 'pass' : 'partial',
                    details: {
                        present: present,
                        missing: missing,
                        headers: securityHeaders
                    }
                }

                resolve()
            })

            req.on('error', reject)
            req.on('timeout', () => reject(new Error('Security headers test timeout')))
            req.end()
        })
    }

    async testDNSSecurity() {
        try {
            // Test DNS records
            const [aRecords, mxRecords] = await Promise.all([
                dns.resolve4(TARGET_DOMAIN).catch(() => []),
                dns.resolveMx(TARGET_DOMAIN).catch(() => [])
            ])

            // Test SPF record
            const txtRecords = await dns.resolveTxt(TARGET_DOMAIN).catch(() => [])
            const spfRecord = txtRecords.find(record => 
                record.some(txt => txt.startsWith('v=spf1'))
            )

            this.results.tests['DNS Security'] = {
                status: 'info',
                details: {
                    aRecords: aRecords.length,
                    mxRecords: mxRecords.length,
                    spfRecord: spfRecord ? 'present' : 'missing',
                    txtRecordsCount: txtRecords.length
                }
            }
        } catch (error) {
            throw new Error(`DNS resolution failed: ${error.message}`)
        }
    }

    async testCookieSecurity() {
        return new Promise((resolve, reject) => {
            const req = https.request(TARGET_URL, { 
                method: 'GET',
                timeout: 10000
            }, (res) => {
                const cookies = res.headers['set-cookie'] || []
                const cookieAnalysis = cookies.map(cookie => {
                    return {
                        cookie: cookie.split(';')[0],
                        httpOnly: cookie.includes('HttpOnly'),
                        secure: cookie.includes('Secure'),
                        sameSite: cookie.includes('SameSite')
                    }
                })

                const insecureCookies = cookieAnalysis.filter(c => !c.httpOnly || !c.secure)

                this.results.tests['Cookie Security'] = {
                    status: insecureCookies.length === 0 ? 'pass' : 'warning',
                    details: {
                        totalCookies: cookieAnalysis.length,
                        analysis: cookieAnalysis,
                        insecureCount: insecureCookies.length
                    }
                }

                resolve()
            })

            req.on('error', reject)
            req.on('timeout', () => reject(new Error('Cookie test timeout')))
            req.end()
        })
    }

    async testCSP() {
        return new Promise((resolve, reject) => {
            const req = https.request(TARGET_URL, { 
                method: 'GET',
                timeout: 10000
            }, (res) => {
                const csp = res.headers['content-security-policy']
                
                if (!csp) {
                    this.results.tests['Content Security Policy'] = {
                        status: 'fail',
                        details: { present: false }
                    }
                    return resolve()
                }

                // Analyze CSP directives
                const directives = csp.split(';').map(d => d.trim().split(' ')[0])
                const dangerousDirectives = []
                
                if (csp.includes("'unsafe-inline'")) dangerousDirectives.push("unsafe-inline")
                if (csp.includes("'unsafe-eval'")) dangerousDirectives.push("unsafe-eval")
                if (csp.includes("*")) dangerousDirectives.push("wildcard (*)")

                this.results.tests['Content Security Policy'] = {
                    status: dangerousDirectives.length === 0 ? 'pass' : 'warning',
                    details: {
                        present: true,
                        directives: directives,
                        dangerous: dangerousDirectives,
                        policy: csp
                    }
                }

                resolve()
            })

            req.on('error', reject)
            req.on('timeout', () => reject(new Error('CSP test timeout')))
            req.end()
        })
    }

    async testHTTPMethods() {
        const methods = ['OPTIONS', 'TRACE', 'PUT', 'DELETE', 'PATCH']
        const results = {}

        for (const method of methods) {
            try {
                await new Promise((resolve, reject) => {
                    const req = https.request(TARGET_URL, { 
                        method: method,
                        timeout: 5000
                    }, (res) => {
                        results[method] = res.statusCode
                        resolve()
                    })

                    req.on('error', () => {
                        results[method] = 'error'
                        resolve()
                    })
                    req.on('timeout', () => {
                        results[method] = 'timeout'
                        resolve()
                    })
                    req.end()
                })
            } catch (error) {
                results[method] = 'error'
            }
        }

        const allowedMethods = Object.entries(results)
            .filter(([method, status]) => status < 400)
            .map(([method]) => method)

        this.results.tests['HTTP Methods'] = {
            status: allowedMethods.length === 0 ? 'pass' : 'warning',
            details: {
                tested: methods,
                results: results,
                allowed: allowedMethods
            }
        }
    }

    async testInformationDisclosure() {
        return new Promise((resolve, reject) => {
            const req = https.request(TARGET_URL, { 
                method: 'GET',
                timeout: 10000
            }, (res) => {
                const headers = res.headers
                const disclosureHeaders = {
                    'server': headers['server'],
                    'x-powered-by': headers['x-powered-by'],
                    'x-aspnet-version': headers['x-aspnet-version'],
                    'x-generator': headers['x-generator']
                }

                const disclosed = Object.entries(disclosureHeaders)
                    .filter(([header, value]) => value)
                    .map(([header, value]) => ({ header, value }))

                this.results.tests['Information Disclosure'] = {
                    status: disclosed.length === 0 ? 'pass' : 'info',
                    details: {
                        disclosed: disclosed,
                        headers: disclosureHeaders
                    }
                }

                resolve()
            })

            req.on('error', reject)
            req.on('timeout', () => reject(new Error('Information disclosure test timeout')))
            req.end()
        })
    }

    async testHTTPSRedirect() {
        return new Promise((resolve, reject) => {
            const req = http.request(`http://${TARGET_DOMAIN}`, { 
                method: 'GET',
                timeout: 10000
            }, (res) => {
                const isRedirect = res.statusCode >= 300 && res.statusCode < 400
                const location = res.headers['location']
                const isHTTPS = location && location.startsWith('https://')

                this.results.tests['HTTPS Redirect'] = {
                    status: isRedirect && isHTTPS ? 'pass' : 'fail',
                    details: {
                        statusCode: res.statusCode,
                        location: location,
                        redirectsToHTTPS: isHTTPS
                    }
                }

                resolve()
            })

            req.on('error', reject)
            req.on('timeout', () => reject(new Error('HTTPS redirect test timeout')))
            req.end()
        })
    }

    calculateScore() {
        const tests = this.results.tests
        let totalScore = 0
        let maxScore = 0

        Object.entries(tests).forEach(([testName, result]) => {
            maxScore += 10
            
            switch (result.status) {
                case 'pass':
                    totalScore += 10
                    break
                case 'partial':
                case 'warning':
                    totalScore += 6
                    break
                case 'info':
                    totalScore += 8
                    break
                case 'fail':
                    totalScore += 0
                    break
                default:
                    totalScore += 5
            }
        })

        this.results.score = Math.round((totalScore / maxScore) * 100)
    }

    generateRecommendations() {
        const tests = this.results.tests
        const recommendations = []

        // SSL/TLS recommendations
        if (tests['SSL/TLS Configuration']?.warnings?.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'SSL/TLS',
                issue: 'Certificate expiring soon',
                recommendation: 'Renew SSL certificate before expiry'
            })
        }

        // Security Headers recommendations
        const secHeaders = tests['Security Headers']
        if (secHeaders?.details?.missing?.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Security Headers',
                issue: `Missing headers: ${secHeaders.details.missing.join(', ')}`,
                recommendation: 'Implement all security headers for complete protection'
            })
        }

        // CSP recommendations
        const csp = tests['Content Security Policy']
        if (csp?.details?.dangerous?.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'CSP',
                issue: `Dangerous CSP directives: ${csp.details.dangerous.join(', ')}`,
                recommendation: 'Remove unsafe-inline and unsafe-eval if possible'
            })
        }

        // Cookie recommendations
        const cookies = tests['Cookie Security']
        if (cookies?.details?.insecureCount > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Cookies',
                issue: `${cookies.details.insecureCount} insecure cookies found`,
                recommendation: 'Add HttpOnly and Secure flags to all cookies'
            })
        }

        // HTTP Methods recommendations
        const methods = tests['HTTP Methods']
        if (methods?.details?.allowed?.length > 0) {
            recommendations.push({
                priority: 'low',
                category: 'HTTP Methods',
                issue: `Allowed methods: ${methods.details.allowed.join(', ')}`,
                recommendation: 'Disable unnecessary HTTP methods if not required'
            })
        }

        this.results.recommendations = recommendations
    }

    generateReport() {
        console.log('\n🔒 ========== SECURITY SCAN REPORT ==========')
        console.log(`🎯 Target: ${this.results.target}`)
        console.log(`⏰ Scan Time: ${this.results.timestamp}`)
        console.log(`📊 Overall Score: ${this.results.score}/100`)
        
        // Score interpretation
        let scoreColor = '🔴'
        let scoreText = 'CRITICAL'
        if (this.results.score >= 90) {
            scoreColor = '🟢'
            scoreText = 'EXCELLENT'
        } else if (this.results.score >= 80) {
            scoreColor = '🟡'
            scoreText = 'GOOD'
        } else if (this.results.score >= 60) {
            scoreColor = '🟠'
            scoreText = 'MODERATE'
        }
        
        console.log(`${scoreColor} Security Level: ${scoreText}`)
        console.log('\n📋 TEST RESULTS:')
        
        Object.entries(this.results.tests).forEach(([testName, result]) => {
            const statusIcon = {
                'pass': '✅',
                'partial': '⚠️',
                'warning': '⚠️',
                'info': 'ℹ️',
                'fail': '❌',
                'error': '💥'
            }[result.status] || '❓'
            
            console.log(`${statusIcon} ${testName}: ${result.status.toUpperCase()}`)
        })
        
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:')
            this.results.recommendations.forEach((rec, index) => {
                const priorityIcon = {
                    'high': '🔴',
                    'medium': '🟡', 
                    'low': '🟢'
                }[rec.priority] || '❓'
                
                console.log(`${priorityIcon} ${index + 1}. [${rec.category}] ${rec.issue}`)
                console.log(`   → ${rec.recommendation}`)
            })
        }
        
        console.log('\n🎯 SUMMARY:')
        console.log(`• Tests Passed: ${Object.values(this.results.tests).filter(t => t.status === 'pass').length}`)
        console.log(`• Tests Warning: ${Object.values(this.results.tests).filter(t => t.status === 'warning' || t.status === 'partial').length}`)
        console.log(`• Tests Failed: ${Object.values(this.results.tests).filter(t => t.status === 'fail').length}`)
        console.log(`• Recommendations: ${this.results.recommendations.length}`)
        console.log('\n==========================================\n')
    }
}

async function main() {
    const scanner = new SecurityScanner()
    
    try {
        await scanner.runAllTests()
        scanner.generateReport()
        
        // Save detailed results
        const fs = require('fs')
        const resultsPath = 'security-scan-results.json'
        fs.writeFileSync(resultsPath, JSON.stringify(scanner.results, null, 2))
        console.log(`📁 Detailed results saved to: ${resultsPath}`)
        
        return scanner.results
    } catch (error) {
        console.error('❌ Scan failed:', error)
        process.exit(1)
    }
}

// Run if called directly
if (require.main === module) {
    main()
}

module.exports = { SecurityScanner, main }