import fs from 'fs'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const path = require('path')
const multer = require('multer')

const express = require('express')
const app = express()

app.use(express.static(path.join(__dirname, 'public')))

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const csrf = require('csurf')
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(csrf({ cookie: true }))

app.use(function (err: any, req: any, res: any, next: any) {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err)
  }
  // handle CSRF token errors here
  res.status(403)
  // res.send('form tampered with')
  res.send({ token: req.csrfToken(), errCode: err.code })
})

app.use(function (req: any, res: any, next: any) {
  const token = req.csrfToken()
  res.cookie('XSRF-TOKEN', token)
  res.locals.csrfToken = token
  // console.log('csrf token = ' + token)
  next()
})

function checkCsrftoken (req: any) {
  const bearToken = req.headers.authorization
  console.log(bearToken)
  if (bearToken === undefined) {
    return null
  }

  const bear = bearToken.split(' ')
  let token = ''
  if (bear.length > 0 && bear[0] == 'Bearer') {
    token = bear[1]
  }

  const authUser = jwt.decode(token, SECRET_AUTH_KEY)

  return authUser
}

const SECRET_AUTH_KEY = 'oauthServerSampleSecret'

const config = require('./config.json')[app.get('env')]

const mssql = require('mssql')

const nodemailer = require('nodemailer')

mssql.connect(config.dbConfig)

const transporter = nodemailer.createTransport({
  host: config.MAIL_HOST,
  port: config.MAIL_PORT
  /*
  ,
  secure: config.MAIL_SECURE,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS
  }
  */
})

// const test = require('./test/index')
// app.use('/test', test)

// const upload = multer({ dest: 'uploads/' })
// const csv = require('csv')
// const parse = require('csv').parse

/**
 * 監督ログイン
 *
 * */
app.post('/auth/login/', (req: any, res: any) => {
  const msReq = new mssql.Request()

  const loginid = req.body.loginid
  const password = req.body.password

  msReq.input('loginid', mssql.Int, loginid)
  msReq.input('password', mssql.NVarChar, password)
  const sql = 'SELECT * FROM Ｍ担当者 WHERE 担当者CD=@loginid AND PASSWORD=@password'
  msReq.query(sql).then(function (rec: any) {
    const resUser = {
      userid: rec.recordset[0].担当者CD,
      name: rec.recordset[0].担当者正式名,
      token: ''
    }

    const token = jwt.sign(resUser, SECRET_AUTH_KEY, {
      expiresIn: '3000000'
    })

    resUser.token = token

    return res.json(resUser)
  }).catch(function (err: any) {
    console.log(err)
    return res.json(null)
  })
})

app.get('/auth/user/', (req: any, res: any) => {
//  const headers = req.headers
//  console.log(headers)
  const bearToken = req.headers.authorization
  //  console.log("#2",bearToken)

  let token: any = null

  if (bearToken != undefined) {
    const bear = bearToken.split(' ')

    if (bear.length > 0 && bear[0] == 'Bearer') {
      token = bear[1]
    }
  }
  //  console.log("#2-3",token)

  jwt.verify(token, SECRET_AUTH_KEY, (err: any, decoded: any) => {
    if (err) {
      // 認証NGの場合
      console.log('#2-4', err.message)
      return res.sendStatus(403).json({ error: true })
    } else {
      //      console.log("#2-5", decoded)
      // 認証OKの場合
      req.decoded = decoded

      const authUser = jwt.decode(token, SECRET_AUTH_KEY)
      //  console.log("#2-6")
      if (authUser == null) {
        console.log('#2-7')
        return res.json({ error: true })
      }
      console.log('#3-1', authUser, req.csrfToken())
      return res.json({ user: authUser })
    }
  })
})

app.post('/mail_check', (req: any, res: any) => {
  const authuser = checkCsrftoken(req)
  if (authuser == null) {
    return res.json({})
  }

  let errmsg = ''

  const msReq = new mssql.Request()
  msReq.input('loginid', mssql.Int, authuser.userid)

  const sql = 'SELECT * FROM Ｍ担当者 WHERE 担当者CD=@loginid'
  msReq.query(sql).then((rec: any) => {
    if (rec.recordset.length === 0) {
      return res.json({ ret: 'データが取得できませんでした' })
    }
    const mailAddres = rec.recordset[0].メールアドレス

    const data = {
      from: config.MAIL_FROM,
      to: mailAddres,
      text: '当メールは、通知用メールアドレス宛に配信しております。\nお心当たりのない方はおそれいりますが、システム担当者までご連絡ください。',
      subject: '通知用メールの送信テスト'
    }

    transporter.sendMail(data, (error, info) => {
      if (error) {
        console.log(error)
        return res.json({ ret: error }) // エラー情報
      } else {
        console.log(info)
        return res.json({ ret: mailAddres + 'にメールを送信しました' })
      }
    })
  }).catch((err: any) => {
    return res.json({ ret: 'データが取得できませんでした' })
  })
})

app.post('/password_update', (req: any, res: any) => {
  const authuser = checkCsrftoken(req)
  if (authuser == null) {
    return res.json({})
  }

  const nowpassword = req.body.nowpassword
  const password1 = req.body.password1
  const password2 = req.body.password2

  let errmsg = ''

  console.log(authuser.userid, nowpassword)
  const msReq = new mssql.Request()
  msReq.input('loginid', mssql.Int, authuser.userid)
  msReq.input('password', mssql.NVarChar, nowpassword)
  const sql = 'SELECT * FROM Ｍ担当者 WHERE 担当者CD=@loginid AND PASSWORD=@password'
  msReq.query(sql).then(function (rec: any) {
    if (rec.recordset.length === 0) {
      errmsg += '現在のパスワードが一致していません。\n'
    }

    if (password1 == null) {
      errmsg += '新しいパスワードを入力してください。\n'
    }

    if (password1 !== password2) {
      errmsg += '確認のパスワードと一致していません。\n'
    }

    if (nowpassword === password1) {
      errmsg += 'パスワードを変更してください。\n'
    }

    if (password1.length < 8) {
      errmsg += '新しいパスワードの文字数が8桁未満です。\n'
    }

    if (nowpassword.length > 8) {
      errmsg += '現在のパスワードの文字数が8桁を超えています。\n'
    }
    if (password1.length > 8) {
      errmsg += '新しいパスワードの文字数が8桁を超えています。\n'
    }

    console.log(password1.match(/[a-zA-Z]/), password1.match(/[!@#$%]/), password1.match(/[0-9]/))
    if (!(
      password1.match(/[a-zA-Z]/) &&
      password1.match(/[!@#$%]/) &&
      password1.match(/[0-9]/)
    )) {
      errmsg += '半角英字、数字、記号（ ! @ # $ % のうち一文字以上）\nを全て混在させてください。\n例：@Z0808r#\n'
    }

    if (password1 === authuser.userid) {
      errmsg += 'ＩＤとＰＡＳＳが同じ文言です 。\n'
    }

    let renzokucnt = 0
    for (let i = 1; i < password1.length; i++) {
      console.log(password1.substring(i - 1, i), password1.substring(i, i + 1))
      if (password1.substring(i - 1, i) === password1.substring(i, i + 1)) {
        renzokucnt++
      }
    }
    if (renzokucnt > 0) {
      errmsg += '同じ文字を連続することはできません。\n'
    }

    if (errmsg !== '') {
      res.json({ ret: errmsg })
      return
    }

    const msReq = new mssql.Request()
    msReq.input('loginid', mssql.Int, authuser.userid)
    msReq.input('password', mssql.NVarChar, password1)
    const sql = 'UPDATE Ｍ担当者 SET PASSWORD=@password WHERE 担当者CD=@loginid'
    msReq.query(sql).then((rec: any) => {
      res.json({ ret: 'パスワードを更新しました' })
    }).catch((err: any) => {
      res.json({ ret: '更新失敗' })
    })
  }).catch(function (err: any) {
    errmsg = '現在のパスワードが一致していません'
    console.log('#2')
    res.json({ ret: errmsg })
  })
})

app.get('/get_tani', (req: any, res: any) => {
  if (checkCsrftoken(req) == null) {
    return res.json({})
  }

  const msReq = new mssql.Request()

  const sql = 'SELECT * FROM 単位'
  /*
  const loginid = 26 // req.body.loginid
  const password = 2918 // req.body.password

  msReq.input('loginid', mssql.Int, loginid)
  msReq.input('password', mssql.NVarChar, password)
  const sql = 'SELECT * FROM Ｍ担当者 WHERE 担当者CD=@loginid AND PASSWORD=@password'
*/

  msReq.query(sql).then(function (rec: any) {
    /*
    console.log('#1', rec.recordset[0])
    console.log('#2', rec.recordset[0].担当者CD)
    console.log('#3', rec.recordset[0].担当者正式名)

    console.log(rec.recordset[0].担当者CD)
    console.log(rec.recordset[0].担当者正式名)
    */
    res.json(rec.recordset)
  })
    .catch(function (err: any) {
      console.log(err)
      return res.json(null)
    })
})

app.post('/get_gyousha', (req: any, res: any) => {
  if (checkCsrftoken(req) == null) {
    return res.json({})
  }

  const msReq = new mssql.Request()

  const sql = 'SELECT ' +
        ' 業者CD, 業者正式名, 業者略名, 業者ｶﾅ名' +
        ' FROM ' +
        ' Ｍ業者 ' +
        ' WHERE ' +
        ' 業者正式名+業者略名+業者ｶﾅ名 like \'%%\' ' +
        ' order by 業者ｶﾅ名, 業者正式名'
  msReq.query(sql).then(function (rec: any) {
    const jsonData = []
    for (let i = 0; rec.recordset.length > i; i++) {
      const j = rec.recordset[i]
      const re = { gyoshaCd: j.業者CD, gyoshaName: j.業者正式名, gyoshaShortName: j.業者略名, gyoshaKana: j.業者ｶﾅ名 }
      jsonData.push(re)
    }
    const labelNames = {
      gyoshaCd: { title: '業者CD' },
      gyoshaName: { title: '業者正式名' },
      gyoshaShortName: { title: '業者略名' },
      gyoshaKana: { title: '業者ｶﾅ名' }
    }
    res.json({ data: jsonData, csvtitle: 'gyousha', labels: labelNames })
  })
    .catch(function (err: any) {
      console.log(err)
      return res.json(null)
    })
})

app.post('/get_kantoku', (req: any, res: any) => {
  if (checkCsrftoken(req) == null) {
    return res.json({})
  }

  const msReq = new mssql.Request()

  const sql = 'SELECT ' +
        ' 担当者CD, 担当者正式名' +
        ' FROM Ｍ担当者' +
        ' ORDER BY 担当者ｶﾅ名'
  msReq.query(sql).then(function (rec: any) {
    const jsonData = []
    for (let i = 0; rec.recordset.length > i; i++) {
      const j = rec.recordset[i]
      const re = { tantoushaCd: j.担当者CD, tantoushaName: j.担当者正式名 }
      jsonData.push(re)
    }

    const labelNames = {
      tantoushaCd: { title: '担当者CD' },
      tantoushaName: { title: '担当者正式名' }
    }

    res.json({ data: jsonData, csvtitle: 'kantoku', labels: labelNames })
  })
    .catch(function (err: any) {
      console.log(err)
      return res.json(null)
    })
})

app.post('/get_saimoku', (req: any, res: any) => {
  if (checkCsrftoken(req) == null) {
    return res.json({})
  }

  const msReq = new mssql.Request()

  const sql = 'SELECT ' +
        ' s.細目CD, s.細目正式名,s.細目略名, s.工種CD, k.工種正式名, k.工種略名 ' +
        ' FROM Ｍ細目 s ' +
        ' LEFT JOIN Ｍ工種 k ON k.工種CD=s.工種CD ' +
        ' WHERE s.未使用FLG=0'
  msReq.query(sql).then(function (rec: any) {
    const jsonData = []
    for (let i = 0; rec.recordset.length > i; i++) {
      const j = rec.recordset[i]
      const re = { col1: j.細目CD, col2: j.細目正式名, col3: j.細目略名, col4: j.工種CD, col5: j.工種正式名, col6: j.工種略名 }
      jsonData.push(re)
    }
    const labelNames = {
      col1: { title: '細目CD' },
      col2: { title: '細目正式名' },
      col3: { title: '細目略名' },
      col4: { title: '工種CD' },
      col5: { title: '工種正式名' },
      col6: { title: '工種略名' }
    }
    res.json({ data: jsonData, csvtitle: 'saimoku', labels: labelNames })
  })
    .catch(function (err: any) {
      console.log(err)
      return res.json(null)
    })
})

app.get('/get_oshirase', (req: any, res: any) => {
  if (checkCsrftoken(req) == null) {
    return res.json({})
  }

  const msReq = new mssql.Request()

  const sql = 'SELECT * FROM お知らせ WHERE ID = 3'

  msReq.query(sql).then(function (rec: any) {
    console.log(rec.recordset[0].コメント)

    res.json({comment: rec.recordset[0].コメント})
  })
    .catch(function (err: any) {
      console.log(err)
      return res.json(null)
    })
})

app.get("/", function(req, res) {
  res.send("HelloWorld")
})

const GMOURL='https://api.gmo-agree.com/agree-api/v0/api/'
const SECRET_KEY = "AGR1hGZEIaLvnJBI7DvWhsXMm929djjwQjEYEmzDZc"
const CUS_ID = "IA015150811" // 顧客ID 10/5～10/31
async function getGmoJson() {
    let res = null

    await axios(
      {
        method: 'post',
        url: GMOURL+'accesstoken/generate',
        headers: {'Content-Type': 'application/json'},
        data: '{"secret_key":SECRET_KEY,"cus_id":CUS_ID}'
      }
      ).then(response => {
        console.log('success', response.status)
        res=response.data
      })
      .catch(error => {
        console.log('error', error.response.status)
      })
      .finally(_ => {
        console.log('finished')
      })
    return res
}


app.get('/movies', (req, res) => {
  const param={
    order: [
      ['id','ASC']
    ],
    attributes:
      ['id','title']
    }
    movie.findAll(param).then((movies) => {
      res.json(movies)
    })
})

app.get('/bacs', (req, res) => {

  const param={
    order: [
      ['id','DESC']
    ],
    attributes:
      ['reception_number','building_code','room_number','kname','block_code','title','reception_ts','dept_code','ankentaiousha_id','uketsukebuka_shain_code','status',
'updated_at',[sequelize.fn('to_char',  sequelize.col('updated_at'), 'MM/DD HH24:MI:SS'), 'updatedTime'],'updated_by','deleted']
    }
    bacs.findAll(param).then((bacs) => {
      res.json(bacs)
    })
})

app.get('/bacs_update',  (req, res) => {
  const dir = '/var/www/bacs_link_test/'
  //  const dir = '/home/shuji/bacs_link_dev/'
  /*
      bacs.findOne({
        where: {
          reception_number: reception_number
        }
      }).then((item) => {
        if(item==null){
          bacs.create(
          {
            reception_number: reception_number,
            building_code: data[1],
            room_number: data[2],
            kname: data[3],
            block_code: data[4],
            title: data[5], 
            reception_ts: data[6],
            dept_code: data[7],
            ankentaiousha_id: data[8],
            uketsukebuka_shain_code: data[9],
            status: data[10],
            updated_at: data[11],
            updated_by: data[12],
            deleted: data[13]
          }
          )
        }else{
          item.reception_number = reception_number
          item.building_code = data[1]
          item.room_number = data[2]
          item.kname = data[3]
          item.block_code = data[4]
          item.title = data[5]
          item.reception_ts = data[6]
          item.dept_code = data[7]
          item.ankentaiousha_id = data[8]
          item.uketsukebuka_code = data[9]
          item.uketsukebuka_shain_code = data[10]
          item.status = data[11]
          item.updated_at = data[12]
          item.updated_by = data[13]
          item.deleted = data[14]
          item.save()
        }
      });
*/

  try{

    fs.readdir(dir, function(err, files){
      if (err) throw err;

      for(const fi in files){
        const reception_number = files[fi]
        let filePath = dir+reception_number
        console.log(filePath+' start ');

        const parser = parse((err, data1)=>{
          console.log(reception_number);
          const data=data1[0]

          bacs.create(
          {
            reception_number: reception_number,
            building_code: data[1],
            room_number: data[2],
            kname: data[3],
            block_code: data[4],
            title: data[5], 
            reception_ts: data[6],
            dept_code: data[7],
            ankentaiousha_id: data[8],
            uketsukebuka_shain_code: data[9],
            status: data[10],
            updated_at: data[11],
            updated_by: data[12],
            deleted: data[13]
          }
          )
        });

        var p = fs.createReadStream(filePath).pipe(parser)
                p.on('end', function (){

                      fs.copyFile(filePath, '/var/www/bacs_link/dev/'+reception_number, (err) => {
                          if (err) {
                              console.log(err.stack);
                          }
                          else {
                              console.log('copy Done.')

                              fs.unlinkSync(filePath)
                              console.log(filePath+' deleted')

                          }
                      })

                     })

      }

    });

  }catch(err){
    console.log(err.name + ': ' + err.message);
  }

  res.json({ret: 'success'})
})


app.post('/movie_regist', (req, res) => {

  const id1 = req.body.id
  console.log('id', id1)

  const title = req.body.title
  console.log('title', title)

  const param = {
    title: title
  }

  if (id1!='') {
    const filter = {
      where: {
        id: id1
      }
    }
    movie.update(param, filter)
      .then((record) => {
    })
    .catch((err) => {
      console.log(err)
      res.json({ret: err})
    });
  }else{
    movie.create(param)
    .then((record) => {
    })
    .catch((err) => {
      console.log(err)
      res.json({ret: err})
    });
  }
  res.json({ret: 'success'})

})

app.post('/movie_delete', (req, res) => {
  const id1 = req.body.id
  console.log('id', id1)

  const filter = {
    where: {
        id: id1
    }
  };

  movie.destroy(filter)
  .then((record) => {
  })
  .catch((err) => {
    console.log(err)
    res.json({ret: err})
  });
  res.json({ret: 'success'})
/*
  movie.findById(id)
  .then((record) => {
    if (record) {
    } else {
      const error='id:' + id + 'not found'
      console.log(error)
      res.json('error', error)
    }
  })
  .catch((err) => {
      console.log(err)
      res.json('err', err)
  });
*/
})


app.get('/gmo_get_access_token', async(req, res) => {
	let resp = null
    await axios(
      {
        method: 'post',
        url: GMOURL+'accesstoken/generate',
        headers: {'Content-Type': 'application/json'},
        data: '{"secret_key":"'+SECRET_KEY+'","cus_id":"'+CUS_ID+'"}'
      }
      ).then(response => {
        console.log('success', req.url +' '+ response.status)
        resp=response.data
      })
      .catch(error => {
        console.log('error', error.response.status)
      })
      .finally(_ => {
//        console.log('finished')
      })

  res.json({post: resp, access_token: resp.result.access_token})

})

app.post('/gmo_get_transaction_id', async(req, res) => {


  const data = '{"secret_key":"'+SECRET_KEY+'","cus_id":"'+CUS_ID+'","access_token":"'+req.body.accessToken+'"}'

  console.log(data)

  let resp = null
  await axios(
  {
    method: 'post',
    url: GMOURL+'transaction/get',
    headers: {'Content-Type': 'application/json'},
    data: data
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//        console.log('finished')
  })

//  console.log('#end',resp.result.xid)

  res.json({xid: resp.result.xid})

})

//文書取得
app.post('/gmo_get_document', async(req, res) => {

  const data = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '","xid":"'+req.body.xid+
    '","download_type":"'+req.body.download_type+
    '","operation":"'+req.body.operation+
//    '","control_number":"'+req.body.control_number+
    '"}'

  console.log(data)

  let resp = null
  await axios(
  {
    method: 'post',
    url: GMOURL+'document/getAll',
    headers: {'Content-Type': 'application/json'},
    data: data
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//        console.log('finished')
  })

   console.log('#end',resp)

  res.json({documents_url: resp.result.documents_url})

})
//管理番号取得
app.post('/gmo_get_control_number', async(req, res) => {

  const data = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '"}'

  console.log(data)

  let resp = null
  await axios(
  {
    method: 'post',
    url: GMOURL+'document/controlNumber',
    headers: {'Content-Type': 'application/json'},
    data: data
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//		        console.log('finished')
  })

  console.log('#end',resp)

  res.json({result: resp.result})

})

//文書状態取得
app.post('/gmo_get_document_status', async(req, res) => {

  const data = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '","xid":"'+req.body.xid+
    '"}'

  console.log(data)

  let resp = null
  await axios(
  {
    method: 'post',
    url: GMOURL+'document/status',
    headers: {'Content-Type': 'application/json'},
    data: data
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//		        console.log('finished')
  })

  console.log('#end',resp.result)

  res.json({result: resp.result})

})


//文書アップロード
app.post('/gmo_upload_doc', multer({ dest: 'tmp/' }).single('uploadFile'), async(req, res) => {


  const fileData=fs.readFileSync(req.file.path)

  let document = Buffer.from(fileData).toString('base64') ;

  const data = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '","xid":"'+req.body.xid+
    '","document":"'+document+
    '"}'

  let resp = null
  await axios(
  {
    method: 'post',
    url: GMOURL+'document/register',
    headers: {'Content-Type': 'application/json'},
    data: data
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//		        console.log('finished')
  })

  console.log('#end1',resp)


  //文書情報登録
  const data2 = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '","xid":"'+req.body.xid+
    '","document_name":"'+req.file.originalname+
//    '","post_nm":"'+req.body.post_nm+
    '","name_nm":"'+'tantousha'+
    '","document_type":"'+'3'+
    '","is_workflow_show":"'+'2'+ //2:指定しない
    '"}'

  console.log('#start2',data2)

  await axios(
  {
    method: 'post',
    url: GMOURL+'document/registerInfo',
    headers: {'Content-Type': 'application/json'},
    data: data2
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//		        console.log('finished')
  })

  console.log('#end2',resp)


  //文書位置設定
  const data3 = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '","xid":"'+req.body.xid+
    '","own_name_nm":"差出人会社名'+
    '","own_organize_nm":"差出人'+
    '","is_signing_field":"1'+
    '","fill_text_field":[{"tag":"date'+
    '","fill_text":"2020-07-29'+
    '","point_start_x":"33'+
    '","point_start_y":"33'+
    '","point_end_x":"66'+
    '","point_end_y":"66'+
    '","page_no":"1"}],"our_signing_field":[{"signer_nm":"奥村'+
    '","request_mail":"shuji@freemind.co.jp'+
    '","is_compilation_mail":"1'+
    '","comment":"コメント'+
    '","signing_point_start_x":"33'+
    '","signing_point_start_y":"33'+
    '","signing_point_end_x":"66'+
    '","signing_point_end_y":"66'+
    '","page_no":"1'+
    '"}],"partner_signing_field":[{"organize_nm":"送信先会社'+
    '","name_nm":"送信先担当者'+
    '","email":"shuji+1@freemind.co.jp'+
    '","comment":"こめんと'+
    '","is_request_sign":"1'+
    '","document_type":"3'+
    '","is_send_mail":"1'+
    '","is_compilation_mail":"1'+
    '","is_signer_change":"2'+
    '","is_verification_use":"2'+
    '","signing_point_start_x":"33'+
    '","signing_point_start_y":"33'+
    '","signing_point_end_x":"66'+
    '","signing_point_end_y":"66'+
    '","page_no":"1'+
    '"}]'+
    '}'

  console.log('#start3',data3)

  await axios(
  {
    method: 'post',
    url: GMOURL+'document/registerPosition',
    headers: {'Content-Type': 'application/json'},
    data: data3
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.data)
  })
  .finally(_ => {
//		        console.log('finished')
  })

  console.log('#end3',resp)


  res.json({result: resp})

})


//文書詳細取得
app.post('/gmo_get_document_detail', async(req, res) => {

  const data = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '","xid":"'+req.body.xid+
    '","control_number":"'+req.body.control_number +
    '","operation":"1' +
    '"}'

  console.log(data)

  let resp = null
  await axios(
  {
    method: 'post',
    url: GMOURL+'document/detail',
    headers: {'Content-Type': 'application/json'},
    data: data
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//		        console.log('finished')
  })

  console.log('#end',resp.result)

  res.json({result: resp.result})

})


//文書削除
app.post('/gmo_document_delete', async(req, res) => {

  const data = '{"secret_key":"'+SECRET_KEY+
    '","cus_id":"'+CUS_ID+
    '","access_token":"'+req.body.access_token+
    '","xid":"'+req.body.xid+
    '"}'

  console.log(data)

  let resp = null
  await axios(
  {
    method: 'post',
    url: GMOURL+'document/delete',
    headers: {'Content-Type': 'application/json'},
    data: data
  }
  ).then(response => {
    console.log('success', req.url +' '+ response.status)
    resp=response.data
  })
  .catch(error => {
    console.log('error', error.response.status)
  })
  .finally(_ => {
//		        console.log('finished')
  })

  console.log('#end',resp.result)

  res.json({result: resp.result})

})

module.exports = {
  path: "/api/",
  handler: app,
}