'use strict'

// package
import { Router } from 'express'
const router = new Router()

// using
import HttpStatus from './../helper/http_status.js'
import ProductsModel from '../models/productsModel.js'
import { Util, Enum } from '../helper'

import FileModel from '../models/fileModel.js'
import NewsModel from "../models/newsModel.js";

router.route('/product/:id/image/:image_id').get((req, res, next) => {
    var id = req.params.id
    var image_id = req.params.image_id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.findImage(id, image_id, (result) => {
        if(result == null || !result.length){
            send.status = Enum.res_type.FAILURE
            send.message = 'file not found'
            return res.json(send)
        }else if(result instanceof Error){
            send.status = Enum.res_type.FAILURE
            send.message = result
            return res.json(send)
        }

        FileModel.readFile(result.image, result.image_name, (result_image) => {
            if(result_image instanceof Error){
                send.status = Enum.res_type.FAILURE
                send.message = result_image
                return res.json(send)
            }

            res.on('finish', () => {
                FileModel.deleteTempFile(result_image, (err) => { })
            })

            return res.sendFile(result_image)
        })
    })

})

router.route('/news/:id/image/:image_id').get((req, res, next) => {
    var id = req.params.id
    var image_id = req.params.image_id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    NewsModel.findImage(id, image_id, (result) => {
        if(result == null || !result.length){
            send.status = Enum.res_type.FAILURE
            send.message = 'file not found'
            return res.json(send)
        }else if(result instanceof Error){
            send.status = Enum.res_type.FAILURE
            send.info = result
            return res.json(send)
        }

        FileModel.readFile(result.image, result.image_name, (result_image) => {
            if(result_image instanceof Error){
                send.status = Enum.res_type.FAILURE
                send.message = result_image
                return res.json(send)
            }

            res.on('finish', () => {
                FileModel.deleteTempFile(result_image, (err) => { })
            })

            return res.sendFile(result_image)
        })
    })

})

export default router
