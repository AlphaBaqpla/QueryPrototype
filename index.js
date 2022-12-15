const dgram = require('dgram')
var crypto = require('crypto')

var server = dgram.createSocket('udp4')
var serverId = BigInt(Math.floor(Math.random() * 10000000000000000)) //RakNet Server ID
const MAGIC = Buffer.from([0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78]) //RakNet MagickData
const un_ping = 0x01 //RakNet Unconnected Ping
const un_pong = 0x1c //RakNet Unconnected Pong
//Bedrock RakNet Pong
function pongBe(port, host, pingTime) {
    let data = Buffer.alloc(17)
    let BeEmiter = 'MCPE;Server Name;50;1.19.50;11;228;'+serverId+';Test;Survival;1' //TODO - добавить конфиг
    data.writeInt8(un_pong, 0)
    data.writeBigInt64BE(pingTime, 1)
    data.writeBigInt64BE(serverId, 9)
    data = Buffer.concat([data, MAGIC], 1024)
    data.writeInt16BE(BeEmiter.length, 33)
    data.write(BeEmiter, 35, BeEmiter.length, 'utf8')
    server.send(data.subarray(0, 35 + BeEmiter.length), port, host, (err) => {
        console.log('Ошибка: '+err)
    })
    console.log('Ответ: '+BeEmiter) //TODO - вывод в debug логгер
}
//Java Query Pong
var token = crypto.randomBytes(16).toString('hex')


















server.on('error', (err) => {
    console.error(`server error:\n${err}`)
});
server.on('message', (msg, rinfo) => {
    if ((msg.readInt8(0) & 0xff) == un_ping){
        try {
            console.log('Запрос Be протокол: '+rinfo.port, rinfo.address, msg)
            pongBe(rinfo.port, rinfo.address, msg.readBigInt64BE(1))
        } catch (err){
            console.error(`сервер отправил корявые данные:\n${msg}\n${err}`)
        }
    }
    else if(msg.readInt8(2) == 9){
        try {
            console.log('Запрос Je протокол: '+rinfo.port, rinfo.address, msg)
        } catch (err){
            console.error(`сервер отправил корявые данные:\n${msg}\n${err}`)
        }
    }
})
server.on('listening', () => {
    const address = server.address();
    console.log(`server started on ${address.address}:${address.port}`)
});
server.on('close', () => {
    try {
        console.log('close')
    } catch (err) {}
});
server.bind(19139, "0.0.0.0")