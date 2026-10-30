import type { ReadStream, WriteStream } from 'node:tty'

export async function readOwnerPassword(input: ReadStream, output: WriteStream) {
  while (true) {
    output.write('Password pemilik (12–128 karakter, input tersembunyi): ')
    const password = await new Promise<string>((resolve, reject) => {
      let value = ''
      function receive(chunk: string) {
        for (const character of chunk) {
          if (character === '\u0003' || character === '\r' || character === '\n') {
            input.off('data', receive)
            input.setRawMode(false)
            input.pause()
            output.write('\n')
            if (character === '\u0003') reject(new Error('Dibatalkan'))
            else resolve(value)
            return
          }
          if (character === '\u007f' || character === '\b') value = value.slice(0, -1)
          else if (character >= ' ' && value.length < 129) value += character
        }
      }
      input.setEncoding('utf8')
      input.setRawMode(true)
      input.on('data', receive)
      input.resume()
    })
    if (password.length >= 12 && password.length <= 128) return password
    output.write('Password harus 12–128 karakter. Silakan coba lagi.\n')
  }
}
