import Vue from 'vue'

import { date } from 'quasar'
const { getDateDiff } = date

Vue.mixin({
  methods: {
    timeAgo (str, unit = 'minutes') {
      // alert("john")

      const dateNow = new Date()
      const datOfPost = new Date(str)
      // const unit = 'min'

      const diff = getDateDiff(dateNow, datOfPost, unit)
      const formattedString = {
        years: "yrs'",
        days: "days ago'",
        minutes: "mins ago",
        hours: "hrs ago",
        months: "mth'"
      }
      // alert(diff)
      if (diff >= 60 && unit === 'minutes') {
        return this.timeAgo(str, 'hours')
        // alert("minutes")
      }
      if (diff >= 24 && unit === 'hours') {
        return this.timeAgo(str, 'days')
        // alert("hours")
      }
      if (diff >= 28 && unit === 'days') {
        return this.timeAgo(str, 'months')
      }

      else {
        if (unit === 'months') {
          return datOfPost.toDateString()
        }
        return `${diff} ${formattedString[unit]}`
      }
      // return `${diff} ${unit} ago`
    }
  },
  filters: {
    checkForS (val) {
      return val.endsWith('s') ? `${val}'` : `${val}'s`
    }
  },
})