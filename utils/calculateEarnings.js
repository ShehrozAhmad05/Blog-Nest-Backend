const Earnings = require("../models/Earning/Earnings")
const Post = require("../models/Post/Post")

//Rate
const RATE_PER_VIEW = 0.01

const calculateEarnings = async () => {
    //get the current date
    const currentDate = new Date()
    //Find all posts
    const posts = await Post.find()
    for (const post of posts) {
        //Count new unique viewers since the last calculation
        const newViewsCount = post.viewers.length - post.lastCalculatedViewsCount
        //calculate earnings based on the number of new unique views
        const earningsAmount = newViewsCount * RATE_PER_VIEW
        //update the earnings for the post
        post.thisMonthEarnings = earningsAmount
        post.totalEarnings += earningsAmount
        //create a new earnings record
        await Earnings.create({
            user: post.author,
            post: post._id,
            amount: earningsAmount,
            calculatedOn: currentDate,
        })
        //update the last calculated views count and next earnings calculation date
        post.lastCalculatedViewsCount = post.viewers.length 
        post.nextEarningDate = new Date(currentDate.getFullYear(),currentDate.getMonth() + 1)
        //save the post
        await post.save()
    }

    console.log("Earnings Calculated", posts)
}

module.exports = calculateEarnings