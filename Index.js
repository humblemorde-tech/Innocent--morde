const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./auth')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // we use pairing code instead
    })

    // Pairing code flow
    if (!sock.authState.creds.registered) {
        const phoneNumber = '255XXXXXXXXX' // <-- User enters their number here
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`Pairing code: ${code}`) // Bot prints code in logs
        console.log('Enter this code in WhatsApp: Linked Devices > Link a Device')
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode!== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        }
        console.log('Connection:', connection)
    })

    sock.ev.on('messages.upsert', async m => {
        // Your commands/features go here
        const msg = m.messages[0]
        if (!msg.message) return
        const text = msg.message.conversation || ''

        if (text === '!ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Pong! Innocent is alive 😎' })
        }
    })
}

startBot()
