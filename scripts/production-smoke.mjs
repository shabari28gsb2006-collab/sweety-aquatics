const api = (process.env.SMOKE_API_URL || '').replace(/\/$/, '');
const web = (process.env.SMOKE_WEB_URL || '').replace(/\/$/, '');
if (!api || !web) { console.error('SMOKE_API_URL and SMOKE_WEB_URL are required'); process.exit(2); }
const failures = [];
async function check(name, action) { try { await action(); console.log(`PASS ${name}`); } catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); } }
async function json(path, expected = 200) { const response = await fetch(`${api}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(15_000) }); if (response.status !== expected) throw new Error(`expected ${expected}, received ${response.status}`); const body = await response.json(); return { response, body }; }
await check('frontend loads', async () => { const response = await fetch(web, { signal: AbortSignal.timeout(15_000) }); if (!response.ok || !(await response.text()).includes('<div id="root">')) throw new Error(`frontend HTTP ${response.status}`); });
await check('API liveness', async () => { const { body } = await json('/api/health/live'); if (body?.data?.api !== 'ok') throw new Error('liveness payload invalid'); });
await check('database readiness', async () => { const { body } = await json('/api/health/ready'); if (body?.data?.database !== 'ok') throw new Error('database is not ready'); });
await check('public products', async () => { const { body } = await json('/api/products'); if (!Array.isArray(body?.data)) throw new Error('products payload invalid'); });
await check('contact settings', async () => { const { body } = await json('/api/customer-experience/contact-settings'); if (!body?.data?.email || !body?.data?.whatsapp) throw new Error('contact settings missing'); });
await check('care articles', async () => { const { body } = await json('/api/customer-experience/care-articles'); if (!Array.isArray(body?.data) || body.data.length === 0) throw new Error('care articles are not seeded'); });
await check('admin API protected', async () => { await json('/api/admin/analytics/overview', 401); });
await check('security headers', async () => { const response = await fetch(`${api}/api/health/live`, { signal: AbortSignal.timeout(15_000) }); if (!response.headers.get('x-content-type-options')) throw new Error('X-Content-Type-Options missing'); if (!response.headers.get('x-request-id')) throw new Error('X-Request-Id missing'); });
if (failures.length) { console.error(`${failures.length} smoke check(s) failed`); process.exit(1); }
console.log('All production smoke checks passed');
