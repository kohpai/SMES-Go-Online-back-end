'use strict'

const area_type = {
  OFFICE: 'office',
  OUTSIDE: 'outside'
}

const res_type = {
  FAILURE: 'failure',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error',
}

const att_checkin_type = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent'
}

const att_checkout_type = {
  EARLY: 'early',
  LATE: 'late'
}

const event_type = {
  CHECKIN: 'checkin',
  CHECKOUT: 'checkout'
}

export default {
  area_type,
  res_type,
  att_checkin_type,
  att_checkout_type,
  event_type
}