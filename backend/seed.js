const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    await p.vpnCredentials.upsert({
        where: { id: 'default-openvpn' },
        update: {},
        create: { id: 'default-openvpn', protocol: 'openvpn', username: 'vpnbook', password: 'free2024' }
    });
    console.log('VPN credentials seeded.');
}

main().catch(console.error).finally(() => p.$disconnect());
