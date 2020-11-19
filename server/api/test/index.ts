import express from 'express'
const app = express()
app.get('/test/aaa', (req: any, res: any) => {
  console.log('aaa')
  res.send('HelloWorld')
})
