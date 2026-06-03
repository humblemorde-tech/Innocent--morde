const phoneNumber = process.env.PHONE_NUMBER || ''
if (!sock.authState.creds.registered && phoneNumber) {
    setTimeout(async () => {
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`Pairing code: ${code.match(/.{1,4}/g).join('-')}`)
    }, 3000)
}
