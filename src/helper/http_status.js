'use strict'

import HttpStatus from 'http-status-codes'

const send = (res, code, append) => {
  const msg = {
    error:{
      code: HttpStatus[code],
      message: HttpStatus.getStatusText(HttpStatus[code])
    }
  }
  if(append) Object.assign(msg, append);
  return res.status(HttpStatus[code]).json(msg)
}

export default {
  send
}