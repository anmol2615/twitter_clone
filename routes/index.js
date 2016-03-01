'use strict';

module.exports=[
    require('./crudRoutes'),
    require('./userRoutes/userRegister'),
    require('./userRoutes/userLogin'),
    require('./userRoutes/userLogout'),
    require('./userRoutes/editProfileRoute'),
    require('./userRoutes/seeProfileRoute'),
    require('./tweetRoutes/countTweets'),
    require('./userRoutes/uploadPicRoute'),
    require('./tweetRoutes/displayTweets'),
    require('./tweetRoutes/tweet'),
    require('./tweetRoutes/followUnfollow'),
    require('./tweetRoutes/likeTweet'),
    require('./tweetRoutes/reTweetRoute'),
    require('./adminRoutes/adminRegisterRoute'),
    require('./adminRoutes/noOfUsers'),
    require('./adminRoutes/adminLoginRoute'),
    require('./adminRoutes/adminLogoutRoute'),
    require('./adminRoutes/seeUser'),
    require('./adminRoutes/deleteTweetRoute'),
    require('./adminRoutes/allUsersTogether'),
    require('./adminRoutes/deleteUserRoute'),
    require('./adminRoutes/editUserProfile')
];
