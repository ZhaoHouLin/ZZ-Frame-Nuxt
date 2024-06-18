import * as fs from 'node:fs'

export default defineEventHandler(async (event) => {
  const filePath = '@/../Data/example.json'

  let json = fs.readFileSync(filePath, 'utf8', (err, data) => {
    if (err) throw err
    const info = data.toString()

    return info
  })

  json = JSON.parse(json)

  return json

})